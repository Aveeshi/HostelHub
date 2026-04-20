import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const location = searchParams.get('location');
        const types = searchParams.get('types')?.split(',');
        const facilities = searchParams.get('facilities')?.split(',');

        const hostelsRef = collection(db, 'hostel_blocks');
        let queryConstraints = [];

        if (types && types.length > 0) {
            queryConstraints.push(where('type', 'in', types));
        }

        const q = query(hostelsRef, ...queryConstraints);
        const snapshot = await getDocs(q);

        let blocks: any[] = [];

        snapshot.forEach((doc: any) => {
            const data = doc.data();
            
            let matchesLocation = true;
            if (location) {
                matchesLocation = data.location?.toLowerCase().includes(location.toLowerCase()) || 
                                  data.block_name?.toLowerCase().includes(location.toLowerCase());
            }

            let matchesFacilities = true;
            if (facilities && facilities.length > 0) {
                const docFacilities = data.facilities || [];
                matchesFacilities = facilities.some(f => docFacilities.includes(f));
            }

            if (matchesLocation && matchesFacilities) {
                blocks.push({
                    _id: doc.id,
                    id: doc.id,
                    blockName: data.block_name || data.blockName,
                    name: data.block_name || data.blockName, // Ensure 'name' is available
                    type: data.type,
                    description: data.description,
                    totalRooms: data.total_rooms || data.totalRooms,
                    availableRooms: data.available_rooms || data.availableRooms,
                    occupiedRooms: data.occupied_rooms || data.occupiedRooms || 0,
                    location: data.location,
                    rating: typeof data.rating === 'number' ? data.rating : parseFloat(data.rating || '0'),
                    virtualTourUrl: data.virtual_tour_url || data.virtualTourUrl,
                    images: data.images || [],
                    facilities: data.facilities || [],
                    wardenInfo: data.wardenInfo || {
                        name: 'Admin',
                        phone: '1800-200-300'
                    }
                });
            }
        });

        blocks.sort((a, b) => b.rating - a.rating);
        return NextResponse.json(blocks);
    } catch (error: any) {
        console.error('Error fetching hostel blocks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hostel blocks', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { blockName, type, description, totalRooms, availableRooms, location, images, facilities, wardenInfo } = body;

        const hostelsRef = collection(db, 'hostel_blocks');
        const newBlock = {
            block_name: blockName,
            type,
            description,
            total_rooms: totalRooms,
            available_rooms: availableRooms,
            location,
            images: images || [],
            facilities: facilities || [],
            wardenInfo: wardenInfo || {
                name: 'Admin',
                phone: '1800-200-300',
                email: 'admin@hostelhub.com'
            },
            rating: 0,
            created_at: new Date().toISOString()
        };

        const docRef = await addDoc(hostelsRef, newBlock);

        return NextResponse.json({ ...newBlock, _id: docRef.id, id: docRef.id }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating hostel block:', error);
        return NextResponse.json(
            { error: 'Failed to create hostel block', details: error.message },
            { status: 500 }
        );
    }
}
