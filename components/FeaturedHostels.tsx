import React from 'react';
import { db } from '@/lib/db';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Star, MapPin, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getPrimaryHostelImage } from '@/lib/hostelImages';

export default async function FeaturedHostels() {
    let hostels = [];

    try {
        const blocksRef = collection(db, 'hostel_blocks');
        const q = query(blocksRef, orderBy('rating', 'desc'), limit(3));
        const snapshot = await getDocs(q);

        hostels = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                _id: doc.id,
                blockName: data.block_name,
                location: data.location,
                type: data.type,
                rating: parseFloat(data.rating) || 0,
                availableRooms: data.available_rooms,
                facilities: data.facilities || [],
                images: data.images || []
            };
        });

    } catch (error) {

        console.error('Database connection failed in FeaturedHostels, using fallback data:', error);
        // Fallback mock data for build time or DB downtime
        hostels = [
            {
                _id: 'mock_1',
                blockName: 'Nilgiri Premium Block',
                location: 'Main Campus',
                type: 'Boys',
                rating: 4.8,
                availableRooms: 12,
                facilities: ['WiFi', 'Mess', 'Gym'],
                images: ['https://images.unsplash.com/photo-1555854817-5b2260d37cbb?auto=format&fit=crop&q=80&w=800']
            },
            {
                _id: 'mock_2',
                blockName: 'Kaveri Girls Wing',
                location: 'North Campus',
                type: 'Girls',
                rating: 4.7,
                availableRooms: 8,
                facilities: ['Library', 'Mess', 'Laundry'],
                images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800']
            },
            {
                _id: 'mock_3',
                blockName: 'Himadri International',
                location: 'East Side',
                type: 'Co-ed',
                rating: 4.9,
                availableRooms: 5,
                facilities: ['WiFi', 'AC', 'Sports'],
                images: ['https://images.unsplash.com/photo-1520277739336-7bf67edfa768?auto=format&fit=crop&q=80&w=800']
            }
        ];
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {hostels.map((hostel: any) => (
                <div key={hostel._id.toString()} className="group flex flex-col bg-card rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-border">
                    {/* Image Container */}
                    <div className="relative h-64 overflow-hidden">
                        <div className="absolute inset-0 bg-dark/20 group-hover:bg-dark/0 transition-colors z-10" />
                        <img
                            src={getPrimaryHostelImage(hostel.images)}
                            alt={hostel.blockName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4 z-20">
                            <span className="px-4 py-2 bg-white/90 backdrop-blur text-primary font-bold rounded-full text-sm shadow-md flex items-center gap-1">
                                <Star size={14} className="fill-primary" /> {hostel.rating?.toFixed(1) || 'N/A'}
                            </span>
                        </div>
                        <div className="absolute top-4 right-4 z-20">
                            <span className="px-4 py-2 bg-primary/90 backdrop-blur text-white font-bold rounded-full text-xs shadow-md">
                                {hostel.type}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <h3 className="text-2xl font-black text-foreground mb-2">{hostel.blockName}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground mb-6">
                            <MapPin size={16} />
                            <span className="text-sm font-medium">{hostel.location}</span>
                        </div>

                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-secondary" />
                                <span className="text-sm font-bold text-foreground">{hostel.availableRooms} rooms left</span>
                            </div>
                            <div className="flex gap-2">
                                {hostel.facilities?.slice(0, 2).map((f: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-secondary/10 text-secondary rounded-lg text-xs font-bold">
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <Link
                            href={`/hostels/${hostel._id}`}
                            className="block w-full py-4 text-center bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            View Details
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}
