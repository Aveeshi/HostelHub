"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, MapPin, ShieldCheck, Zap,
  Star, Users, Navigation, Globe, Search,
  ChevronRight, Sparkles, Building2, Shield, Home,
  CheckCircle2, LayoutDashboard, Loader2
} from 'lucide-react';
import dynamic from 'next/dynamic';
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#E5E7EB] dark:bg-card flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  )
});

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center pt-24 pb-12 overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[5%] right-[-5%] w-[800px] h-[800px] bg-secondary/10 rounded-full blur-[140px] animate-pulse delay-700" />
          <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10 text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary/10 text-primary rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-sm border border-primary/20">
              <Sparkles size={14} className="animate-pulse" />
              Elite Campus Housing Network
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-dark tracking-tighter leading-[0.9]">
              Smart Living for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-dark to-secondary">Modern Students</span>
            </h1>

            <p className="text-xl md:text-2xl text-dark-light font-medium max-w-xl leading-relaxed">
              The ultimate platform for university housing. Secure, verified, and community-driven residences designed for academic success.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link
                href="/search"
                className="group px-10 py-5 bg-dark text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 hover:bg-primary hover:scale-[1.03] transition-all shadow-elevated"
              >
                Explorer Map
                <Navigation size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              <Link
                href="/search"
                className="group px-10 py-5 bg-white text-dark border-4 border-dark rounded-[2rem] font-black text-xl flex items-center justify-center hover:bg-light transition-all shadow-card"
              >
                Start Searching
                <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-8">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-sm">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user avatar" />
                  </div>
                ))}
              </div>
              <div className="text-sm font-bold text-dark-light">
                <span className="text-dark font-black">2,400+</span> Students found their <br />perfect room this semester
              </div>
            </div>
          </div>

          {/* Hero Illustration / Map Preview */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-white to-gray-50 rounded-[5rem] shadow-premium border-8 border-white overflow-hidden group">
              <MapComponent />

              {/* Floating Stats Card */}
              <div className="absolute bottom-10 left-10 bg-white/95 backdrop-blur-xl p-8 rounded-[3rem] shadow-elevated border border-white animate-bounce">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-secondary text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-dark">Verified</div>
                    <div className="text-sm font-bold text-dark-light">100% Quality Assurance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Removed: Quick Actions / Role Selection */}

      {/* How It Works */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-5xl md:text-6xl font-black text-dark tracking-tighter">
              Housing made <span className="text-primary underline decoration-8 decoration-accent/20 underline-offset-4">effortless.</span>
            </h2>
            <p className="text-xl text-dark-light font-medium">Three steps to your elite campus residence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { icon: Search, title: 'Find & Compare', desc: 'Browse hundreds of verified hostels with real student reviews and VR tours.', color: 'bg-primary' },
              { icon: Shield, title: 'Apply Securely', desc: 'Submit applications directly. Safe, digital, and 100% transparent.', color: 'bg-secondary' },
              { icon: Home, title: 'Move In', desc: 'Get accepted and move into your new home. Academic success follows.', color: 'bg-accent' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center group">
                <div className={`w-32 h-32 ${item.color} text-white rounded-[3rem] flex items-center justify-center mb-8 shadow-elevated group-hover:rotate-6 transition-all`}>
                  <item.icon size={48} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-dark mb-4">{item.title}</h3>
                <p className="text-dark-light font-medium leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Benchmarks */}
      <section className="py-20 px-6 border-t border-gray-100 bg-light/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div className="space-y-4">
            <span className="font-black text-3xl tracking-tighter text-dark underline decoration-4 decoration-primary underline-offset-4">HOSTELHUB</span>
            <p className="text-dark-light font-medium text-sm">Ensuring student stability across <br /> 500+ verified campus networks.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-12 font-black text-[10px] tracking-[0.3em] uppercase text-dark-light/40">
            <div className="flex flex-col gap-2">
              <span className="text-dark font-black">ISO 9001:2023</span>
              <span>Operationally Certified</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-dark font-black">AES 256-BIT</span>
              <span>Security Encryption</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-dark font-black">24/7 REDLINE</span>
              <span>Priority Support</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
