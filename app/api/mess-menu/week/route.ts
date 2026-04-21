import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const hostelBlockId = searchParams.get('hostelBlockId');

        const menuRef = collection(db, 'mess_menu');
        const q = hostelBlockId 
            ? query(menuRef, where('hostel_block_id', '==', hostelBlockId))
            : query(menuRef);
            
        const snapshot = await getDocs(q);

        const mapMeal = (mealType: string, items: string, timings: string) => ({
            mealType,
            items: items ? items.split(',').map(i => i.trim()) : [],
            timings
        });

        const menus = [];
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

            menus.push({
                _id: menuDoc.id,
                id: menuDoc.id,
                day: row.day,
                date: new Date().toISOString(),
                hostelName: blockName,
                meals: [
                    mapMeal('Breakfast', row.breakfast, '07:30 AM - 09:30 AM'),
                    mapMeal('Lunch', row.lunch, '12:30 PM - 02:30 PM'),
                    mapMeal('Snacks', row.snacks, '04:30 PM - 05:30 PM'),
                    mapMeal('Dinner', row.dinner, '07:30 PM - 09:30 PM')
                ]
            });
        }

        // Custom sort by day of week
        const dayOrder: { [key: string]: number } = {
            'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
            'Friday': 5, 'Saturday': 6, 'Sunday': 7
        };

        menus.sort((a, b) => (dayOrder[a.day] || 8) - (dayOrder[b.day] || 8));

        return NextResponse.json({
            success: true,
            menus,
            count: menus.length
        });

    } catch (error: any) {
        console.error('Error fetching weekly menu:', error);
        return NextResponse.json(
            { error: 'Failed to fetch weekly menu', details: error.message },
            { status: 500 }
        );
    }
}


