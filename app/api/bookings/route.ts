import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { hostelId, hostel_block_id, studentId, student_id, checkIn, check_in, checkOut, check_out, amount } = body;

        // Support both camelCase (from incoming request) and snake_case (standardized)
        const finalHostelId = hostelId || hostel_block_id;
        const finalStudentId = studentId || student_id;
        const finalCheckIn = checkIn || check_in;
        const finalCheckOut = checkOut || check_out;

        if (!finalHostelId || !finalCheckIn || !finalCheckOut) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const bookingsRef = collection(db, 'bookings');
        const newBooking = {
            hostel_block_id: finalHostelId,
            student_id: finalStudentId,
            check_in: finalCheckIn,
            check_out: finalCheckOut,
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

