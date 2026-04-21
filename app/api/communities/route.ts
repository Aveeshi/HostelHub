import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, query, getDocs, addDoc, orderBy } from 'firebase/firestore';

export async function GET(request: NextRequest) {
    try {
        const communitiesRef = collection(db, 'communities');
        const q = query(communitiesRef, orderBy('member_count', 'desc'));
        const snapshot = await getDocs(q);
        
        const communities = snapshot.docs.map(doc => ({
            ...doc.data(),
            _id: doc.id,
            id: doc.id
        }));

        return NextResponse.json(communities);
    } catch (error: any) {
        console.error('Error fetching communities:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, image } = body;

        const communitiesRef = collection(db, 'communities');
        const newCommunity = {
            name,
            description: description || '',
            image: image || null,
            member_count: 0,
            created_at: new Date().toISOString()
        };

        const docRef = await addDoc(communitiesRef, newCommunity);

        return NextResponse.json({ ...newCommunity, _id: docRef.id, id: docRef.id }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating community:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

