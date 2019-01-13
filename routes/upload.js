var express = require('express');
var fileUpload = require('express-fileupload');
var app = express();

var Usuario = require('../models/usuarios');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// File systems
const fs = require('fs');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    var Colecciones = ['usuarios', 'hospitales', 'medicos'];

    // Valida colecciones
    if (Colecciones.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Coleccion no valida',
            errors: { message: 'Coleccion no valida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono una imagen',
            errors: { message: 'No selecciono una imagen' }
        });
    }

    // Obtener nombre del archivo y extension
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Extensiones validas
    var extensionValida = ['jpg', 'png', 'gif', 'jpeg'];

    // Validar extensiones
    if (extensionValida.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'las extensiones validas son: ' + extensionValida.join(', ') }
        });

    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${ new Date().getMilliseconds() }.${extensionArchivo}`;

    // Mover el archivo del temporal al path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    });


});


function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {
            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'No existe el usuario',
                    errors: { message: 'No existe el usuario' }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) throw err;
                });
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Archivo cargado!',
                    usuario: usuarioActualizado
                });
            });

        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'No existe el hospital',
                    errors: { message: 'No existe el hospital' }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) throw err;
                });
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Archivo cargado!',
                    hospital: hospitalActualizado
                });
            });

        });

    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'No existe el medico',
                    errors: { message: 'No existe el medico' }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) throw err;
                });
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Archivo cargado!',
                    medico: medicoActualizado
                });
            });

        });

    }
}

module.exports = app;