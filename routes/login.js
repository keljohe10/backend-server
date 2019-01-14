var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var Usuarios = require('../models/usuarios');

var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ================================
// Auth google
// ================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}


app.post('/google', async(req, res) => {

    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no valido'
            });
        });

    Usuarios.findOne({ email: googleUser.email }, (err, UsuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (UsuarioDB) {
            if (UsuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticacion normal'
                });
            } else {
                var token = jwt.sign({ usuario: UsuarioDB }, SEED, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    id: UsuarioDB._id,
                    usuario: UsuarioDB,
                    token: token
                });
            }
        } else {
            // El usuario no existe y hay que crearlo

            var usuario = new Usuarios();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = 'xx';

            usuario.save((err, UsuarioDB) => {
                var token = jwt.sign({ usuario: UsuarioDB }, SEED, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    id: UsuarioDB._id,
                    usuario: UsuarioDB,
                    token: token
                });
            });
        }
    });

});


// ================================
// Auth email
// ================================

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