import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string, reviewId: string }> }
) {
    try {
        const { reviewId } = await params;

        const reviewRef = doc(db, 'reviews', reviewId);
        
        // Update the document with atomic increment
        await updateDoc(reviewRef, {
            helpful: increment(1)
        });

        // Fetch again to return the new count
        const updatedSnap = await getDoc(reviewRef);
        
        if (!updatedSnap.exists()) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            helpfulCount: updatedSnap.data().helpful 
        });
    } catch (error: any) {
        console.error('Error marking review as helpful:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

