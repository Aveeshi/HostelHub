import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { hostelId, studentId, checkIn, checkOut, amount } = body;

        if (!hostelId || !checkIn || !checkOut) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const bookingsRef = collection(db, 'bookings');
        const newBooking = {
            hostelId,
            studentId,
            checkIn,
            checkOut,
            amount: amount || 0,
            status: 'Confirmed',
            created_at: new Date().toISOString()
        };

        const docRef = await addDoc(bookingsRef, newBooking);

        return NextResponse.json({ ...newBooking, _id: docRef.id, id: docRef.id }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating booking:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
