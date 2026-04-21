import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, query, where, getDocs, addDoc, doc, getDoc, orderBy, limit as firestoreLimit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        const storiesRef = collection(db, 'stories');
        let q = query(storiesRef, orderBy('created_at', 'desc'), firestoreLimit(20));

        if (userId) {
            q = query(storiesRef, where('user_id', '==', userId), orderBy('created_at', 'desc'), firestoreLimit(20));
        }

        const snapshot = await getDocs(q);
        const stories = [];

        for (const storyDoc of snapshot.docs) {
            const data = storyDoc.data();
            
            // Hydrate author info
            let authorName = 'Anonymous';
            if (data.user_id) {
                const userDoc = await getDoc(doc(db, 'users', data.user_id));
                if (userDoc.exists()) {
                    authorName = userDoc.data().name;
                }
            }

            stories.push({
                ...data,
                _id: storyDoc.id,
                id: storyDoc.id,
                author: { name: authorName }
            });
        }

        return NextResponse.json(stories);
    } catch (error: any) {
        console.error('Error fetching stories:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, title, content, image, tags } = body;

        const storiesRef = collection(db, 'stories');
        const newStory = {
            user_id: userId,
            title,
            content,
            image: image || null,
            tags: tags || [],
            created_at: new Date().toISOString()
        };

        const docRef = await addDoc(storiesRef, newStory);

        return NextResponse.json({ ...newStory, _id: docRef.id, id: docRef.id }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating story:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

