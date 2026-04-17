const { generateToken } = require('./lib/jwt.js');
const fs = require('fs');

async function testSubmit() {
    // Read the user we know exists in DB
    const dbData = JSON.parse(fs.readFileSync('db-output.json', 'utf8'));
    const freshUser = dbData.users[0];
    
    console.log("Testing with user:", freshUser.email, freshUser.id);
    
    const token = generateToken({
        _id: freshUser.id,
        email: freshUser.email,
        role: freshUser.role,
        name: freshUser.name,
        canAccessDashboard: freshUser.can_access_dashboard
    });
    
    console.log("Sending PUT request to /api/student/onboarding...");
    
    try {
        const res = await fetch('http://localhost:3000/api/student/onboarding', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                sleepHabit: 'Night owl',
                drinksSmokes: 'no',
                college: 'PICT',
                intro: 'Hello world',
                year: '2'
            })
        });
        const data = await res.json();
        console.log("Response status:", res.status);
        console.log("Response data:", data);
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}
testSubmit();
