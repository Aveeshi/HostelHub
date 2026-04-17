"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2, ArrowRight, User, ShieldCheck, Briefcase, GraduationCap, Phone } from 'lucide-react';
import Link from 'next/link';
import { setAuthSession } from '@/lib/clientAuth';

const sanitizePhoneInput = (value: string): string => value.replace(/\D/g, '').slice(0, 10);

function SignupForm() {
    const searchParams = useSearchParams();
    const initialRole = searchParams.get('role') || 'Student';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: initialRole,
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const normalizedPhone = sanitizePhoneInput(formData.phone);

        if (!/^\d{10}$/.test(normalizedPhone)) {
            setError('Phone number must be exactly 10 digits');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, phone: normalizedPhone }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            // Store tokens and user info
            const studentId = typeof data.student === 'string'
                ? data.student
                : data.student?.id || null;

            setAuthSession(data.token, {
                ...data.user,
                studentId
            });

            // Role-based redirection
            if (data.user.role === 'Admin') {
                router.replace('/admin');
            } else if (data.user.role === 'Warden') {
                router.replace('/warden');
            } else {
                router.replace('/onboarding');
            }
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 shadow-2xl border border-white relative">
            {error && (
                <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger rounded-2xl text-sm font-bold flex items-center gap-3">
                    <ShieldCheck size={20} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSignup} className="space-y-6">
                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'Student' })}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === 'Student' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 bg-white text-dark-light hover:border-gray-200'}`}
                    >
                        <GraduationCap size={24} />
                        <span className="text-xs font-black uppercase tracking-widest">Student</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'Warden' })}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === 'Warden' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-100 bg-white text-dark-light hover:border-gray-200'}`}
                    >
                        <Briefcase size={24} />
                        <span className="text-xs font-black uppercase tracking-widest">Warden</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-black text-dark-light uppercase tracking-widest pl-2">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-light" size={20} />
                            <input
                                type="text"
                                required
                                className="w-full pl-12 pr-4 py-4 bg-light/50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-medium text-dark"
                                placeholder="Arnav Gupta"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-black text-dark-light uppercase tracking-widest pl-2">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-light" size={20} />
                            <input
                                type="tel"
                                required
                                className="w-full pl-12 pr-4 py-4 bg-light/50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-medium text-dark"
                                placeholder="9876543210"
                                inputMode="numeric"
                                pattern="\d{10}"
                                maxLength={10}
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: sanitizePhoneInput(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-black text-dark-light uppercase tracking-widest pl-2">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-light" size={20} />
                        <input
                            type="email"
                            required
                            className="w-full pl-12 pr-4 py-4 bg-light/50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-medium text-dark"
                            placeholder="arnav@university.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-black text-dark-light uppercase tracking-widest pl-2">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-light" size={20} />
                        <input
                            type="password"
                            required
                            className="w-full pl-12 pr-4 py-4 bg-light/50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-medium text-dark"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                </div>

                <p className="text-xs text-dark-light px-2 font-medium">
                    By signing up, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                </p>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-dark text-white rounded-[1.5rem] font-black text-xl uppercase tracking-widest hover:bg-primary hover:scale-[1.02] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-4 disabled:opacity-50"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <>
                            Create Account
                            <ArrowRight size={24} />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-dark-light font-bold text-sm">
                    Already have an account? <Link href="/auth/login" className="text-primary hover:underline">Member Login</Link>
                </p>
            </div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <div className="min-h-screen bg-light flex items-center justify-center py-20 px-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-xl w-full">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-block mb-6">
                        <span className="text-3xl font-black tracking-tighter text-dark">HOSTEL<span className="text-primary">HUB</span></span>
                    </Link>
                    <h1 className="text-4xl font-black text-dark mb-2">Create Account</h1>
                    <p className="text-dark-light font-medium text-lg">Join the university&apos;s premier hostel network</p>
                </div>

                <Suspense fallback={
                    <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 shadow-2xl border border-white relative flex flex-col items-center justify-center min-h-[400px]">
                        <Loader2 className="animate-spin text-primary" size={48} />
                        <p className="mt-4 text-dark-light font-bold">Loading signup form...</p>
                    </div>
                }>
                    <SignupForm />
                </Suspense>
            </div>
        </div>
    );
}
