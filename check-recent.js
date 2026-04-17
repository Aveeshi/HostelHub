const { Client } = require('pg');

async function checkRecentData() {
    const client = new Client({
        connectionString: 'postgresql://postgres:1234@localhost:5432/hostelhub?sslmode=disable'
    });
    try {
        await client.connect();
        
        const users = await client.query('SELECT * FROM users ORDER BY id DESC LIMIT 2');
        console.log("RECENT USERS:");
        console.log(JSON.stringify(users.rows, null, 2));
        
        const students = await client.query('SELECT * FROM students ORDER BY id DESC LIMIT 2');
        console.log("RECENT STUDENTS:");
        console.log(JSON.stringify(students.rows, null, 2));
        
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
checkRecentData();
