import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // Fix type: Next.js 15+ params is a Promise
) {
    try {
        const { id } = await context.params;

        const docRef = doc(db, 'hostel_blocks', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json(
                { error: 'Hostel block not found' },
                { status: 404 }
            );
        }

        const data = docSnap.data();

        // Optional: you can still fetch reviews from Firebase if they exist, but for now we fallback to empty array
        const reviews = data.reviews || [];

        const hostel = {
            _id: docSnap.id,
            blockName: data.block_name,
            type: data.type,
            description: data.description,
            totalRooms: data.total_rooms,
            availableRooms: data.available_rooms,
            occupiedRooms: data.total_rooms - data.available_rooms,
            location: data.location,
            baseRent: data.baseRent || 12500, // Read base rent dynamically fallback included
            rating: data.rating || 0,
            virtualTourUrl: data.virtual_tour_url || null,
            images: data.images || [],
            facilities: data.facilities || [],
            approvalStatus: data.approvalStatus || 'Approved',
            wardenInfo: data.wardenInfo || {
                name: 'Unassigned',
                phone: 'N/A',
                email: 'N/A'
            },
            reviews: reviews,
            averageRating: data.rating || 0,
            totalReviews: reviews.length,
            // Expose the dynamically generated/saved rooms from Firebase! 
            rooms: data.rooms || []
        };

        return NextResponse.json(hostel);
    } catch (error: any) {
        console.error('Error fetching hostel block:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hostel block', details: error.message },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        
        const docRef = doc(db, 'hostel_blocks', id);

        if (body.images && Array.isArray(body.images)) {
            await updateDoc(docRef, { images: body.images }); // We could use arrayUnion, but let's just append on the client or server. Wait, no, we need to import arrayUnion if we do it here. Or we just replace the array. Actually, we should just let the client send the final array.
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
