import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, addDoc } from 'firebase/firestore';

// POST /api/hostels/[id]/comments/[commentId]/reply - Reply to a comment
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string, commentId: string }> }
) {
    try {
        const { id, commentId } = await params;
        const body = await request.json();
        const { userId, text, userType } = body;

        const commentsRef = collection(db, 'hostel_comments');
        const newReply = {
            hostel_block_id: id,
            user_id: userId,
            user_type: userType || 'Student',
            comment_text: text,
            parent_id: commentId,
            created_at: new Date().toISOString()
        };

        const docRef = await addDoc(commentsRef, newReply);

        return NextResponse.json({
            success: true,
            reply: { ...newReply, _id: docRef.id, id: docRef.id }
        });
    } catch (error: any) {
        console.error('Error replying to comment:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

