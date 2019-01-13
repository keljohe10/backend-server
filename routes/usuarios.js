var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewears/autenticacion')

var Usuarios = require('../models/usuarios');

// ================================
// Obtener todos los usuarios
// ================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuarios.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                Usuarios.count({}, (err, count) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error contando usuarios',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        conteo: count
                    });

                });
            });
});



// ================================
// Actualizar un usuario
// ================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuarios.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error actualizando usuario',
                    errors: err
                });
            }

            usuario.password = 'xx';

            res.status(200).json({
                ok: true,
                usuarios: usuarioGuardado,
                usuarioToken: req.usuario
            });
        });

    });

});

// ================================
// Crear un usuarios
// ================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var usuario = new Usuarios({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuarios: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });


});

// ================================
// Borrar un usuario
// ================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuarios.findByIdAndDelete(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            usuarios: usuarioBorrado,
            usuarioToken: req.usuario
        });
    });

});

module.exports = app;