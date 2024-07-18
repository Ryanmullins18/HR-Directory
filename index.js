const express= require('express');
const pg = require('pg')

const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_hr_directory_db')

const init = async ()=> {
    await client.connect();
    console.log('client connected ******')

    let SQL= `
    DROP TABLE IF EXISTS department;
    DROP TABLE IF EXISTS employee;


    CREATE TABLE department(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255)
    );

    CREATE TABLE employee(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    department_id INTEGER REFERENCES department(id) 
    NOT NULL
        );
    `;
    await client.query(SQL);
    console.log("table created");

    // SQL = `
    //     INSERT INTO department(name) VALUES('Logistics');
    //     INSERT INTO department(name) VALUES('Sales');
    //     INSERT INTO department(name) VALUES('HR');

    //     INSERT INTO employee(name, department_id) 
    //     VALUES ('Mark', (SELECT id FROM department WHERE name ='Logistics'));
    //     INSERT INTO employee(name, department_id) 
    //     VALUES ('Bob', (SELECT id FROM department WHERE name ='Sales'));
    //     INSERT INTO employee(name, department_id) 
    //     VALUES ('Wade', (SELECT id FROM department WHERE name ='HR'));
    // `;
    // await client.query(SQL);
    // console.log("table created");
};
init();