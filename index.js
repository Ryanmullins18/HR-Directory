const express= require('express');
const pg = require('pg')

const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_hr_directory_db')

const server = express();

const init = async ()=> {
    await client.connect();
    console.log('client connected ******')

    let SQL= `
    DROP TABLE IF EXISTS employees;
    DROP TABLE IF EXISTS departments;
    


    CREATE TABLE departments(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255)
    );

    CREATE TABLE employees(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    department_id INTEGER REFERENCES departments(id) 
    NOT NULL
        );
    `;
    await client.query(SQL);
    console.log("table created");

    SQL = `
        INSERT INTO departments(name) VALUES('Logistics');
        INSERT INTO departments(name) VALUES('Sales');
        INSERT INTO departments(name) VALUES('HR');

        INSERT INTO employees(name, department_id) 
        VALUES ('Mark', (SELECT id FROM departments WHERE name ='Logistics'));
        INSERT INTO employees(name, department_id) 
        VALUES ('Bob', (SELECT id FROM departments WHERE name ='Sales'));
        INSERT INTO employees(name, department_id) 
        VALUES ('Wade', (SELECT id FROM departments WHERE name ='HR'));
    `;
    await client.query(SQL);
    console.log("data seeded");

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
};
init();

server.use(express.json())
server.use(require("morgan")("dev"));

server.get('/api/employees', async (req, res, next) => {
    try {
        const SQL = `SELECT * FROM employees`
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

server.get('/api/departments', async (req, res, next) => {
    try {
        const SQL = `SELECT * FROM departments`
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

server.post('/api/employees', async (req, res, next) => {
    try {
        const {name, department_id} = req.body;

        const SQL = `INSERT INTO employees(name, department_id)
        VALUES($1, $2) RETURNING *`;
        const response = await client.query(SQL, [name, department_id]);
        res.status(201).send(response.rows[0]);
    } catch (error) {
        next(error)
    }
});

server.delete('/api/employees/:id', async (req, res, next) => {
try {
    const SQL = `DELETE FROM employees WHERE id=$1`;
       await client.query(SQL, [req.params.id]);
       res.sendStatus(204);
} catch (error) {
    next(error);
}
});

server.put('/api/employees/:id', async (req, res, next) => {
    try {
        const {name, department_id} = req.body;

        const SQL = `UPDATE employees SET name=$1, department_id=$2,
        updated_at=now() WHERE id=$3 RETURNING *;`;
        const response = await client.query(SQL, [
            name, 
            department_id, 
            req.params.id,
        ]);

        res.send(response.rows[0]);
    } catch (error) {
        next(error)
    }
});

server.use((err, req, res)=>{
    res.status(res.status || 500).send({error: err });
});