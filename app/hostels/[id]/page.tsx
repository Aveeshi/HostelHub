"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Star, MapPin, Shield, Utensils, Wifi, Dumbbell,
    BookOpen, Video, Users, CheckCircle, ChevronLeft,
    ArrowRight, MessageSquare, ThumbsUp, Loader2, Camera, LayoutDashboard, ShieldCheck, Building2
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { DEFAULT_HOSTEL_IMAGE, normalizeHostelImages } from '@/lib/hostelImages';
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-light/30 flex items-center justify-center rounded-[4rem] min-h-[300px]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
    )
});

interface Review {
    _id: string;
    studentId: string;
    rating: number;
    reviewText: string;
    helpful: number;
    photos: string[];
    createdAt: string;
}

interface Hostel {
    _id: string;
    blockName: string;
    type: string;
    description: string;
    totalRooms: number;
    availableRooms: number;
    facilities: string[];
    images: string[];
    virtualTourUrl?: string;
    approvalStatus?: string;
    rating: number;
    averageRating: number;
    totalReviews: number;
    reviews: Review[];
    wardenInfo: {
        name: string;
        phone: string;
        email: string;
    };
    rooms?: {
        roomNumber: string;
        status: 'Available' | 'Full';
        occupants: number;
        capacity: number;
    }[];
}

const facilityIcons: { [key: string]: any } = {
    'WiFi': Wifi,
    'Gym': Dumbbell,
    'Library': BookOpen,
    'Mess': Utensils,
};

