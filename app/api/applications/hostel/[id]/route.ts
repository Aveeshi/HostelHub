import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';

// GET /api/applications/hostel/[id] - List applications for a specific hostel (Warden view)
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // Fix type: Next.js 15+ params is a Promise
) {
    try {
        const { id } = await context.params;

        const applicationsRef = collection(db, 'hostel_applications');
        const q = query(applicationsRef, where('hostel_block_id', '==', id), orderBy('created_at', 'desc'));
        const snapshot = await getDocs(q);

        const applications = [];
        for (const appDoc of snapshot.docs) {
            const appData = appDoc.data();
            
            // Hydrate student and user info
            let studentInfo: any = { _id: appData.student_id };
            if (appData.student_id) {
                const sDoc = await getDoc(doc(db, 'students', appData.student_id));
                if (sDoc.exists()) {
                    const sData = sDoc.data();
                    studentInfo = {
                        _id: sDoc.id,
                        rollNumber: sData.roll_number,
                        course: sData.course,
                        year: sData.year,
                        department: sData.department,
                        feeStatus: 'Paid'
                    };
                    
                    // Fetch user info
                    if (sData.user_id) {
                        const uDoc = await getDoc(doc(db, 'users', sData.user_id));
                        if (uDoc.exists()) {
                            const uData = uDoc.data();
                            studentInfo = {
                                ...studentInfo,
                                name: uData.name,
                                email: uData.email,
                                phone: uData.phone
                            };
                        }
                    }
                }
            }

            applications.push({
                _id: appDoc.id,
                status: appData.status,
                applicationData: appData.application_data,
                createdAt: appData.created_at,
                hostelBlockId: appData.hostel_block_id,
                studentId: studentInfo
            });
        }

        return NextResponse.json(applications);

    } catch (error: any) {
        console.error('Error fetching applications for hostel:', error);
        return NextResponse.json(
            { error: 'Failed to fetch applications', details: error.message },
            { status: 500 }
        );
    }
}

