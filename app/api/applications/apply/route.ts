import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { withStudent } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/types';

// POST /api/applications/apply - Submit a new hostel application
export const POST = withStudent(async (request: AuthenticatedRequest) => {
    try {
        const body = await request.json();
        const { hostelBlockId, applicationData } = body;

        // Securely fetch the student ID from the database using the authenticated user ID
        const studentsRef = collection(db, 'students');
        const studentLookupQuery = query(studentsRef, where('user_id', '==', request.user.id));
        const studentLookupSnapshot = await getDocs(studentLookupQuery);
        
        if (studentLookupSnapshot.empty) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
        }

        const studentDoc = studentLookupSnapshot.docs[0];
        const studentId = studentDoc.id;

        // Validation
        if (!hostelBlockId) {
            return NextResponse.json(
                { error: 'Missing Hostel Block ID' },
                { status: 400 }
            );
        }

        // Check if student already has an active application for this hostel
        const applicationsRef = collection(db, 'hostel_applications');
        const existingAppQuery = query(
            applicationsRef, 
            where('student_id', '==', studentId), 
            where('hostel_block_id', '==', hostelBlockId),
            where('status', '==', 'Pending')
        );
        const existingAppSnapshot = await getDocs(existingAppQuery);

        if (!existingAppSnapshot.empty) {
            return NextResponse.json(
                { error: 'You already have a pending application for this hostel' },
                { status: 400 }
            );
        }

        // Insert Application
        const newApplication = {
            student_id: studentId,
            hostel_block_id: hostelBlockId,
            status: 'Pending',
            application_data: applicationData,
            created_at: new Date().toISOString()
        };

        const appDocRef = await addDoc(applicationsRef, newApplication);

        // Update student enrollment status
        const studentDocRef = doc(db, 'students', studentId);
        await updateDoc(studentDocRef, {
            enrollment_status: 'Applied',
            updated_at: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            message: 'Application submitted successfully',
            data: { 
                ...newApplication, 
                _id: appDocRef.id, 
                id: appDocRef.id,
                studentId,
                hostelBlockId,
                applicationData,
                createdAt: newApplication.created_at
            }
        });

    } catch (error: any) {
        console.error('Error submitting application:', error);
        return NextResponse.json(
            { error: 'Failed to submit application', details: error.message },
            { status: 500 }
        );
    }
});
