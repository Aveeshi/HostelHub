import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { withStudent } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/types';

export const GET = withStudent(async (request: AuthenticatedRequest) => {
    try {
        // Securely fetch the student ID from the database using the authenticated user ID
        const studentsRef = collection(db, 'students');
        const qStudent = query(studentsRef, where('user_id', '==', request.user.id));
        const studentSnapshot = await getDocs(qStudent);
        
        if (studentSnapshot.empty) {
            return NextResponse.json(
                { error: 'Student profile not found' },
                { status: 404 }
            );
        }

        const studentId = studentSnapshot.docs[0].id;

        const applicationsRef = collection(db, 'hostel_applications');
        const qApps = query(applicationsRef, where('student_id', '==', studentId), orderBy('created_at', 'desc'));
        const appSnapshot = await getDocs(qApps);

        const applications = [];
        for (const appDoc of appSnapshot.docs) {
            const appData = appDoc.data();
            
            // Fetch hostel block info
            let hostelBlockInfo: any = { _id: appData.hostel_block_id };
            if (appData.hostel_block_id) {
                const blockDoc = await getDoc(doc(db, 'hostel_blocks', appData.hostel_block_id));
                if (blockDoc.exists()) {
                    const bData = blockDoc.data();
                    hostelBlockInfo = {
                        _id: blockDoc.id,
                        blockName: bData.block_name,
                        type: bData.type,
                        location: bData.location
                    };
                }
            }

            applications.push({
                ...appData,
                _id: appDoc.id,
                id: appDoc.id,
                hostelBlockId: hostelBlockInfo
            });
        }

        return NextResponse.json(applications);

    } catch (error: any) {
        console.error('Error fetching student applications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch applications', details: error.message },
            { status: 500 }
        );
    }
});

