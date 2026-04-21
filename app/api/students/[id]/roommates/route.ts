import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { withStudent } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/types';

export const GET = withStudent(async (
    request: AuthenticatedRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const { id } = await params;

        // 1. Get current student
        const studentDocRef = doc(db, 'students', id);
        const studentDoc = await getDoc(studentDocRef);

        if (!studentDoc.exists()) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        const studentData = studentDoc.data();

        // Security check: Match URL student ID with authenticated user ID
        if (studentData.user_id !== request.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        if (!studentData.hostel_block_id || !studentData.room_number) {
            return NextResponse.json({ success: true, roommates: [] });
        }

        // 2. Find others in the same room
        const studentsRef = collection(db, 'students');
        const q = query(
            studentsRef, 
            where('hostel_block_id', '==', studentData.hostel_block_id),
            where('room_number', '==', studentData.room_number)
        );
        
        const querySnapshot = await getDocs(q);
        
        const roommates: any[] = [];
        
        for (const roommateDoc of querySnapshot.docs) {
            if (roommateDoc.id === id) continue; // Skip current student
            
            const rData = roommateDoc.data();
            
            // Fetch user info for roommate
            let userData = { name: 'Unknown', email: '' };
            if (rData.user_id) {
                const userDocRef = doc(db, 'users', rData.user_id);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const ud = userDoc.data();
                    userData = { name: ud.name, email: ud.email };
                }
            }
            
            roommates.push({
                _id: roommateDoc.id,
                id: roommateDoc.id,
                name: userData.name,
                email: userData.email,
                photo: rData.photo,
                course: rData.course,
                year: rData.year
            });
        }

        return NextResponse.json({
            success: true,
            roommates
        });
    } catch (error: any) {
        console.error('Error fetching roommates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch roommates', details: error.message },
            { status: 500 }
        );
    }
});

