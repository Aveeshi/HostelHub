import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { mealType, rating } = body;

        const colSuffix = rating === 'up' ? 'up' : 'down';
        const fieldName = `${mealType.toLowerCase()}_${colSuffix}`;

        const docRef = doc(db, 'mess_menu', id);
        
        // Use updateDoc with increment for atomic update
        await updateDoc(docRef, {
            [fieldName]: increment(1)
        });

        const updatedSnap = await getDoc(docRef);

        return NextResponse.json({
            success: true,
            menu: { ...updatedSnap.data(), _id: id, id: id }
        });
    } catch (error: any) {
        console.error('Error rating meal:', error);
        return NextResponse.json(
            { error: 'Failed to rate meal', details: error.message },
            { status: 500 }
        );
    }
}

