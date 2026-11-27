"use client";
import React, { useEffect, useRef } from 'react';
import { Activity, Globe, Shield, Database, Zap, Terminal } from 'lucide-react';

// Reusable BentoItem component
export const BentoItem = ({ className = "", children }: { className?: string, children: React.ReactNode }) => {
    const itemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const item = itemRef.current;
        if (!item) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            item.style.setProperty('--mouse-x', `${x}px`);
            item.style.setProperty('--mouse-y', `${y}px`);
        };

        item.addEventListener('mousemove', handleMouseMove);

        return () => {
            item.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div ref={itemRef} className={`bento-item p-6 ${className}`}>
            <div className="relative z-10 h-full flex flex-col">
                {children}
            </div>
        </div>
    );
};

// Main Component
export const CyberneticBentoGrid = () => {
    return (
        <div className="main-container py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-6xl mx-auto z-10 relative">
                <h1 className="text-4xl sm:text-5xl font-bold text-white text-center mb-12">Core Features</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bento-grid">
                    <BentoItem className="col-span-1 md:col-span-2 row-span-2 flex flex-col justify-between">
                        <div>
                            <Activity className="w-8 h-8 text-white mb-4" />
                            <h2 className="text-2xl font-bold text-white">Real-time Analytics</h2>
                            <p className="mt-2 text-gray-400">Monitor your application's performance with up-to-the-second data streams and visualizations.</p>
                        </div>
                        <div className="mt-6 h-48 rounded-lg overflow-hidden relative">
                            <img 
                                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" 
                                alt="Data visualization dashboard" 
                                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-300"
                            />
                        </div>
                    </BentoItem>
                    <BentoItem>
                        <Globe className="w-6 h-6 text-white mb-4" />
                        <h2 className="text-xl font-bold text-white">Global CDN</h2>
                        <p className="mt-2 text-gray-400 text-sm">Deliver content at lightning speed, no matter where your users are.</p>
                    </BentoItem>
                    <BentoItem>
                        <Shield className="w-6 h-6 text-white mb-4" />
                        <h2 className="text-xl font-bold text-white">Secure Auth</h2>
                        <p className="mt-2 text-gray-400 text-sm">Enterprise-grade authentication and user management built-in.</p>
                    </BentoItem>
                    <BentoItem className="row-span-2 flex flex-col justify-between">
                        <div>
                            <Database className="w-6 h-6 text-white mb-4" />
                            <h2 className="text-xl font-bold text-white">Automated Backups</h2>
                            <p className="mt-2 text-gray-400 text-sm mb-4">Your data is always safe with automated, redundant backups.</p>
                        </div>
                        <div className="h-44 rounded-lg overflow-hidden">
                            <img 
                                src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=400" 
                                alt="Server backups" 
                                className="w-full h-full object-cover opacity-70"
                            />
                        </div>
                    </BentoItem>
                    <BentoItem className="col-span-1 md:col-span-2">
                        <Zap className="w-6 h-6 text-white mb-4" />
                        <h2 className="text-xl font-bold text-white">Serverless Functions</h2>
                        <p className="mt-2 text-gray-400 text-sm">Run your backend code without managing servers. Scale infinitely with ease.</p>
                    </BentoItem>
                    <BentoItem className="col-span-1 md:col-span-2">
                        <Terminal className="w-6 h-6 text-white mb-4" />
                        <h2 className="text-xl font-bold text-white">CLI Tool</h2>
                        <p className="mt-2 text-gray-400 text-sm">Manage your entire infrastructure from the command line.</p>
                    </BentoItem>
                </div>
            </div>
        </div>
    );
};
