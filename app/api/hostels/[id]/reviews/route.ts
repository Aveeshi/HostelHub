import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, orderBy } from 'firebase/firestore';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, where('hostel_block_id', '==', id), orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);

        let totalRating = 0;
        const reviews: any[] = [];

        for (const reviewDoc of querySnapshot.docs) {
            const data = reviewDoc.data();
            totalRating += data.rating || 0;

            // Fetch student/user name
            let studentName = 'Anonymous';
            if (data.student_id) {
                const studentDoc = await getDoc(doc(db, 'students', data.student_id));
                if (studentDoc.exists()) {
                    const sData = studentDoc.data();
                    if (sData.user_id) {
                        const userDoc = await getDoc(doc(db, 'users', sData.user_id));
                        if (userDoc.exists()) {
                            studentName = userDoc.data().name;
                        }
                    }
                }
            }

            reviews.push({
                ...data,
                _id: reviewDoc.id,
                id: reviewDoc.id,
                student_name: studentName
            });
        }

        const stats = {
            averageRating: querySnapshot.size > 0 ? totalRating / querySnapshot.size : 0,
            totalReviews: querySnapshot.size
        };

        return NextResponse.json({
            reviews,
            averageRating: stats.averageRating,
            totalReviews: stats.totalReviews
        });
    } catch (error: any) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { studentId, rating, reviewText } = body;

        const reviewsRef = collection(db, 'reviews');
        const newReview = {
            student_id: studentId,
            hostel_block_id: id,
            rating: parseInt(rating),
            review_text: reviewText,
            helpful: 0,
            created_at: new Date().toISOString()
        };

        const docRef = await addDoc(reviewsRef, newReview);

        // Update overall rating in hostel_blocks
        // 1. Fetch all reviews for this block
        const q = query(reviewsRef, where('hostel_block_id', '==', id));
        const snapshot = await getDocs(q);
        let total = 0;
        snapshot.forEach(d => total += (d.data().rating || 0));
        const avg = snapshot.size > 0 ? total / snapshot.size : rating;

        // 2. Update hostel block
        const hostelRef = doc(db, 'hostel_blocks', id);
        await updateDoc(hostelRef, { rating: avg });

        return NextResponse.json({ 
            success: true, 
            review: { ...newReview, _id: docRef.id, id: docRef.id } 
        });
    } catch (error: any) {
        console.error('Error posting review:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

