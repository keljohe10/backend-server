var express = require('express');
var app = express();

var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewears/autenticacion')

var Hospitales = require('../models/hospital');


// ================================
// Obtener todos los hospitales
// ================================

app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospitales.find({}, 'nombre usuario')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                });
            }

            Hospitales.count({}, (err, count) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error contando hospitales',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: count
                });
            });
        });
});

// ================================
// Actualizar un hospital
// ================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospitales.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe el hospital con id ' + id,
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error actualizando hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado,
                hospitalToken: req.usuario
            });
        });
    });
});

// ================================
// Crear hospitales
// ================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospitales({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

// ================================
// Borrar hospitales
// ================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospitales.findByIdAndDelete(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese ID',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado,
            hospitalToken: req.usuario
        });
    });
});

module.exports = app;