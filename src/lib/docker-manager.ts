/**
 * Docker Container Manager
 * ========================
 * Manages Docker containers for Palama cloud computers.
 * Each container gets unique ports for Agent API, noVNC, and VNC.
 *
 * Uses `docker` CLI directly (no SDK dependency needed).
 */

import { exec, execFile } from 'child_process'
import { promisify } from 'util'
import { readFileSync } from 'fs'
import { join } from 'path'
import crypto from 'crypto'

const execAsync = promisify(exec)
const execFileAsync = promisify(execFile)

/**
 * Read the OPENROUTER_API_KEY from palama-agent/.env file.
 * Falls back to process.env if the file doesn't exist.
 */
function getOpenRouterKey(): string {
  try {
    const envPath = join(process.cwd(), 'palama-agent', '.env')
    const content = readFileSync(envPath, 'utf-8')
    const match = content.match(/^OPENROUTER_API_KEY=(.+)$/m)
    if (match) return match[1].trim()
  } catch { /* ignore */ }
  return process.env.OPENROUTER_API_KEY || ''
}

// Base ports — each new container increments from these
const BASE_AGENT_PORT = 8020
const BASE_NOVNC_PORT = 6100
const BASE_VNC_PORT = 5920

// The Docker image to use for new containers
const PALAMA_IMAGE = 'docker-palama-agent:latest'

export interface ContainerPorts {
  agentPort: number
  novncPort: number
  vncPort: number
}

export interface ContainerInfo {
  containerId: string
  containerName: string
  ports: ContainerPorts
  status: string
  agentUrl: string
  vncUrl: string
}

/**
 * Run a docker CLI command and return stdout.
 * Supports both string command and arguments array for cross-platform reliability.
 * Throws on non-zero exit code.
 */
async function dockerExec(args: string | string[]): Promise<string> {
  try {
    if (Array.isArray(args)) {
      const { stdout } = await execFileAsync('docker', args, {
        timeout: 120_000, // 2 minutes for pull/build operations
      })
      return (stdout || '').trim()
    } else {
      const { stdout } = await execAsync(`docker ${args}`, {
        timeout: 120_000,
      })
      return (stdout || '').trim()
    }
  } catch (error: any) {
    const msg = error.stderr || error.stdout || error.message || String(error)
    const cmdStr = Array.isArray(args) ? `docker ${args.join(' ')}` : `docker ${args}`
    console.error(`[DockerManager] Command failed: ${cmdStr}`)
    console.error(`[DockerManager] Error: ${msg}`)
    throw new Error(`Docker command failed: ${msg}`)
  }
}

/**
 * Find the next available port set by inspecting running palama-sandbox containers.
 */
async function findAvailablePorts(): Promise<ContainerPorts> {
  try {
    // List all palama-sandbox containers (running or stopped) and their port mappings
    const output = await dockerExec([
      'ps',
      '-a',
      '--filter',
      'name=palama-sandbox-',
      '--format',
      '{{.Ports}}',
    ])

    const usedAgentPorts = new Set<number>()
    const usedNovncPorts = new Set<number>()
    const usedVncPorts = new Set<number>()

    if (output) {
      // Parse port mappings like "0.0.0.0:8010->8001/tcp, 0.0.0.0:6090->6080/tcp"
      const lines = output.split('\n')
      for (const line of lines) {
        const portMappings = line.match(/0\.0\.0\.0:(\d+)->/g)
        if (portMappings) {
          for (const mapping of portMappings) {
            const port = parseInt(mapping.match(/(\d+)/)?.[1] || '0', 10)
            if (port >= BASE_AGENT_PORT && port < BASE_AGENT_PORT + 100) {
              usedAgentPorts.add(port)
            } else if (port >= BASE_NOVNC_PORT && port < BASE_NOVNC_PORT + 100) {
              usedNovncPorts.add(port)
            } else if (port >= BASE_VNC_PORT && port < BASE_VNC_PORT + 100) {
              usedVncPorts.add(port)
            }
          }
        }
      }
    }

    // Find the first available port offset
    let offset = 0
    while (
      usedAgentPorts.has(BASE_AGENT_PORT + offset) ||
      usedNovncPorts.has(BASE_NOVNC_PORT + offset) ||
      usedVncPorts.has(BASE_VNC_PORT + offset)
    ) {
      offset++
      if (offset > 99) throw new Error('No available port slots (max 100 containers)')
    }

    return {
      agentPort: BASE_AGENT_PORT + offset,
      novncPort: BASE_NOVNC_PORT + offset,
      vncPort: BASE_VNC_PORT + offset,
    }
  } catch (error: any) {
    // If no containers exist, start from base ports
    if (error.message?.includes('Docker command failed')) {
      throw error
    }
    return {
      agentPort: BASE_AGENT_PORT,
      novncPort: BASE_NOVNC_PORT,
      vncPort: BASE_VNC_PORT,
    }
  }
}

