require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function addOnboardingFields() {
    let client;
    try {
        console.log('Connecting to database...');
        client = await pool.connect();

        console.log('Adding onboarding fields to students table...');
        
        await client.query(`
            ALTER TABLE students
            ADD COLUMN IF NOT EXISTS sleep_habit TEXT,
            ADD COLUMN IF NOT EXISTS drinks_smokes BOOLEAN,
            ADD COLUMN IF NOT EXISTS college TEXT,
            ADD COLUMN IF NOT EXISTS intro TEXT;
        `);

        console.log('Successfully added onboarding fields.');
    } catch (err) {
        console.error('Error adding onboarding fields:', err);
    } finally {
        if (client) {
            client.release();
        }
        await pool.end();
        console.log('Database connection closed.');
    }
}

addOnboardingFields();
