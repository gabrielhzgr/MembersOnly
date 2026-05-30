#! /usr/bin/env node

const {Client} = require('pg')

const SQL = `
CREATE TABLE IF NOT EXISTS Users(
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    membership_status BOOLEAN NOT NULL,
    is_admin BOOLEAN NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Messages(
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    message text NOT NULL,
    user_id INTEGER references users(id)
);
`

async function main(){
    console.log('seeding...');
    const client = new Client({
        connectionString: process.argv[2]
    })

    await client.connect()
    await client.query(SQL)
    await client.end()
    console.log('done');
}

main()