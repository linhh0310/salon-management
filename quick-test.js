const mysql = require('mysql2/promise');

async function quickTest() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '11223344',
            database: 'salon_db'
        });

        console.log('✅ Connected to database');

        const [admins] = await connection.execute('SELECT id, username, role FROM users WHERE role = "admin"');
        console.log('Admins:', admins);

        const [customers] = await connection.execute('SELECT id, username, role FROM users WHERE role = "customer" LIMIT 3');
        console.log('Customers:', customers);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

quickTest();

