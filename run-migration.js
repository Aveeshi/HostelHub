const fs = require('fs');
const { Client } = require('pg');

async function runMigration() {
    // using the exact password they confirmed
    const client = new Client({
        connectionString: 'postgresql://postgres:1234@localhost:5432/hostelhub?sslmode=disable'
    });
    try {
        await client.connect();
        console.log("Connected to PostgreSQL successfully!");
        
        const sql = fs.readFileSync('scripts/init-db.sql', 'utf8');
        console.log("Executing scripts/init-db.sql...");
        
        await client.query(sql);
        console.log("Migration executed successfully! Tables like 'users' have been created.");
    } catch (e) {
        console.error("Migration failed:", e.message);
    } finally {
        await client.end();
    }
}
runMigration();
