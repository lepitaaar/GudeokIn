const Db = require('mssql-async').default;
require('dotenv').config();

export const db = new Db({
    server: process.env.DB_HOST,
    database: process.env.DATABASE_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
})
