import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { extractToken, verifyToken } from '@/lib/jwt';

export async function PUT(request: NextRequest) {
    try {
        const token = extractToken(request);
        const user = token ? verifyToken(token) : null;
        
        if (!user || user.role !== 'Student') {
            return NextResponse.json({ error: 'Unauthorized. Only students can update onboarding profile.' }, { status: 401 });
        }

        const body = await request.json();
        const { sleepHabit, drinksSmokes, college, intro, year } = body;

        // Find the student record associated with this user
        const studentsRef = collection(db, 'students');
        const q = query(studentsRef, where('user_id', '==', user.id || user._id));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return NextResponse.json({ error: 'Student profile not found.' }, { status: 404 });
        }
        
        const studentDoc = querySnapshot.docs[0];
        const studentId = studentDoc.id;

        // Update the student preferences
        const updateData: any = {
            sleep_habit: sleepHabit || null,
            drinks_smokes: drinksSmokes === 'yes' ? true : (drinksSmokes === 'no' ? false : null),
            college: college || null,
            intro: intro || null,
            updated_at: new Date().toISOString()
        };
        
        if (year) {
            updateData.year = parseInt(year);
        }

        const studentDocRef = doc(db, 'students', studentId);
        await updateDoc(studentDocRef, updateData);

        return NextResponse.json({
            success: true,
            message: 'Onboarding profile updated successfully.',
            student: { id: studentId, ...studentDoc.data(), ...updateData }
        }, { status: 200 });

    } catch (error: any) {
        console.error('Onboarding update error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile', details: error.message },
            { status: 500 }
        );
    }
}

