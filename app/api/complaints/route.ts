import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, query, where, getDocs, addDoc, doc, getDoc, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { withStudentOrWarden } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/types';

export const GET = withStudentOrWarden(async (request: AuthenticatedRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        let studentId = searchParams.get('studentId');
        const status = searchParams.get('status');
        const limitCount = parseInt(searchParams.get('limit') || '10');

        // Security check: If Student, they can only see their own complaints
        if (request.user.role === 'Student') {
            const studentsRef = collection(db, 'students');
            const q = query(studentsRef, where('user_id', '==', request.user.id));
            const snapshot = await getDocs(q);
            studentId = snapshot.empty ? 'none' : snapshot.docs[0].id;
        }

        const complaintsRef = collection(db, 'complaints');
        let q = query(complaintsRef, orderBy('created_at', 'desc'), firestoreLimit(limitCount));

        if (studentId) {
            q = query(complaintsRef, where('student_id', '==', studentId), orderBy('created_at', 'desc'), firestoreLimit(limitCount));
        }
        
        // Firestore doesn't support multiple where filters with different fields efficiently without composite indexes
        // If status is also provided, we might need a composite index or filter in memory
        
        const snapshot = await getDocs(q);
        const complaints = [];

        for (const complaintDoc of snapshot.docs) {
            const data = complaintDoc.data();
            
            // Filter by status in memory if provided (to avoid needing many composite indexes)
            if (status && data.status !== status) continue;

            // Hydrate student info
            let studentInfo: any = { _id: data.student_id };
            if (data.student_id) {
                const sDoc = await getDoc(doc(db, 'students', data.student_id));
                if (sDoc.exists()) {
                    const sData = sDoc.data();
                    studentInfo = {
                        _id: sDoc.id,
                        roomNumber: sData.room_number
                    };
                    
                    if (sData.user_id) {
                        const uDoc = await getDoc(doc(db, 'users', sData.user_id));
                        if (uDoc.exists()) {
                            const uData = uDoc.data();
                            studentInfo.name = uData.name;
                            studentInfo.email = uData.email;
                        }
                    }
                }
            }

            complaints.push({
                _id: complaintDoc.id,
                id: complaintDoc.id,
                studentId: studentInfo,
                title: data.title,
                description: data.description,
                status: data.status,
                createdAt: data.created_at
            });
        }

        return NextResponse.json(complaints);
    } catch (error: any) {
        console.error('Error fetching complaints:', error);
        return NextResponse.json(
            { error: 'Failed to fetch complaints', details: error.message },
            { status: 500 }
        );
    }
});

export const POST = withStudentOrWarden(async (request: AuthenticatedRequest) => {
    try {
        const body = await request.json();
        const { title, description } = body;

        // Securely fetch student_id for the authenticated user
        const studentsRef = collection(db, 'students');
        const q = query(studentsRef, where('user_id', '==', request.user.id));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
        }
        
        const studentId = snapshot.docs[0].id;

        const complaintsRef = collection(db, 'complaints');
        const newComplaint = {
            student_id: studentId,
            title,
            description,
            status: 'Pending',
            created_at: new Date().toISOString()
        };

        const docRef = await addDoc(complaintsRef, newComplaint);

        return NextResponse.json({ ...newComplaint, _id: docRef.id, id: docRef.id }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating complaint:', error);
        return NextResponse.json(
            { error: 'Failed to create complaint', details: error.message },
            { status: 500 }
        );
    }
});

