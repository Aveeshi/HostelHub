import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { studentId } = body;

        if (!studentId) {
            return NextResponse.json({ error: 'Missing studentId' }, { status: 400 });
        }

        // Create a composite ID to ensure uniqueness (noticeId_studentId)
        const ackId = `${id}_${studentId}`;
        const ackRef = doc(db, 'notice_acknowledgements', ackId);
        
        const ackSnap = await getDoc(ackRef);
        if (ackSnap.exists()) {
            return NextResponse.json({
                success: true,
                acknowledged: false,
                message: 'Already acknowledged'
            });
        }

        const newAck = {
            notice_id: id,
            student_id: studentId,
            acknowledged_at: new Date().toISOString()
        };

        await setDoc(ackRef, newAck);

        return NextResponse.json({
            success: true,
            acknowledged: true,
            message: 'Acknowledged'
        });
    } catch (error: any) {
        console.error('Error acknowledging notice:', error);
        return NextResponse.json(
            { error: 'Failed to acknowledge notice', details: error.message },
            { status: 500 }
        );
    }
}

