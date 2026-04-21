import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { withAdmin } from '@/lib/middleware';

export const GET = withAdmin(async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const blocksRef = collection(db, 'hostel_blocks');
        let q;

        if (status && status !== 'All') {
            q = query(
                blocksRef, 
                where('approval_status', '==', status),
                orderBy('created_at', 'desc')
            );
        } else {
            q = query(blocksRef, orderBy('created_at', 'desc'));
        }

        const snapshot = await getDocs(q);
        const hostels = [];

        for (const blockDoc of snapshot.docs) {
            const data = blockDoc.data();
            
            // Fetch warden info
            let wardenInfo = { name: 'Unassigned', email: 'n/a' };
            if (data.warden_user_id) {
                const userDocRef = doc(db, 'users', data.warden_user_id);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const uData = userDoc.data();
                    wardenInfo = {
                        name: uData.name || 'Unknown',
                        email: uData.email || 'n/a'
                    };
                }
            }

            hostels.push({
                _id: blockDoc.id,
                blockName: data.block_name,
                type: data.type,
                description: data.description,
                totalRooms: data.total_rooms,
                availableRooms: data.available_rooms,
                occupiedRooms: data.occupied_rooms,
                location: data.location,
                rating: parseFloat(data.rating || 0),
                approvalStatus: data.approval_status || 'Approved',
                wardenInfo
            });
        }

        return NextResponse.json(hostels);
    } catch (error: any) {
        console.error('Error fetching hostels for admin:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hostels', details: error.message },
            { status: 500 }
        );
    }
});

