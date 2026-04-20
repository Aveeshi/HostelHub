const pool = require('./lib/db');

async function createHostel() {
    let client;
    try {
        console.log('Connecting to the database...');
        client = await pool.connect();

        // Check if there's an admin or dummy warden user to assign as the warden
        const userRes = await client.query(`SELECT id FROM users LIMIT 1`);
        let wardenId = null;
        if (userRes.rowCount > 0) {
            wardenId = userRes.rows[0].id;
        }

        // Define your new hostel details here
        const newHostel = {
            block_name: 'Sunrise Student Living',
            type: 'Co-ed', // 'Boys', 'Girls', or 'Co-ed'
            description: 'A premium, modern hostel located just 5 minutes away from the main university campus.',
            total_rooms: 50,
            available_rooms: 15,
            location: 'Downtown Campus Road, Block A',
            rating: 4.8,
            virtual_tour_url: 'https://example.com/virtual-tour',
            images: [
                'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80'
            ],
            facilities: ['WiFi', 'AC', 'Laundry', 'Gym', 'Cafeteria'],
            latitude: 28.6139,  // Update with real coordinates
            longitude: 77.2090, // Update with real coordinates
            warden_user_id: wardenId,
            approval_status: 'Approved' // Ensures it shows up in search immediately
        };

        console.log(`Creating hostel: ${newHostel.block_name}...`);

        const insertQuery = `
            INSERT INTO hostel_blocks (
                block_name, type, description, total_rooms, available_rooms, 
                location, rating, virtual_tour_url, images, facilities, 
                latitude, longitude, warden_user_id, approval_status
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
            ) RETURNING id, block_name;
        `;

        const values = [
            newHostel.block_name, newHostel.type, newHostel.description,
            newHostel.total_rooms, newHostel.available_rooms, newHostel.location,
            newHostel.rating, newHostel.virtual_tour_url, newHostel.images,
            newHostel.facilities, newHostel.latitude, newHostel.longitude,
            newHostel.warden_user_id, newHostel.approval_status
        ];

        const result = await client.query(insertQuery, values);
        console.log('✅ Successfully created hostel!');
        console.log(result.rows[0]);

    } catch (error) {
        console.error('❌ Error creating hostel:', error);
    } finally {
        if (client) {
            client.release();
        }
        // Exit process
        process.exit(0);
    }
}

createHostel();
