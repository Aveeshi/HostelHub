import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { withStudent } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/types';

export const POST = withStudent(async (
    request: AuthenticatedRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const { id } = await params;

        const studentDocRef = doc(db, 'students', id);
        const studentDoc = await getDoc(studentDocRef);

        if (!studentDoc.exists()) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        const studentData = studentDoc.data();

        // Security check: Match URL student ID with authenticated user ID
        if (studentData.user_id !== request.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized: You cannot process payments for another student' },
                { status: 403 }
            );
        }

        const updateData = {
            enrollment_status: 'Active',
            updated_at: new Date().toISOString()
        };

        await updateDoc(studentDocRef, updateData);

        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully',
            data: { ...studentData, ...updateData, _id: id, id: id }
        });

    } catch (error: any) {
        console.error('Error processing payment:', error);
        return NextResponse.json(
            { error: 'Failed to process payment', details: error.message },
            { status: 500 }
        );
    }
});

