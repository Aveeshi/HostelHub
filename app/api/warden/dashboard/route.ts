import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { withWarden } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/types';

export const GET = withWarden(async (request: AuthenticatedRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const blockId = searchParams.get('blockId');

        const wardenId = request.user?.id;

        // Get the blocks this warden is responsible for
        const blocksRef = collection(db, 'hostel_blocks');
        const wardenBlocksQuery = query(blocksRef, where('warden_user_id', '==', wardenId));
        const wardenBlocksSnapshot = await getDocs(wardenBlocksQuery);
        
        const wardenBlocks = wardenBlocksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        const wardenBlockIds = wardenBlocks.map(b => b.id);

        if (wardenBlockIds.length === 0 && request.user?.role !== 'Admin') {
            return NextResponse.json({
                success: true,
                stats: { totalBlocks: 0, totalStudents: 0, pendingApplications: 0, acceptedApplications: 0, complaints: { pending: 0, assigned: 0, inProgress: 0, resolvedToday: 0 } },
                occupancy: [],
                applications: []
            });
        }

        // Use selected blockId or all warden blocks
        const targetBlockIds = blockId ? [blockId] : wardenBlockIds;

        // 1. Fetch Students count
        const studentsRef = collection(db, 'students');
        // Firestore doesn't support 'in' with more than 30 values, but usually it's few blocks
        const studentQuery = query(studentsRef, where('hostel_block_id', 'in', targetBlockIds));
        const studentSnapshot = await getDocs(studentQuery);
        const studentsCount = studentSnapshot.size;

        // 2. Fetch Applications
        const applicationsRef = collection(db, 'hostel_applications');
        const appQuery = query(applicationsRef, where('hostel_block_id', 'in', targetBlockIds), orderBy('created_at', 'desc'), limit(20));
        const appSnapshot = await getDocs(appQuery);
        
        let pendingApplications = 0;
        let acceptedApplications = 0;
        
        // We'll calculate totals from all applications for these blocks
        // Ideally we'd have a separate counter or fetch all if small, but let's do a summary query
        const allAppsQuery = query(applicationsRef, where('hostel_block_id', 'in', targetBlockIds));
        const allAppsSnapshot = await getDocs(allAppsQuery);
        allAppsSnapshot.forEach(doc => {
            const status = doc.data().status;
            if (status === 'Pending') pendingApplications++;
            if (status === 'Accepted') acceptedApplications++;
        });

        // 3. Occupancy Stats
        const occupancyStats = wardenBlocks.map((block: any) => ({
            blockId: block.id,
            blockName: block.block_name,
            type: block.type,
            totalRooms: block.total_rooms || 0,
            occupiedRooms: block.occupied_rooms || 0,
            availableRooms: block.available_rooms || 0,
            occupancyRate: block.total_rooms ? ((block.occupied_rooms / block.total_rooms) * 100).toFixed(1) : "0.0"
        }));

        // 4. Map Recent Applications with Student and User info
        const applications = [];
        for (const appDoc of appSnapshot.docs) {
            const appData = appDoc.data();
            
            // Get Student
            let sData: any = {};
            if (appData.student_id) {
                const sDoc = await getDoc(doc(db, 'students', appData.student_id));
                if (sDoc.exists()) {
                    sData = sDoc.data();
                    
                    // Get User
                    if (sData.user_id) {
                        const uDoc = await getDoc(doc(db, 'users', sData.user_id));
                        if (uDoc.exists()) {
                            const uData = uDoc.data();
                            sData = { ...sData, name: uData.name, email: uData.email, phone: uData.phone };
                        }
                    }
                }
            }
            
            applications.push({
                _id: appDoc.id,
                status: appData.status,
                applicationData: appData.application_data,
                createdAt: appData.created_at,
                hostelBlockId: appData.hostel_block_id,
                studentId: {
                    _id: appData.student_id,
                    name: sData.name || 'Unknown',
                    email: sData.email || '',
                    phone: sData.phone || '',
                    rollNumber: sData.roll_number,
                    course: sData.course,
                    year: sData.year,
                    department: sData.department,
                    feeStatus: { isPaid: true }
                }
            });
        }

        return NextResponse.json({
            success: true,
            stats: {
                totalBlocks: wardenBlocks.length,
                totalStudents: studentsCount,
                studentsInBlock: blockId ? studentsCount : null,
                pendingApplications,
                acceptedApplications,
                complaints: {
                    pending: 0,
                    assigned: 0,
                    inProgress: 0,
                    resolvedToday: 0
                }
            },
            occupancy: occupancyStats,
            applications
        });

    } catch (error: any) {
        console.error('Error fetching warden dashboard:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data', details: error.message },
            { status: 500 }
        );
    }
});

