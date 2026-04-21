import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const blockId = searchParams.get('blockId');
        const day = searchParams.get('day');

        const menuRef = collection(db, 'mess_menu');
        const qConstraints = [];
        
        if (blockId) qConstraints.push(where('hostel_block_id', '==', blockId));
        if (day) qConstraints.push(where('day', '==', day));

        const q = qConstraints.length > 0 ? query(menuRef, ...qConstraints) : query(menuRef);
        const snapshot = await getDocs(q);

        const mapMeal = (mealType: string, items: string, timings: string, calories: number) => ({
            mealType,
            items: items ? items.split(',').map(i => i.trim()) : [],
            timings,
            calories
        });

        const mappedMenus = [];
        for (const menuDoc of snapshot.docs) {
            const row = menuDoc.data();
            
            // Fetch hostel block info
            let blockName = 'Unknown Hostel';
            if (row.hostel_block_id) {
                const blockDoc = await getDoc(doc(db, 'hostel_blocks', row.hostel_block_id));
                if (blockDoc.exists()) {
                    blockName = blockDoc.data().block_name;
                }
            }

            mappedMenus.push({
                _id: menuDoc.id,
                id: menuDoc.id,
                date: new Date().toISOString(),
                day: row.day,
                hostelName: blockName,
                meals: [
                    mapMeal('Breakfast', row.breakfast, '07:30 AM - 09:30 AM', 450),
                    mapMeal('Lunch', row.lunch, '12:30 PM - 02:30 PM', 850),
                    mapMeal('Snacks', row.snacks, '04:30 PM - 05:30 PM', 300),
                    mapMeal('Dinner', row.dinner, '07:30 PM - 09:30 PM', 750)
                ]
            });
        }

        return NextResponse.json(day ? mappedMenus[0] : mappedMenus);
    } catch (error: any) {
        console.error('Error fetching mess menu:', error);
        return NextResponse.json(
            { error: 'Failed to fetch mess menu', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { hostelBlockId, day, breakfast, lunch, snacks, dinner } = body;

        const menuRef = collection(db, 'mess_menu');
        const newMenu = {
            hostel_block_id: hostelBlockId,
            day,
            breakfast: breakfast || '',
            lunch: lunch || '',
            snacks: snacks || '',
            dinner: dinner || '',
            created_at: new Date().toISOString()
        };

        const docRef = await addDoc(menuRef, newMenu);

        return NextResponse.json({ ...newMenu, _id: docRef.id, id: docRef.id }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating mess menu:', error);
        return NextResponse.json(
            { error: 'Failed to create mess menu', details: error.message },
            { status: 500 }
        );
    }
}

