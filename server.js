const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const app = express();
const SECRET_KEY = 'mi_clave_secreta';
app.use(express.json());


// CONECTAR SQLITE
const db = new sqlite3.Database('./peliculas.db', (err) => {

    if(err){

        console.log(err.message);

    } else {

        console.log('Base de datos conectada');
    }
});


// CREAR TABLA
db.run(`
    CREATE TABLE IF NOT EXISTS peliculas(

        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT,
        genero TEXT,
        anio INTEGER
    )
`);


// INSERTAR DATOS
app.get('/', (req, res) => {

    res.send('API de peliculas funcionando correctamente');

});
db.run(`
    INSERT INTO peliculas(titulo, genero, anio)

    VALUES
    ('Avengers Endgame', 'Accion', 2019),
    ('Interstellar', 'Ciencia Ficcion', 2014),
    ('Batman', 'Accion', 2022)
`);

function verificarToken(req, res, next){

    const bearerHeader = req.headers['authorization'];

    if(typeof bearerHeader !== 'undefined'){

        const bearer = bearerHeader.split(' ');

        const token = bearer[1];

        jwt.verify(token, SECRET_KEY, (err, authData) => {

            if(err){

                res.sendStatus(403);

            } else {

                req.authData = authData;

                next();
            }
        });

    } else {

        res.sendStatus(401);
    }
}
// RUTA GET
app.get('/peliculas', verificarToken, (req, res) => {

    db.all(
        'SELECT * FROM peliculas',

        [],

        (err, rows) => {

            if(err){

                res.status(500).json({
                    error: err.message
                });

            } else {

                res.json(rows);
            }
        }
    );
});


// SERVIDOR

app.post('/login', (req, res) => {

    const { usuario, password } = req.body;

    // Usuario de prueba
  if(usuario === 'blackie' && password === '1234'){

        const token = jwt.sign(

            { usuario },

            SECRET_KEY,

            { expiresIn: '1h' }
        );

        res.json({
            mensaje: 'Login correcto',
            token
        });

    } else {

        res.status(401).json({
            mensaje: 'Usuario o contraseña incorrectos'
        });
    }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Servidor corriendo en puerto ${PORT}`);
});