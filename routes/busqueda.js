var express = require('express');
var app = express();

var Hospitales = require('../models/hospital');
var Medicos = require('../models/medico');
var Usuarios = require('../models/usuarios');

//================================================
// Busqueda por coleccion
//================================================

app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = BuscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promesa = BuscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = BuscarHospitales(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son usuarios, medicos y hospitales',
                errors: { message: 'Tipo de tabla no valido' }
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });

});

//================================================
// Busqueda general
//================================================

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
        BuscarHospitales(busqueda, regex),
        BuscarMedicos(busqueda, regex),
        BuscarUsuarios(busqueda, regex)
    ]).then(respuestas => {

        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });
});

//================================================
// Funciones que retorna promesas
//================================================

function BuscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospitales.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error cargando hospitales', err)
                } else {
                    resolve(hospitales)
                }
            });

    });
}

function BuscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medicos.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error cargando medicos', err)
                } else {
                    resolve(medicos)
                }
            });

    });
}

function BuscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuarios.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error cargando usuarios', err)
                } else {
                    resolve(usuarios)
                }
            });

    });
}

module.exports = app;