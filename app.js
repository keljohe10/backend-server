// Requires

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables

var app = express();

// Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Importar ruta principal

var appRoutes = require('./routes/app');
var usuariosRoutes = require('./routes/usuarios');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospitales');
var medicosRoutes = require('./routes/medicos');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenRoutes = require('./routes/imagenes');

// Conexion a BD

mongoose.connection.openUri('mongodb://localhost:27017/hospitaldb', (err, res) => {

    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');

});

// Rutas

app.use('/img', imagenRoutes);
app.use('/upload', uploadRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/medico', medicosRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/usuario', usuariosRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);


// Escuchar peticiones

app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
})