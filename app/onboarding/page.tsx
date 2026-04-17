"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Home, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { getAuthSession } from '@/lib/clientAuth';

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    
    // Check auth on load
    useEffect(() => {
        const session = getAuthSession();
        if (!session.token || session.user?.role !== 'Student') {
            router.replace('/auth/login');
        }
    }, [router]);

    const [formData, setFormData] = useState({
        sleepHabit: '',
        drinksSmokes: '',
        year: '',
        college: '',
        intro: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const session = getAuthSession();
            
            const res = await fetch('/api/student/onboarding', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.token}` 
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Failed to save preferences');
            }
            
            setSuccess(true);
            setTimeout(() => {
                router.replace('/search');
            }, 1000);

        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-light flex flex-col items-center justify-center p-6">
                 <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 max-w-lg w-full text-center shadow-2xl border border-white">
                    <CheckCircle2 className="w-20 h-20 text-success mx-auto mb-6" />
                    <h2 className="text-3xl font-black text-dark mb-4">You're All Set!</h2>
                    <p className="text-dark-light font-medium text-lg mb-8">
                        Your profile is updated. Redirecting you to find your perfect hostel...
                    </p>
                    <Loader2 className="animate-spin w-8 h-8 text-primary mx-auto" />
                 </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light flex items-center justify-center py-20 px-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-xl w-full">
                <div className="text-center mb-10">
                    <div className="inline-block mb-6 bg-white p-4 rounded-3xl shadow-sm">
                        <Home className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-4xl font-black text-dark mb-4">Find Your Perfect Roommate</h1>
                    <p className="text-dark-light font-medium text-lg">
                        Hey! Fill up this quick form to help us match you with the best possible roommates.
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 shadow-2xl border border-white">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl text-sm font-bold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Question 1: Sleep Habits */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-dark uppercase tracking-widest pl-2 block">
                                1. What kind of person are you?
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {['Early riser', 'Night owl', 'Sleep at decent time'].map((option) => (
                                    <label 
                                        key={option}
                                        className={`cursor-pointer border-2 rounded-2xl p-4 text-center transition-all ${
                                            formData.sleepHabit === option 
                                                ? 'border-primary bg-primary/5 text-primary font-bold shadow-md' 
                                                : 'border-gray-100 bg-white text-dark-light hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <input 
                                            type="radio" 
                                            name="sleepHabit" 
                                            value={option}
                                            className="sr-only"
                                            checked={formData.sleepHabit === option}
                                            onChange={(e) => setFormData({...formData, sleepHabit: e.target.value})}
                                            required
                                        />
                                        <span className="text-sm block">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Question 2: Drink/Smoke */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-dark uppercase tracking-widest pl-2 block">
                                2. Do you drink / smoke?
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {['yes', 'no'].map((option) => (
                                    <label 
                                        key={option}
                                        className={`cursor-pointer border-2 rounded-2xl p-4 text-center transition-all capitalize ${
                                            formData.drinksSmokes === option 
                                                ? 'border-primary bg-primary/5 text-primary font-bold shadow-md' 
                                                : 'border-gray-100 bg-white text-dark-light hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <input 
                                            type="radio" 
                                            name="drinksSmokes" 
                                            value={option}
                                            className="sr-only"
                                            checked={formData.drinksSmokes === option}
                                            onChange={(e) => setFormData({...formData, drinksSmokes: e.target.value})}
                                            required
                                        />
                                        <span className="text-base block">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Question 3: Year & College (Grid Layout) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-sm font-black text-dark uppercase tracking-widest pl-2 block">
                                    3. Which year are you in?
                                </label>
                                <select 
                                    className="w-full px-4 py-4 bg-light/50 border-none rounded-2xl text-dark font-medium focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                                    value={formData.year}
                                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                                    required
                                >
                                    <option value="" disabled>Select Year</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-black text-dark uppercase tracking-widest pl-2 block">
                                    4. What college are you from?
                                </label>
                                <select 
                                    className="w-full px-4 py-4 bg-light/50 border-none rounded-2xl text-dark font-medium focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                                    value={formData.college}
                                    onChange={(e) => setFormData({...formData, college: e.target.value})}
                                    required
                                >
                                    <option value="" disabled>Select College</option>
                                    <option value="PICT">PICT</option>
                                    <option value="Bharti">Bharti</option>
                                    <option value="VIT">VIT</option>
                                </select>
                            </div>
                        </div>

                        {/* Question 5: Intro */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-dark uppercase tracking-widest pl-2 block">
                                5. Short Intro & Preferences
                            </label>
                            <p className="text-xs text-dark-light pl-2 pb-1">
                                Give us a short intro of the type of person you are and what kind of roommate you're looking for.
                            </p>
                            <textarea 
                                className="w-full p-6 bg-light/50 border-none rounded-3xl min-h-[150px] resize-none focus:ring-2 focus:ring-primary transition-all text-dark font-medium leading-relaxed"
                                placeholder="..."
                                value={formData.intro}
                                onChange={(e) => setFormData({...formData, intro: e.target.value})}
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-dark text-white rounded-[1.5rem] mt-6 font-black text-xl uppercase tracking-widest hover:bg-primary hover:scale-[1.02] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-4 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin w-6 h-6" />
                            ) : (
                                <>
                                    Complete Profile
                                    <ArrowRight size={24} />
                                </>
                            )}
                        </button>
                        
                        <div className="text-center pt-2">
                             <Link href="/search" className="text-dark-light text-sm font-bold hover:text-primary transition-colors">
                                Skip for now
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
