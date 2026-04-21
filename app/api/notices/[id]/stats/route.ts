import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const acksRef = collection(db, 'notice_acknowledgements');
        const q = query(acksRef, where('notice_id', '==', id), orderBy('acknowledged_at', 'desc'));
        const snapshot = await getDocs(q);

        const acknowledgements = [];
        for (const ackDoc of snapshot.docs) {
            const data = ackDoc.data();
            
            // Hydrate student and user info
            let studentInfo: any = {};
            if (data.student_id) {
                const sDoc = await getDoc(doc(db, 'students', data.student_id));
                if (sDoc.exists()) {
                    const sData = sDoc.data();
                    studentInfo.photo = sData.photo;
                    
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

            acknowledgements.push({
                acknowledged_at: data.acknowledged_at,
                ...studentInfo
            });
        }

        return NextResponse.json({
            success: true,
            noticeId: id,
            totalAcknowledgements: acknowledgements.length,
            acknowledgements: acknowledgements
        });

    } catch (error: any) {
        console.error('Error fetching notice stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notice stats', details: error.message },
            { status: 500 }
        );
    }
}

