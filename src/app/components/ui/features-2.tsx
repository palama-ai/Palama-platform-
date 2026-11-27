import { ReactNode } from 'react'
import { BentoItem } from './cybernetic-bento-grid'

interface FeaturesProps {
    featuresSubtitle?: string;
}

export function Features({ featuresSubtitle = "Capabilities" }: FeaturesProps) {
    return (
        <section style={{ padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#000' }}>
            <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 24px' }}>
                <div style={{ marginBottom: 64, maxWidth: 600 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#737373' }}>
                        {featuresSubtitle}
                    </span>
                    <h2 style={{ marginTop: 12, fontSize: 'clamp(1.875rem, 4vw, 2.25rem)', fontWeight: 600, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.2 }}>
                        Built to cover your needs
                    </h2>
                    <p style={{ marginTop: 16, fontSize: '0.875rem', color: '#a3a3a3', lineHeight: 1.6 }}>
                        Palama brings together intelligence, execution, and control into a single unified agent — without the complexity.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                    <Card
                        number="01"
                        title="Autonomous Execution"
                        description="Give Palama a goal and step away. It reasons, plans, selects tools, and executes across your digital environment without hand-holding."
                    />
                    <Card
                        number="02"
                        title="Multi-Model Intelligence"
                        description="Not locked to one model. Palama dynamically routes each sub-task to the most capable model — from frontier reasoning to fast local inference."
                    />
                    <Card
                        number="03"
                        title="Safe by Design"
                        description="Every action is sandboxed, logged, and reversible. You configure what Palama can touch — and audit exactly what it did."
                    />
                </div>
            </div>
        </section>
    )
}

function Card({ number, title, description }: { number: string, title: string, description: string }) {
    return (
        <BentoItem className="w-full !p-0">
            <div style={{ padding: '24px', background: 'transparent' }}>
                <div style={{ marginBottom: 20 }}>
                    <div style={{ 
                        width: 32, 
                        height: 32, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        borderRadius: 4, 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        background: '#111',
                        color: '#fff',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        fontFamily: 'monospace'
                    }}>
                        {number}
                    </div>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: 8, letterSpacing: '-0.01em' }}>
                    {title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#a3a3a3', lineHeight: 1.6 }}>
                    {description}
                </p>
            </div>
        </BentoItem>
    )
}
