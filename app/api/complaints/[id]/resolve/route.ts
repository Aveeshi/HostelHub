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
        const { resolutionNotes, resolutionPhotos } = body;

        const docRef = doc(db, 'complaints', id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            return NextResponse.json(
                { error: 'Complaint not found' },
                { status: 404 }
            );
        }

        const updates = {
            status: 'Resolved',
            resolved_at: new Date().toISOString(),
            resolution_notes: resolutionNotes || '',
            resolution_photos: resolutionPhotos || [],
            updated_at: new Date().toISOString()
        };

        await updateDoc(docRef, updates);
        const updatedSnap = await getDoc(docRef);

        return NextResponse.json({
            success: true,
            complaint: { ...updatedSnap.data(), _id: id, id: id },
            message: 'Complaint resolved successfully'
        });
    } catch (error: any) {
        console.error('Error resolving complaint:', error);
        return NextResponse.json(
            { error: 'Failed to resolve complaint', details: error.message },
            { status: 500 }
        );
    }
}

