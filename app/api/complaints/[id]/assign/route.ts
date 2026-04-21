import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { assignedTo, eta } = body;

        const docRef = doc(db, 'complaints', id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            return NextResponse.json(
                { error: 'Complaint not found' },
                { status: 404 }
            );
        }

        const updates = {
            assigned_to: assignedTo,
            assigned_at: new Date().toISOString(),
            eta: eta ? new Date(eta).toISOString() : null,
            status: 'Assigned',
            updated_at: new Date().toISOString()
        };

        await updateDoc(docRef, updates);
        const updatedSnap = await getDoc(docRef);

        return NextResponse.json({
            success: true,
            complaint: { ...updatedSnap.data(), _id: id, id: id },
            message: 'Complaint assigned successfully'
        });
    } catch (error: any) {
        console.error('Error assigning complaint:', error);
        return NextResponse.json(
            { error: 'Failed to assign complaint', details: error.message },
            { status: 500 }
        );
    }
}