/**
 * Check if the Docker image exists locally.
 */
async function imageExists(): Promise<boolean> {
  try {
    await dockerExec(['image', 'inspect', PALAMA_IMAGE])
    return true
  } catch {
    return false
  }
}

/**
 * Build the Docker image if it doesn't exist.
 */
async function ensureImage(): Promise<void> {
  if (await imageExists()) {
    console.log('[DockerManager] Image already exists:', PALAMA_IMAGE)
    return
  }

  console.log('[DockerManager] Building image...')
  // Build from the palama-agent directory
  const buildContext = process.cwd().replace(/\\/g, '/')
  const palamaDir = `${buildContext}/palama-agent`
  await dockerExec([
    'build',
    '-t',
    PALAMA_IMAGE,
    '-f',
    `${palamaDir}/docker/Dockerfile`,
    palamaDir,
  ])
  console.log('[DockerManager] Image built successfully')
}

/**
 * Create and start a new container for a machine.
 */
export async function createContainer(
  machineId: string,
  name: string,
  cpuCores: number = 2,
  memoryGb: number = 4
): Promise<ContainerInfo> {
  // Ensure image exists
  await ensureImage()

  // Find available ports
  const ports = await findAvailablePorts()
  const containerName = `palama-sandbox-${machineId}`

  console.log(`[DockerManager] Creating container: ${containerName}`)
  console.log(`[DockerManager] Ports: agent=${ports.agentPort}, noVNC=${ports.novncPort}, VNC=${ports.vncPort}`)

  // Ensure any previous conflicting container with the same name is removed first
  try {
    await dockerExec(['rm', '-f', containerName])
  } catch {
    // Ignore error if it didn't exist
  }

  const vncPassword = crypto.randomBytes(12).toString('base64url')
  const containerInternalKey = (process.env.INTERNAL_API_KEY || '').trim() || crypto.randomBytes(24).toString('base64url')

  const runArgs: string[] = [
    'run',
    '-d',
    '--name',
    containerName,
    // Bind container ports strictly to loopback (reverse proxy handles public auth)
    '-p',
    `127.0.0.1:${ports.agentPort}:8001`,
    '-p',
    `127.0.0.1:${ports.novncPort}:6080`,
    '-p',
    `127.0.0.1:${ports.vncPort}:5900`,
    // Network / Host access
    '--add-host=host.docker.internal:host-gateway',
    // Environment
    '-e',
    'DISPLAY=:1',
    '-e',
    'SCREEN_WIDTH=1280',
    '-e',
    'SCREEN_HEIGHT=800',
    '-e',
    'SCREEN_DEPTH=24',
    '-e',
    `VNC_PASSWORD=${vncPassword}`,
    '-e',
    'PALAMA_WORKSPACE_DIR=/home/user/Desktop/workstation',
    '-e',
    'LLM_MODEL=qwen/qwen3-vl-235b-a22b-instruct',
    '-e',
    'LLM_VISION_MODEL=qwen/qwen3-vl-235b-a22b-instruct',
    '-e',
    'LLM_FAST_MODEL=qwen/qwen3-235b-a22b',
    '-e',
    'OMNIROUTE_BASE_URL=http://host.docker.internal:20128',
    '-e',
    'LLM_BASE_URL=http://host.docker.internal:20128/v1',
    '-e',
    `INTERNAL_API_KEY=${containerInternalKey}`,
    '-e',
    'AGENT_MAX_STEPS=50',
    '-e',
    'ACTION_DELAY_MS=500',
    '-e',
    'MEMORY_ENABLED=true',
    '-e',
    'MEMORY_DB_PATH=/home/user/.palama/memory.db',
    // Resource limits
    '--cpus',
    `${cpuCores}.0`,
    '-m',
    `${memoryGb}g`,
    '--shm-size=256m',
    // Restart policy
    '--restart',
    'unless-stopped',
    // Image
    PALAMA_IMAGE,
  ]

  // Run the container
  const containerId = await dockerExec(runArgs)

  console.log(`[DockerManager] Container created: ${containerId.substring(0, 12)}`)

  return {
    containerId: containerId.substring(0, 12),
    containerName,
    ports,
    status: 'running',
    agentUrl: `http://localhost:${ports.agentPort}`,
    vncUrl: `http://localhost:${ports.novncPort}`,
  }
}

