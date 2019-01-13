var express = require('express');
var app = express();

var mdAutenticacion = require('../middlewears/autenticacion')

var Medicos = require('../models/medico');

// ================================
// Obtener todos los medicos
// ================================

app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medicos.find({}, 'nombre hospital usuario')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }

            Medicos.count({}, (err, count) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error contando medicos',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: count
                });

            });
        });


});

// ================================
// Actualizar un medico
// ================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var id = req.params.id;

    Medicos.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe el medico con id ' + id,
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error actualizando medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado,
                medicoToken: req.usuario
            });
        });
    });

});

// ================================
// Crear medico
// ================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medicos({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando un medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});

// ================================
// Borrar medico
// ================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medicos.findByIdAndDelete(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
            medicoToken: req.usuario
        });
    });
});

module.exports = app;