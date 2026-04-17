const fs = require('fs');
const { Client } = require('pg');

async function dumpRecentData() {
    const client = new Client({
        connectionString: 'postgresql://postgres:1234@localhost:5432/hostelhub?sslmode=disable'
    });
    try {
        await client.connect();
        const users = await client.query("SELECT * FROM users ORDER BY created_at DESC LIMIT 5");
        const students = await client.query("SELECT * FROM students ORDER BY created_at DESC LIMIT 5");
        
        fs.writeFileSync('db-output.json', JSON.stringify({
            users: users.rows,
            students: students.rows
        }, null, 2));
    } catch (e) {
        fs.writeFileSync('db-output.json', JSON.stringify({ error: e.message }));
    } finally {
        await client.end();
    }
}
dumpRecentData();
