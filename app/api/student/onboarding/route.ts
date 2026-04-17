import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { extractToken, verifyToken } from '@/lib/jwt';

export async function PUT(request: NextRequest) {
    let client;
    try {
        const token = extractToken(request);
        const user = token ? verifyToken(token) : null;
        
        if (!user || user.role !== 'Student') {
            return NextResponse.json({ error: 'Unauthorized. Only students can update onboarding profile.' }, { status: 401 });
        }

        const body = await request.json();
        const { sleepHabit, drinksSmokes, college, intro, year } = body;

        client = await pool.connect();
        
        // Find the student record associated with this user
        const studentRes = await client.query('SELECT id FROM students WHERE user_id = $1', [user.id || user._id]);
        if (studentRes.rowCount === 0) {
            return NextResponse.json({ error: 'Student profile not found.' }, { status: 404 });
        }
        const studentId = studentRes.rows[0].id;

        // Update the student preferences
        const updateQuery = `
            UPDATE students 
            SET 
                sleep_habit = $1,
                drinks_smokes = $2,
                college = $3,
                intro = $4,
                year = COALESCE($5, year),
                updated_at = NOW()
            WHERE id = $6
            RETURNING *
        `;
        
        const updateParams = [
            sleepHabit || null,
            drinksSmokes === 'yes' ? true : (drinksSmokes === 'no' ? false : null),
            college || null,
            intro || null,
            year ? parseInt(year) : null,
            studentId
        ];

        const updateRes = await client.query(updateQuery, updateParams);

        if (updateRes.rowCount === 0) {
            return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Onboarding profile updated successfully.',
            student: updateRes.rows[0]
        }, { status: 200 });

    } catch (error: any) {
        console.error('Onboarding update error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile', details: error.message },
            { status: 500 }
        );
    } finally {
        if (client) client.release();
    }
}
