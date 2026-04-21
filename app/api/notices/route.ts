import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, query, where, getDocs, addDoc, doc, getDoc, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { withAuth, withWarden } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/types';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const hostelBlockId = searchParams.get('hostelBlockId');
        const limitCount = parseInt(searchParams.get('limit') || '10');

        const noticesRef = collection(db, 'notices');
        let q;

        if (hostelBlockId) {
            q = query(
                noticesRef, 
                where('hostel_block_id', '==', hostelBlockId),
                orderBy('created_at', 'desc'),
                firestoreLimit(limitCount)
            );
        } else {
            q = query(noticesRef, orderBy('created_at', 'desc'), firestoreLimit(limitCount));
        }

        const snapshot = await getDocs(q);
        const notices = [];

        for (const noticeDoc of snapshot.docs) {
            const data = noticeDoc.data();
            
            // Fetch hostel block info
            let blockName = 'Hostel Hub System';
            if (data.hostel_block_id) {
                const blockDoc = await getDoc(doc(db, 'hostel_blocks', data.hostel_block_id));
                if (blockDoc.exists()) {
                    blockName = blockDoc.data().block_name;
                }
            }

            notices.push({
                _id: noticeDoc.id,
                id: noticeDoc.id,
                ...data,
                createdAt: data.created_at,
                expiresAt: data.expires_at,
                hostelInfo: {
                    id: data.hostel_block_id,
                    name: blockName
                },
                type: data.priority === 'Urgent' ? 'Emergency' : 'General',
                from: {
                    role: 'Administrative Officer',
                    name: 'Hostel Hub System'
                }
            });
        }

        // Apply secondary priority sorting: Urgent (1) > High (2) > Normal/Other (3)
        const priorityScore = (p: string) => {
            if (p === 'Urgent') return 1;
            if (p === 'High') return 2;
            return 3;
        };

        notices.sort((a, b) => {
            const scoreA = priorityScore(a.priority);
            const scoreB = priorityScore(b.priority);
            if (scoreA !== scoreB) return scoreA - scoreB;
            // Secondary sort by date (desc) - though already sorted by Firestore
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        return NextResponse.json(notices.slice(0, limitCount));
    } catch (error: any) {
        console.error('Error fetching notices:', error);
        return NextResponse.json({ error: 'Failed to fetch notices', details: error.message }, { status: 500 });
    }
});

export const POST = withWarden(async (request: AuthenticatedRequest) => {
    try {
        const body = await request.json();
        const { hostelBlockId, title, content, priority, expiresAt } = body;

        const noticesRef = collection(db, 'notices');
        const newNotice = {
            hostel_block_id: hostelBlockId,
            title,
            content,
            priority: priority || 'Normal',
            expires_at: expiresAt || null,
            created_at: new Date().toISOString()
        };

        const docRef = await addDoc(noticesRef, newNotice);

        return NextResponse.json({ ...newNotice, _id: docRef.id, id: docRef.id }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating notice:', error);
        return NextResponse.json(
            { error: 'Failed to create notice', details: error.message },
            { status: 500 }
        );
    }
});

