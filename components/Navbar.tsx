"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, GraduationCap, ArrowRight } from 'lucide-react';
import { ModeToggle } from './ThemeToggle';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-4 left-6 right-6 z-50 transition-all duration-500 rounded-[2rem] border border-white/20 ${scrolled || isMenuOpen
            ? 'bg-white/80 backdrop-blur-xl shadow-elevated py-4'
            : 'bg-white/40 backdrop-blur-md shadow-sm py-5'
            }`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="bg-primary text-white p-2.5 rounded-2xl group-hover:rotate-12 transition-all shadow-premium">
                        <GraduationCap size={24} strokeWidth={2.5} />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-dark">
                        HOSTEL<span className="text-primary underline decoration-4 decoration-accent underline-offset-4">HUB</span>
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 font-bold text-dark-light text-sm tracking-wide">
                    <ModeToggle />
                    <Link href="/search" className="hover:text-primary transition-colors uppercase tracking-widest font-black">
                        Find Hostels
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <div className="flex items-center gap-4 md:hidden">
                    <ModeToggle />
                    <button
                        className="p-3 bg-light text-dark rounded-xl"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-4 right-4 mt-2 bg-white rounded-[2rem] p-8 shadow-2xl flex flex-col gap-6 animate-scale-in border border-gray-50 z-[100]">
                    <Link href="/search" onClick={() => setIsMenuOpen(false)} className="text-xl font-black text-dark py-4 border-b border-gray-50 flex items-center justify-between">
                        Find Hostels <ArrowRight size={20} className="text-primary" />
                    </Link>
                </div>
            )}
        </nav>
    );
}
