import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

import { withAdmin } from '@/lib/middleware';

export const PATCH = withAdmin(async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, remarks } = body;

        if (!['Approved', 'Rejected', 'Suspended'].includes(status)) {
            return NextResponse.json({ error: 'Invalid approval status' }, { status: 400 });
        }

        const docRef = doc(db, 'hostel_blocks', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ error: 'Hostel not found' }, { status: 404 });
        }

        await updateDoc(docRef, { approvalStatus: status });

        const updatedSnap = await getDoc(docRef);
        const hostel = updatedSnap.data();

        return NextResponse.json({
            success: true,
            message: `Hostel ${status.toLowerCase()} successfully`,
            data: { ...hostel, _id: id }
        });

    } catch (error: any) {
        console.error('Error updating hostel approval status:', error);
        return NextResponse.json({ error: 'Failed to update hostel status' }, { status: 500 });
    }
});
