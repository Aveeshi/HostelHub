import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, query, where, getDocs, addDoc, doc, getDoc, orderBy } from 'firebase/firestore';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { userId, userType, text, parentId } = body;

        const commentsRef = collection(db, 'hostel_comments');
        const newComment = {
            hostel_block_id: id,
            user_id: userId,
            user_type: userType,
            comment_text: text,
            parent_id: parentId || null,
            created_at: new Date().toISOString()
        };

        const docRef = await addDoc(commentsRef, newComment);

        return NextResponse.json({ 
            success: true, 
            comment: { ...newComment, _id: docRef.id, id: docRef.id } 
        });
    } catch (error: any) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const commentsRef = collection(db, 'hostel_comments');
        const q = query(commentsRef, where('hostel_block_id', '==', id), orderBy('created_at', 'asc'));
        const querySnapshot = await getDocs(q);

        const comments = [];
        for (const commentDoc of querySnapshot.docs) {
            const data = commentDoc.data();
            
            // Fetch user info
            let userName = 'Unknown User';
            if (data.user_id) {
                const userDocRef = doc(db, 'users', data.user_id);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    userName = userDoc.data().name;
                }
            }

            comments.push({
                ...data,
                _id: commentDoc.id,
                id: commentDoc.id,
                user: { name: userName }
            });
        }

        return NextResponse.json(comments);
    } catch (error: any) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

