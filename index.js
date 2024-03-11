const pg = require('pg');
const express = require('express');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/the_acme_ice_cream_shop_db');
const app = express();
const morgan = require('morgan');

app.use(express.json());
app.use(require('morgan')('dev'));


app.post('/api/flavors', async(req, res, next)=> {
    try{
        const SQL = `
        INSERT INTO flavors(txt, ranking)
        VALUES($1, $2)
        RETURNING *
        `;
        const response = await client.query(SQL, [req.body.txt, req.body.ranking]);
        res.send(response.rows[0]);
    }
    catch(error){
        next(error);
    }
});

app.get('/api/flavors', async(req, res, next)=> {
    try{
        const SQL = `
        SELECT *
        from flavors
        ORDER BY created_at DESC 
        `;
        const response = await client.query(SQL);
        res.send(response.rows);
    }
    catch(error){
        next(error);
    }
});


app.put('/api/flavors/:id', async(req, res, next)=> {
    try{
        const SQL = `
        UPDATE flavors
        SET txt=4!, ranking=$2, updated_at=now()
        WHERE id = $3
        RETURNING *
        `;
        const response = await client.query(SQL, [req.body.txt, req.body.ranking, req.params.id]);
        res.send(response.rows[0]);
    }
    catch(error){
        next(error)
    }
});

app.delete('/api/flavors/:id', async(req, res, next)=> {
    try{
        const SQL = `
        DELETE
        from flavors
        WHERE id=$1
        `;
        await client.query(SQL, [req.params.id]);
        res.sendStatus(204);
    }
    catch(error){
        next(error)
    }
});

const init = async () => {
    await client.connect();
    console.log('connected to database');
    let SQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
        id SERIAL PRIMARY key,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        ranking INTEGER DEFAULT 6 NOT NULL ,
        TXT VARCHAR(255) NOT NULL
    ); 
    `;
    await client.query(SQL);
    console.log('tables created');
    SQL = `
    INSERT INTO flavors(txt, ranking) VALUES('Chocolate', 1);
    INSERT INTO flavors(txt, ranking) VALUES('Cherry Vanilla', 2);
    INSERT INTO flavors(txt, ranking) VALUES('Mango', 3);
    INSERT INTO flavors(txt, ranking) VALUES('Mint Chip', 4);
    INSERT INTO flavors(txt, ranking) VALUES('Straciatella', 5);
    INSERT INTO flavors(txt, ranking) VALUES('Coffee', 6);
    `;
    await client.query(SQL);
    console.log('data seeded'); 

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));

};

init();