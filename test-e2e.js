async function e2e() {
    const email = "e2enew" + Date.now() + "@gmail.com";
    console.log("Signing up", email);
    
    let res;
    try {
        res = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email, password: "password", name: "E2E User", phone: "1234567890", role: "Student"
            })
        });
    } catch(e) {
        console.error("Server is not running on port 3000!", e.message);
        return;
    }
    
    const signupData = await res.json();
    console.log("Signup returned:", res.status, signupData);

    if (!signupData.token) {
        console.log("No token array, stopping.");
        return;
    }

    const payloadRaw = signupData.token.split('.')[1];
    const payload = Buffer.from(payloadRaw, 'base64').toString('utf8');
    console.log("ACTUAL JWT PAYLOAD:", payload);

    console.log("Sending PUT onboarding...");
    const obRes = await fetch('http://localhost:3000/api/student/onboarding', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${signupData.token}`
        },
        body: JSON.stringify({
            sleepHabit: 'Night owl', drinksSmokes: 'no', college: 'PICT', intro: 'E2E intro', year: '1'
        })
    });
    
    const obData = await obRes.json();
    console.log("Onboarding returned:", obRes.status, obData);
}
e2e();
