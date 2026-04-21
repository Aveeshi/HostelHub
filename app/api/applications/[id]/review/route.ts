import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doc, getDoc, updateDoc, runTransaction, increment } from 'firebase/firestore';
import { withWarden } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/types';

// PATCH /api/applications/[id]/review - Warden reviews (Accept/Reject) an application
export const PATCH = withWarden(async (
    request: AuthenticatedRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, notes } = body;
        const wardenId = request.user.id;

        if (!['Accepted', 'Rejected'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid application status' },
                { status: 400 }
            );
        }

        const appDocRef = doc(db, 'hostel_applications', id);

        const result = await runTransaction(db, async (transaction) => {
            const appSnap = await transaction.get(appDocRef);
            if (!appSnap.exists()) {
                throw new Error('Application not found');
            }

            const application = appSnap.data();
            const studentId = application.student_id;
            const hostelBlockId = application.hostel_block_id;

            // 1. Update Application
            transaction.update(appDocRef, {
                status,
                notes,
                reviewed_by: wardenId,
                reviewed_date: new Date().toISOString()
            });

            // 2. Update Student and User
            const studentDocRef = doc(db, 'students', studentId);
            const studentSnap = await transaction.get(studentDocRef);
            if (studentSnap.exists()) {
                const studentData = studentSnap.data();
                const userId = studentData.user_id;

                if (status === 'Accepted') {
                    transaction.update(studentDocRef, {
                        enrollment_status: 'Accepted',
                        hostel_block_id: hostelBlockId,
                        updated_at: new Date().toISOString()
                    });

                    if (userId) {
                        const userDocRef = doc(db, 'users', userId);
                        transaction.update(userDocRef, { can_access_dashboard: true });
                    }

                    // increment occupancy
                    const hostelRef = doc(db, 'hostel_blocks', hostelBlockId);
                    const hostelSnap = await transaction.get(hostelRef);
                    if (hostelSnap.exists()) {
                        transaction.update(hostelRef, {
                            available_rooms: increment(-1),
                            occupied_rooms: increment(1)
                        });
                    }

                } else if (status === 'Rejected') {
                    transaction.update(studentDocRef, {
                        enrollment_status: 'Rejected',
                        hostel_block_id: null,
                        updated_at: new Date().toISOString()
                    });

                    if (userId) {
                        const userDocRef = doc(db, 'users', userId);
                        transaction.update(userDocRef, { can_access_dashboard: false });
                    }
                }
            }

            return { ...application, id, _id: id, status };
        });

        return NextResponse.json({
            success: true,
            message: `Application ${status.toLowerCase()} successfully`,
            data: result
        });

    } catch (error: any) {
        console.error('Error reviewing application:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to review application' },
            { status: 500 }
        );
    }
});
