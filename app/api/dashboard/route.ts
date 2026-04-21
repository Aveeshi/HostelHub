import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { withStudent } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/types';

export const GET = withStudent(async (request: AuthenticatedRequest) => {
    try {
        // Force the studentId to be the authenticated user's student ID
        const studentsRef = collection(db, 'students');
        const studentLookupQuery = query(studentsRef, where('user_id', '==', request.user.id));
        const studentLookupSnapshot = await getDocs(studentLookupQuery);
        
        if (studentLookupSnapshot.empty) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
        }
        
        const studentDoc = studentLookupSnapshot.docs[0];
        const studentId = studentDoc.id;
        const studentData = studentDoc.data();

        // 1. Fetch related data in parallel
        const [complaintsSnapshot, noticesSnapshot, menuSnapshot, userDoc, hostelDoc] = await Promise.all([
            // Recent Complaints
            getDocs(query(
                collection(db, 'complaints'),
                where('student_id', '==', studentId),
                orderBy('created_at', 'desc'),
                limit(3)
            )),
            
            // Recent Notices
            getDocs(query(
                collection(db, 'notices'),
                orderBy('created_at', 'desc'),
                limit(4)
            )),
            
            // Today's Mess Menu
            studentData.hostel_block_id ? getDocs(query(
                collection(db, 'mess_menu'),
                where('hostel_block_id', '==', studentData.hostel_block_id),
                where('day', '==', new Date().toLocaleDateString('en-US', { weekday: 'long' }))
            )) : Promise.resolve({ empty: true, docs: [] }),

            // User Info
            getDoc(doc(db, 'users', request.user.id)),

            // Hostel Info (if assigned)
            studentData.hostel_block_id ? getDoc(doc(db, 'hostel_blocks', studentData.hostel_block_id)) : Promise.resolve({ exists: () => false })
        ]);

        const userData = (userDoc as any).exists() ? (userDoc as any).data() : {};
        const hostelData = (hostelDoc as any).exists() ? (hostelDoc as any).data() : {};

        // Map Student
        const mappedStudent = {
            _id: studentId,
            name: userData.name,
            rollNumber: studentData.roll_number,
            roomNumber: studentData.room_number,
            course: studentData.course,
            year: studentData.year,
            enrollmentStatus: studentData.enrollment_status,
            canAccessDashboard: userData.can_access_dashboard,
            feeStatus: {
                isPaid: studentData.enrollment_status === 'Active' || userData.can_access_dashboard === true,
                lastPayment: studentData.updated_at
            }
        };

        // Map Complaints
        const mappedComplaints = (complaintsSnapshot as any).docs.map((d: any) => ({
            _id: d.id,
            ...d.data(),
            createdAt: d.data().created_at
        }));

        // Map Notices
        const mappedNotices = (noticesSnapshot as any).docs.map((d: any) => {
            const n = d.data();
            return {
                _id: d.id,
                title: n.title,
                content: n.content,
                priority: n.priority,
                type: n.priority === 'Urgent' ? 'Emergency' : n.priority === 'High' ? 'Important' : 'General',
                from: {
                    role: 'Administrative Officer',
                    name: 'Hostel Hub System'
                },
                createdAt: n.created_at,
                hostelName: n.hostel_block_id === studentData.hostel_block_id ? (hostelData.block_name || 'Your Hostel') : 'Hostel Hub'
            };
        });

        // Map Menu
        const menuDoc = (menuSnapshot as any).docs[0];
        const menu = menuDoc ? menuDoc.data() : null;
        const mappedMenu = menu ? {
            _id: menuDoc.id,
            date: new Date().toISOString(),
            day: menu.day,
            specialMenu: false,
            meals: [
                {
                    mealType: 'Breakfast',
                    items: menu.breakfast?.split(',').map((i: string) => i.trim()).filter(Boolean) || [],
                    timings: '07:30 AM - 09:30 AM',
                    isVeg: true,
                    thumbsUp: menu.breakfast_up || 0,
                    thumbsDown: menu.breakfast_down || 0
                },
                {
                    mealType: 'Lunch',
                    items: menu.lunch?.split(',').map((i: string) => i.trim()).filter(Boolean) || [],
                    timings: '12:30 PM - 02:30 PM',
                    isVeg: true,
                    thumbsUp: menu.lunch_up || 0,
                    thumbsDown: menu.lunch_down || 0
                },
                {
                    mealType: 'Snacks',
                    items: menu.snacks?.split(',').map((i: string) => i.trim()).filter(Boolean) || [],
                    timings: '04:30 PM - 05:30 PM',
                    isVeg: true,
                    thumbsUp: menu.snacks_up || 0,
                    thumbsDown: menu.snacks_down || 0
                },
                {
                    mealType: 'Dinner',
                    items: menu.dinner?.split(',').map((i: string) => i.trim()).filter(Boolean) || [],
                    timings: '07:30 PM - 09:30 PM',
                    isVeg: true,
                    thumbsUp: menu.dinner_up || 0,
                    thumbsDown: menu.dinner_down || 0
                }
            ]
        } : null;

        return NextResponse.json({
            student: mappedStudent,
            complaints: mappedComplaints,
            notices: mappedNotices,
            messMenu: mappedMenu
        });

    } catch (error: any) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard data', details: error.message }, { status: 500 });
    }
});

