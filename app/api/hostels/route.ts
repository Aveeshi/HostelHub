import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const location = searchParams.get('location');
        const type = searchParams.get('type');
        const minRating = searchParams.get('minRating');

        const hostelsRef = collection(db, 'hostel_blocks');
        let queryConstraints = [];
        
        if (type) {
            queryConstraints.push(where('type', '==', type));
        }
        if (minRating) {
            queryConstraints.push(where('rating', '>=', parseFloat(minRating)));
        }

        const q = query(hostelsRef, ...queryConstraints);
        const snapshot = await getDocs(q);
        
        let hostels: any[] = [];
        
        snapshot.forEach((doc: any) => {
            const data = doc.data();
            // Client-side filtering for ILIKE location since Firebase doesn't support native partial string search
            const matchLocation = location 
                ? (data.block_name?.toLowerCase().includes(location.toLowerCase()) || 
                   data.location?.toLowerCase().includes(location.toLowerCase()))
                : true;

            if (matchLocation) {
                hostels.push({
                    ...data,
                    _id: doc.id,
                    id: doc.id,
                    name: data.block_name,
                    messAvailable: data.facilities?.includes('Mess') || false
                });
            }
        });

        return NextResponse.json(hostels);
    } catch (error: any) {
        console.error('Error fetching hostels:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { blockName, type, location, totalRooms, facilities, images } = body;

        const hostelsRef = collection(db, 'hostel_blocks');
        const newHostel = {
            block_name: blockName,
            type,
            location,
            total_rooms: totalRooms,
            available_rooms: totalRooms,
            facilities,
            images,
            rating: 0,
            created_at: new Date().toISOString()
        };

        const docRef = await addDoc(hostelsRef, newHostel);

        return NextResponse.json({ ...newHostel, _id: docRef.id, id: docRef.id }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating hostel:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
