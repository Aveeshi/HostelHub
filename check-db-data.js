const { Client } = require('pg');

async function checkData() {
    const client = new Client({
        connectionString: 'postgresql://postgres:1234@localhost:5432/hostelhub?sslmode=disable'
    });
    try {
        await client.connect();
        
        const users = await client.query('SELECT id, email, role FROM users');
        console.log("USERS:");
        console.log(JSON.stringify(users.rows, null, 2));
        
        const students = await client.query('SELECT id, user_id, roll_number FROM students');
        console.log("STUDENTS:");
        console.log(JSON.stringify(students.rows, null, 2));
        
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
checkData();
