import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, writeBatch, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { hostels } from '@/lib/mockData';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const force = searchParams.get('force') === 'true';

        const batch = writeBatch(db);
        const hostelsRef = collection(db, 'hostel_blocks');

        if (force) {
            // FORCE mode: wipe everything and re-seed from mockData (old destructive behavior)
            // Only triggered explicitly via ?force=true — the Sync button in the UI
            const existingDocs = await getDocs(hostelsRef);
            existingDocs.forEach((existingDoc) => {
                batch.delete(existingDoc.ref);
            });

            for (const hostel of hostels) {
                const newDocRef = doc(db, 'hostel_blocks', hostel.id.toString());
                const hostelData = {
                    block_name: hostel.name,
                    type: (hostel as any).gender === 'Co-ed' ? 'Co-ed' : (hostel as any).gender,
                    location: hostel.location,
                    description: hostel.description,
                    baseRent: hostel.price,
                    total_rooms: 100,
                    available_rooms: 15,
                    facilities: hostel.amenities || [],
                    images: hostel.images || [],
                    rating: hostel.rating || 4.5,
                    created_at: new Date().toISOString(),
                    approvalStatus: 'Approved',
                    wardenInfo: {
                        name: 'Dr. Admin',
                        phone: '1800-100-200',
                        email: 'admin@hostelhub.com'
                    }
                };
                batch.set(newDocRef, hostelData);
            }

            await batch.commit();
            return NextResponse.json({ success: true, message: 'Force-reset complete. All data reloaded from mockData.js.' });
        }

        // SAFE mode (default): only create docs that don't exist yet.
        // Existing docs — including their uploaded images — are NEVER touched.
        let seeded = 0;
        let skipped = 0;

        for (const hostel of hostels) {
            const docRef = doc(db, 'hostel_blocks', hostel.id.toString());
            const snap = await getDoc(docRef);

            if (snap.exists()) {
                // Document already in Firebase — leave it completely alone so images are preserved
                skipped++;
            } else {
                // Brand new doc — safe to write default data
                await setDoc(docRef, {
                    block_name: hostel.name,
                    type: (hostel as any).gender === 'Co-ed' ? 'Co-ed' : (hostel as any).gender,
                    location: hostel.location,
                    description: hostel.description,
                    baseRent: hostel.price,
                    total_rooms: 100,
                    available_rooms: 15,
                    facilities: hostel.amenities || [],
                    images: hostel.images || [],
                    rating: hostel.rating || 4.5,
                    created_at: new Date().toISOString(),
                    approvalStatus: 'Approved',
                    wardenInfo: {
                        name: 'Dr. Admin',
                        phone: '1800-100-200',
                        email: 'admin@hostelhub.com'
                    }
                });
                seeded++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Safe seed complete. ${seeded} new hostel(s) created, ${skipped} existing hostel(s) preserved (images untouched).`
        });
    } catch (error: any) {
        console.error('Seeding failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