/**
 * Start a stopped container.
 */
export async function startContainer(machineId: string): Promise<ContainerInfo | null> {
  const containerName = `palama-sandbox-${machineId}`

  try {
    // Check if container exists
    const inspectOutput = await dockerExec([
      'inspect',
      '--format',
      '{{.State.Status}}',
      containerName,
    ])

    const status = inspectOutput.trim().replace(/"/g, '')

    if (status === 'running') {
      // Already running, get ports
      const ports = await getContainerPorts(containerName)
      if (!ports) throw new Error('Could not determine container ports')

      return {
        containerId: containerName,
        containerName,
        ports,
        status: 'running',
        agentUrl: `http://localhost:${ports.agentPort}`,
        vncUrl: `http://localhost:${ports.novncPort}`,
      }
    }

    // Start the stopped container
    await dockerExec(['start', containerName])
    console.log(`[DockerManager] Container started: ${containerName}`)

    // Get ports
    const ports = await getContainerPorts(containerName)
    if (!ports) throw new Error('Could not determine container ports after start')

    return {
      containerId: containerName,
      containerName,
      ports,
      status: 'running',
      agentUrl: `http://localhost:${ports.agentPort}`,
      vncUrl: `http://localhost:${ports.novncPort}`,
    }
  } catch (error: any) {
    console.error(`[DockerManager] Failed to start container ${containerName}:`, error.message)
    return null
  }
}

/**
 * Stop a running container.
 */
export async function stopContainer(machineId: string): Promise<boolean> {
  const containerName = `palama-sandbox-${machineId}`
  try {
    await dockerExec(['stop', containerName])
    console.log(`[DockerManager] Container stopped: ${containerName}`)
    return true
  } catch (error: any) {
    console.error(`[DockerManager] Failed to stop container ${containerName}:`, error.message)
    return false
  }
}

/**
 * Remove a container completely (stop + remove).
 */
export async function removeContainer(machineId: string): Promise<boolean> {
  const containerName = `palama-sandbox-${machineId}`
  try {
    // Force remove (stops if running)
    await dockerExec(['rm', '-f', containerName])
    console.log(`[DockerManager] Container removed: ${containerName}`)
    return true
  } catch (error: any) {
    console.error(`[DockerManager] Failed to remove container ${containerName}:`, error.message)
    return false
  }
}

/**
 * Get the status of a container.
 */
export async function getContainerStatus(machineId: string): Promise<string> {
  const containerName = `palama-sandbox-${machineId}`
  try {
    const output = await dockerExec([
      'inspect',
      '--format',
      '{{.State.Status}}',
      containerName,
    ])
    return output.trim().replace(/"/g, '')
  } catch {
    return 'not_found'
  }
}

/**
 * Get port mappings for a running container.
 */
async function getContainerPorts(containerName: string): Promise<ContainerPorts | null> {
  try {
    const output = await dockerExec([
      'port',
      containerName,
    ])

    // Parse output like:
    // 5900/tcp -> 0.0.0.0:5910
    // 6080/tcp -> 0.0.0.0:6090
    // 8001/tcp -> 0.0.0.0:8010
    let agentPort = 0
    let novncPort = 0
    let vncPort = 0

    const lines = output.split('\n')
    for (const line of lines) {
      const match = line.match(/(\d+)\/tcp\s*->\s*0\.0\.0\.0:(\d+)/)
      if (match) {
        const containerPort = parseInt(match[1], 10)
        const hostPort = parseInt(match[2], 10)
        if (containerPort === 8001) agentPort = hostPort
        else if (containerPort === 6080) novncPort = hostPort
        else if (containerPort === 5900) vncPort = hostPort
      }
    }

    if (agentPort && novncPort && vncPort) {
      return { agentPort, novncPort, vncPort }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Wait for the agent inside a container to become healthy.
 * Polls the /health endpoint with retries.
 */
export async function waitForAgentHealth(
  agentUrl: string,
  maxRetries: number = 30,
  intervalMs: number = 2000
): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${agentUrl}/health`, {
        signal: AbortSignal.timeout(3000),
      })
      if (response.ok) {
        console.log(`[DockerManager] Agent healthy at ${agentUrl} after ${i + 1} attempts`)
        return true
      }
    } catch {
      // Agent not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  console.error(`[DockerManager] Agent at ${agentUrl} did not become healthy after ${maxRetries} attempts`)
  return false
}
