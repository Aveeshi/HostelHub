const fs = require('fs');
const { Client } = require('pg');

async function testQuery() {
    const dbData = JSON.parse(fs.readFileSync('db-output.json', 'utf8'));
    const freshUser = dbData.users[0];
    
    // Testing the exact query Next.js uses
    const client = new Client({
        connectionString: 'postgresql://postgres:1234@localhost:5432/hostelhub?sslmode=disable'
    });
    try {
        await client.connect();
        console.log("Searching for user_id:", freshUser.id);
        const res = await client.query('SELECT id FROM students WHERE user_id = $1', [freshUser.id]);
        console.log("Result rows:", res.rows);
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await client.end();
    }
}
testQuery();
