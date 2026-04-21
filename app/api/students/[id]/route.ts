import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { withStudentOrWarden } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/types';

export const GET = withStudentOrWarden(async (
    request: AuthenticatedRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const { id } = await params;

        // Fetch student doc
        const studentDocRef = doc(db, 'students', id);
        const studentDoc = await getDoc(studentDocRef);

        if (!studentDoc.exists()) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        const studentData = studentDoc.data();

        // Security check: If Student, they can only view their own profile.
        // Wardens and Admins can view any student profile.
        if (request.user.role === 'Student' && studentData.user_id !== request.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized: You can only view your own profile' },
                { status: 403 }
            );
        }

        // Fetch user info
        let userData = {};
        if (studentData.user_id) {
            const userDocRef = doc(db, 'users', studentData.user_id);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                userData = userDoc.data();
            }
        }

        // Fetch hostel info
        let hostelData: any = null;
        if (studentData.hostel_block_id) {
            const hostelDocRef = doc(db, 'hostel_blocks', studentData.hostel_block_id);
            const hostelDoc = await getDoc(hostelDocRef);
            if (hostelDoc.exists()) {
                const hd = hostelDoc.data();
                hostelData = {
                    id: hostelDoc.id,
                    name: hd.block_name,
                    location: hd.location
                };
            }
        }

        // Map to integrated object format for frontend
        const mappedStudent = {
            _id: studentDoc.id,
            userId: studentData.user_id,
            name: (userData as any).name,
            email: (userData as any).email,
            phone: (userData as any).phone,
            rollNumber: studentData.roll_number,
            course: studentData.course,
            year: studentData.year,
            department: studentData.department,
            roomNumber: studentData.room_number,
            enrollmentStatus: studentData.enrollment_status,
            photo: studentData.photo,
            canAccessDashboard: (userData as any).can_access_dashboard,
            hostelInfo: hostelData,
            feeStatus: {
                isPaid: studentData.enrollment_status === 'Active',
                lastPayment: studentData.updated_at
            }
        };

        return NextResponse.json(mappedStudent);
    } catch (error: any) {
        console.error('Error fetching student:', error);
        return NextResponse.json(
            { error: 'Failed to fetch student', details: error.message },
            { status: 500 }
        );
    }
});

export const PUT = withStudentOrWarden(async (
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

        // Security check: Only the student can update their own profile.
        if (studentData.user_id !== request.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized: You can only update your own profile' },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Strict whitelist for allowed update fields
        const allowedFields: Record<string, string> = {
            'rollNumber': 'roll_number',
            'course': 'course',
            'year': 'year',
            'department': 'department',
            'roomNumber': 'room_number',
            'photo': 'photo'
        };

        const updateData: any = {
            updated_at: new Date().toISOString()
        };

        Object.entries(body).forEach(([key, value]) => {
            if (allowedFields[key]) {
                updateData[allowedFields[key]] = value;
            }
        });

        if (Object.keys(updateData).length <= 1) { // only updated_at
            return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 });
        }

        await updateDoc(studentDocRef, updateData);

        return NextResponse.json({ ...studentData, ...updateData, _id: id, id: id });
    } catch (error: any) {
        console.error('Error updating student:', error);
        return NextResponse.json(
            { error: 'Failed to update student', details: error.message },
            { status: 500 }
        );
    }
});

