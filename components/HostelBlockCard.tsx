"use client";

import { Building2, Users, Wifi, Dumbbell, BookOpen, Utensils, Video, MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import { DEFAULT_HOSTEL_IMAGE, getPrimaryHostelImage } from '@/lib/hostelImages';

interface HostelBlockCardProps {
    block: {
        _id: string;
        blockName: string;
        type: string;
        description: string;
        availableRooms: number;
        totalRooms: number;
        wardenInfo: {
            name: string;
            phone: string;
            photo?: string;
        };
        facilities: string[];
        images: string[] | string | null | undefined;
        virtualTourUrl?: string;
        rating: number;
    };
}

const facilityIcons: { [key: string]: any } = {
    'WiFi': Wifi,
    'Gym': Dumbbell,
    'Library': BookOpen,
    'Mess': Utensils,
};

export default function HostelBlockCard({ block }: HostelBlockCardProps) {
    const occupancyPercentage = ((block.totalRooms - block.availableRooms) / block.totalRooms) * 100;
    const primaryImage = getPrimaryHostelImage(block.images);

    return (
        <div className="group bg-white rounded-[2.5rem] overflow-hidden shadow-card hover:shadow-premium transition-all duration-500 hover:-translate-y-2 border border-transparent hover:border-primary/5">
            {/* Image Section */}
            <div className="relative h-64 overflow-hidden">
                <img
                    src={primaryImage}
                    alt={block.blockName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(event) => {
                        const img = event.currentTarget;
                        if (img.src !== DEFAULT_HOSTEL_IMAGE) {
                            img.src = DEFAULT_HOSTEL_IMAGE;
                        }
                    }}
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-premium ${block.type === 'Boys' ? 'bg-primary text-white' :
                        block.type === 'Girls' ? 'bg-secondary text-white' :
                            'bg-accent text-white'
                        }`}>
                        {block.type} Only
                    </span>
                    {block.availableRooms <= 5 && block.availableRooms > 0 && (
                        <span className="px-4 py-1.5 bg-danger text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                            Almost Full
                        </span>
                    )}
                </div>

                {/* Rating Badge */}
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-premium">
                    <Star size={14} className="text-accent" fill="currentColor" />
                    <span className="text-xs font-black text-dark">{block.rating || '4.8'}</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
                <div className="mb-6">
                    <h3 className="text-2xl font-black text-dark mb-2 tracking-tight group-hover:text-primary transition-colors">
                        {block.blockName}
                    </h3>
                    <div className="flex items-center gap-2 text-dark-light font-bold text-sm">
                        <MapPin size={16} className="text-primary" />
                        University North Campus
                    </div>
                </div>

                {/* Occupancy Progress */}
                <div className="mb-8 space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-dark-light">Live Occupancy</span>
                        <span className="text-sm font-black text-dark">{occupancyPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-light rounded-full h-2.5 overflow-hidden p-0.5 border border-gray-100">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${occupancyPercentage > 90 ? 'bg-danger' :
                                occupancyPercentage > 70 ? 'bg-accent' : 'bg-primary'
                                }`}
                            style={{ width: `${occupancyPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-light/50 p-4 rounded-2xl border border-gray-50">
                        <div className="text-[10px] font-black uppercase tracking-widest text-dark-light mb-1">Available Beds</div>
                        <div className="text-lg font-black text-dark">{block.availableRooms} Beds</div>
                    </div>
                    <div className="bg-light/50 p-4 rounded-2xl border border-gray-50">
                        <div className="text-[10px] font-black uppercase tracking-widest text-dark-light mb-1">Base Rent</div>
                        <div className="text-lg font-black text-dark">₹12.5k<span className="text-[10px] ml-1">/mo</span></div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Link
                        href={`/hostels/${block._id}`}
                        className="flex-1 bg-dark text-white text-center py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-primary hover:shadow-premium active:scale-95"
                    >
                        View Property
                    </Link>
                    {block.virtualTourUrl && (
                        <a
                            href={block.virtualTourUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-4 bg-light text-dark rounded-2xl border border-gray-100 transition-all hover:bg-white hover:shadow-card flex items-center justify-center group/btn"
                            title="Virtual Tour"
                        >
                            <Video size={20} className="group-hover/btn:scale-110 transition-transform" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