export default function HostelDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [hostel, setHostel] = useState<Hostel | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        if (id) fetchHostelDetails();
    }, [id]);

    const fetchHostelDetails = async () => {
        try {
            const res = await fetch(`/api/hostel-blocks/${id}`);
            if (res.ok) {
                const data = await res.json();
                setHostel(data);
            }
        } catch (error) {
            console.error('Error fetching hostel details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyClick = () => {
        // Auth Check
        const token = localStorage.getItem('token');
        if (!token) {
            router.push(`/auth/login?returnUrl=/hostels/${id}`);
            return;
        }
        setShowConfirmModal(true);
    };

    const confirmApplication = async () => {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (!hostel) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center text-center px-6">
                <div>
                    <h1 className="text-4xl font-black mb-4">Hostel Not Found</h1>
                    <Link href="/search" className="text-primary font-bold underline">Back to Search</Link>
                </div>
            </div>
        );
    }

    const hostelImages = normalizeHostelImages(hostel.images);
    const heroImage = hostelImages[activeImage] || hostelImages[0] || DEFAULT_HOSTEL_IMAGE;
    const occupancyPercentage = hostel ? ((hostel.totalRooms - hostel.availableRooms) / hostel.totalRooms) * 100 : 0;

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section / Gallery */}
            <div className="relative h-[65vh] w-full overflow-hidden bg-dark">
                <div className="absolute inset-0 z-0">
                    <img
                        src={heroImage}
                        alt={hostel.blockName}
                        className="w-full h-full object-cover opacity-60 transition-transform duration-700"
                        onError={(event) => {
                            const img = event.currentTarget;
                            if (img.src !== DEFAULT_HOSTEL_IMAGE) {
                                img.src = DEFAULT_HOSTEL_IMAGE;
                            }
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>

                <div className="absolute top-24 left-6 z-20">
                    <button
                        onClick={() => router.back()}
                        className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white hover:text-dark transition-all border border-white/10"
                    >
                        <ChevronLeft size={24} />
                    </button>
                </div>

                <div className="absolute inset-0 z-10 flex items-end">
                    <div className="max-w-7xl mx-auto px-6 pb-16 w-full">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <div className="space-y-6">
                                <div className="flex gap-3">
                                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-premium ${hostel.type === 'Boys' ? 'bg-primary text-white' :
                                        hostel.type === 'Girls' ? 'bg-secondary text-white' : 'bg-accent text-white'
                                        }`}>
                                        {hostel.type} Residency
                                    </span>
                                    {hostel.approvalStatus !== 'Approved' && (
                                        <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-premium ${hostel.approvalStatus === 'Rejected' ? 'bg-danger text-white' : 'bg-accent text-white'
                                            }`}>
                                            Listing {hostel.approvalStatus}
                                        </span>
                                    )}
                                    <span className="px-5 py-2 bg-white/10 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">
                                        {hostel.approvalStatus === 'Approved' ? 'Verified Property' : 'Restricted Access'}
                                    </span>
                                </div>
                                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">
                                    {hostel.blockName}
                                </h1>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-white/60 font-medium">
                                        <MapPin size={20} className="text-primary" />
                                        University North District
                                    </div>
                                    <div className="flex items-center gap-2 text-accent">
                                        <Star size={20} fill="currentColor" />
                                        <span className="text-white font-black text-lg">{hostel.rating || '4.9'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 flex flex-col items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Live Occupancy</span>
                                <span className="text-4xl font-black text-white">{occupancyPercentage.toFixed(0)}%</span>
                                <div className="w-32 bg-white/20 h-1.5 rounded-full overflow-hidden mt-2">
                                    <div className="bg-primary h-full" style={{ width: `${occupancyPercentage}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16 py-20 relative">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-20">
                    {/* About Section */}
                    <section className="space-y-8">
                        <h2 className="text-4xl font-black text-dark tracking-tight flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                <Building2 size={24} />
                            </div>
                            Property Overview
                        </h2>
                        <p className="text-xl text-dark-light leading-relaxed font-medium">
                            {hostel.description || "Premium student accommodation designed for academic excellence and comfort. Featuring state-of-the-art facilities and a community-driven environment."}
                        </p>
                    </section>

                    {/* Facilities Grid */}
                    <section className="space-y-10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-4xl font-black text-dark tracking-tight">Executive Facilities</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {(hostel.facilities || ['WiFi', 'Mess', 'Gym', 'Laundry', 'Security', 'AC']).map((facility: string, index: number) => {
                                const Icon = facilityIcons[facility] || CheckCircle;
                                return (
                                    <div key={index} className="group p-8 bg-light/30 rounded-[2.5rem] border border-gray-50 hover:bg-white hover:shadow-card transition-all duration-300">
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <Icon size={32} className="text-primary" />
                                        </div>
                                        <span className="text-lg font-black text-dark tracking-tight">{facility}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                    {/* Photo Gallery */}
                    {hostelImages.length > 1 && (
                        <section className="space-y-10">
                            <h2 className="text-4xl font-black text-dark tracking-tight">Image Gallery</h2>
                            <div className="flex overflow-x-auto gap-4 pb-4 snap-x" style={{ display: "flex", overflowX: "scroll" }}>
                                {hostelImages.map((img: string, i: number) => (
                                    <img 
                                        key={i} 
                                        src={img} 
                                        alt={`Gallery ${i}`} 
                                        className="h-48 w-auto md:h-64 object-cover rounded-[2rem] snap-center hover:scale-[1.02] active:scale-95 transition-transform cursor-pointer border-4 border-transparent hover:border-white shadow-sm flex-none"
                                        style={{ minWidth: "250px" }}
                                        onClick={() => setActiveImage(i)}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                    {/* Location Section */}
                    <section className="space-y-10">
                        <h2 className="text-4xl font-black text-dark tracking-tight">Strategic Location</h2>
                        <div className="aspect-video w-full rounded-[4rem] overflow-hidden shadow-elevated border-8 border-white group">
                            <MapComponent />
                        </div>
                    </section>

                    {/* Reviews Section */}
                    {hostel.approvalStatus === 'Approved' && (
                        <section className="space-y-12">
                            <div className="flex items-center justify-between">
                                <h2 className="text-4xl font-black text-dark tracking-tight">Student Testimonials</h2>
                                <div className="text-sm font-bold text-dark-light">Based on 124 verified reviews</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[1, 2].map((i) => (
                                    <div key={i} className="p-10 bg-white rounded-[3.5rem] shadow-card border border-gray-50 relative">
                                        <div className="absolute top-10 right-10 flex gap-1 text-accent">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                                        </div>
                                        <div className="flex items-center gap-4 mb-8">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=review${i}`} className="w-14 h-14 rounded-2xl bg-light" alt="avatar" />
                                            <div>
                                                <div className="text-lg font-black text-dark tracking-tight">Priya Sharma</div>
                                                <div className="text-xs font-bold text-dark-light uppercase tracking-widest">Final Year student</div>
                                            </div>
                                        </div>
                                        <p className="text-dark-light font-medium italic leading-relaxed">
                                            "The environment here is exceptional for studies. The mess serves the best food on campus and the staff is incredibly helpful."
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sticky Booking Widget */}
                <div className="lg:col-span-1">
                    <div className="sticky top-32 space-y-8">
                        <div className="bg-dark p-10 rounded-[4rem] shadow-elevated border-4 border-primary/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-[4rem] -z-0" />
                            <div className="relative z-10 space-y-8">
                                <div className="flex items-end gap-2">
                                    <span className="text-6xl font-black text-white tracking-tighter">₹{hostel.baseRent || 12500}</span>
                                    <span className="text-white/40 font-bold mb-2 uppercase tracking-widest text-xs">/ month</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-6 py-4 bg-white/5 rounded-2xl border border-white/10">
                                        <span className="text-white/60 font-bold text-sm tracking-widest uppercase">Available Beds</span>
                                        <span className="text-white font-black">{hostel.availableRooms} Units</span>
                                    </div>
                                    <div className="flex justify-between items-center px-6 py-4 bg-white/5 rounded-2xl border border-white/10">
                                        <span className="text-white/60 font-bold text-sm tracking-widest uppercase">Security Deposit</span>
                                        <span className="text-white font-black">₹25,000</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleApplyClick}
                                    disabled={applying || hostel.availableRooms === 0}
                                    className="w-full py-6 bg-primary hover:bg-primary-hover text-white rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-premium transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                                >
                                    {applying ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </div>
                                    ) : hostel.availableRooms === 0 ? (
                                        'Currently Full'
                                    ) : (
                                        <>
                                            Begin Enrollment <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-white/30 text-[10px] font-bold uppercase tracking-widest">
                                    Verified Institutional Allocation System
                                </p>
                            </div>
                        </div>

                        {/* Warden Info Card */}
                        <div className="bg-white p-8 rounded-[3.5rem] shadow-card border border-gray-50 flex items-center gap-6">
                            <div className="w-20 h-20 rounded-3xl bg-light flex items-center justify-center text-primary font-black text-2xl">
                                {hostel.wardenInfo.name.charAt(0)}
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-dark-light mb-1">Chief Warden</div>
                                <div className="text-xl font-black text-dark tracking-tight">{hostel.wardenInfo?.name || 'Dr. Arjun Mehta'}</div>
                                <div className="text-sm font-bold text-primary">{hostel.wardenInfo?.phone || 'Contact Admin'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal - Polished */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
                    <div className="absolute inset-0 bg-dark/60 backdrop-blur-xl animate-fade-in" onClick={() => setShowConfirmModal(false)} />
                    <div className="relative bg-white w-full max-w-xl rounded-[4rem] p-12 shadow-elevated border border-gray-50 animate-scale-in">
                        <div className="w-24 h-24 bg-primary/10 text-primary rounded-[3rem] flex items-center justify-center mb-10 mx-auto">
                            <ShieldCheck size={56} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-4xl font-black text-dark text-center mb-6 tracking-tight">Confirm Enrollment</h2>
                        <p className="text-xl text-dark-light text-center font-medium leading-relaxed mb-12">
                            You are about to submit an official application for <span className="text-dark font-black">{hostel.blockName}</span>.
                            This action will be logged and sent to the chief warden for verification.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-6 bg-light text-dark rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all active:scale-95"
                            >
                                Re-evaluate
                            </button>
                            <button
                                onClick={confirmApplication}
                                className="flex-1 py-6 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-premium hover:bg-primary-hover transition-all active:scale-95"
                            >
                                Confirm & Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
