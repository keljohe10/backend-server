var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var Usuarios = require('../models/usuarios');


app.post('/', (req, res) => {

    var body = req.body;
    Usuarios.findOne({ email: body.email }, (err, UsuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!UsuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: { message: 'Credenciales incorrectas' }
            });
        }

        if (!bcrypt.compareSync(body.password, UsuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: { message: 'Credenciales incorrectas' }
            });
        }

        // Crear un token!!

        var token = jwt.sign({ usuario: UsuarioDB }, SEED, { expiresIn: 14400 });

        UsuarioDB.password = 'xx';
        res.status(200).json({
            ok: true,
            id: UsuarioDB._id,
            usuario: UsuarioDB,
            token: token
        });
    });
});


module.exports = app;