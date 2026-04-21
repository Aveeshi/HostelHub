import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const docRef = doc(db, 'complaints', id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            return NextResponse.json(
                { error: 'Complaint not found' },
                { status: 404 }
            );
        }

        // Map updates (converting any camelCase if needed, but keeping consistency)
        const updates: any = {};
        for (const [key, value] of Object.entries(body)) {
            if (['_id', 'id', 'student_id', 'created_at'].includes(key)) continue;
            
            // Map common camelCase to snake_case (e.g., assignedTo -> assigned_to)
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            updates[snakeKey] = value;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        await updateDoc(docRef, updates);
        const updatedSnap = await getDoc(docRef);

        return NextResponse.json({ ...updatedSnap.data(), _id: id, id: id });
    } catch (error: any) {
        console.error('Error updating complaint:', error);
        return NextResponse.json(
            { error: 'Failed to update complaint', details: error.message },
            { status: 500 }
        );
    }
}

