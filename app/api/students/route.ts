import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const course = searchParams.get('course');
        const year = searchParams.get('year');
        const blockId = searchParams.get('blockId');

        const studentsRef = collection(db, 'students');
        let queryConstraints = [];

        if (course) {
            queryConstraints.push(where('course', '==', course));
        }
        if (year) {
            queryConstraints.push(where('year', '==', parseInt(year)));
        }
        if (blockId) {
            queryConstraints.push(where('hostelBlockId', '==', blockId));
        }

        const q = query(studentsRef, ...queryConstraints);
        const snapshot = await getDocs(q);

        let students: any[] = [];
        snapshot.forEach((doc: any) => {
            const data = doc.data();
            students.push({
                _id: doc.id,
                userId: data.userId,
                rollNumber: data.rollNumber,
                course: data.course,
                year: data.year,
                department: data.department,
                // Fallback since SQL joins are removed
                hostelBlockId: data.hostelBlockId ? {
                    _id: data.hostelBlockId,
                    blockName: data.blockName || 'Assigned Block' 
                } : null,
                roomNumber: data.roomNumber,
                enrollmentStatus: data.enrollmentStatus,
                name: data.name,
                email: data.email,
                phone: data.phone
            });
        });

        return NextResponse.json(students);
    } catch (error: any) {
        console.error('Error fetching students:', error);
        return NextResponse.json(
            { error: 'Failed to fetch students', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, rollNumber, course, year, department, hostelBlockId, roomNumber, name, email, phone } = body;

        const studentsRef = collection(db, 'students');
        const newStudent = {
            userId,
            rollNumber,
            course,
            year,
            department,
            hostelBlockId,
            roomNumber,
            name: name || '',
            email: email || '',
            phone: phone || '',
            enrollmentStatus: 'Active',
            created_at: new Date().toISOString()
        };

        const docRef = await addDoc(studentsRef, newStudent);

        return NextResponse.json({ ...newStudent, _id: docRef.id, id: docRef.id }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating student:', error);
        return NextResponse.json(
            { error: 'Failed to create student', details: error.message },
            { status: 500 }
        );
    }
}
