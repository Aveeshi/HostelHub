const { Client } = require('pg');

async function testConnection(host, user, password, database) {
    const client = new Client({ host, user, password, database, port: 5432 });
    try {
        await client.connect();
        console.log(`[SUCCESS] Connected to database '${database}' at ${host} as ${user}`);
        const res = await client.query('SELECT current_database(), current_user');
        console.log('Result:', res.rows[0]);
        await client.end();
        return true;
    } catch (err) {
        console.error(`[FAILED] Connecting to database '${database}' at ${host}:`, err.message, err.code);
        return false;
    }
}

async function run() {
    console.log("Testing with password '1234'...");
    await testConnection('localhost', 'postgres', '1234', 'postgres');
    await testConnection('127.0.0.1', 'postgres', '1234', 'postgres');
    await testConnection('::1', 'postgres', '1234', 'postgres');
    await testConnection('localhost', 'postgres', '1234', 'hostelhub');
    await testConnection('127.0.0.1', 'postgres', '1234', 'hostelhub');
}

run();
