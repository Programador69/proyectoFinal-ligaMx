// importando librerias
import express from "express";
import path, { parse } from "node:path";
import { fileURLToPath } from "node:url";
import jwt from "jsonwebtoken";
import { ingresarDatos, obtenerDatos, actualizarDatos, eliminarDato, iniciarSesion } from "./base_datos.js";
import cookieParser from "cookie-parser";
import "ejs"
import { tabla, resultados } from "./ligaMX.js";
// --------------------------------------------

// usando opciones de express para poder correrlo y ademas poder leer peticiones y archivos locales
const app = express()
const puerto = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
// -------------------------------------------------------

// aplicando ajustes para poder usar ejs
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "ejs"))

// generando 2 funciones, una para la creacion de un token de acceso y otra para poder validar ese token creado
const generarTokenAcceso = (datosUsuario) => {
    return jwt.sign(datosUsuario, process.env.SECRET, {expiresIn: "8m"})
}

const validarToken = (req, res, next) => {
    // const tokenAcceso = req.headers["autorizado"] || req.query.tokenAcceso;
    const tokenAcceso = req.cookies.usuario
    if (tokenAcceso == undefined) {
        res.render("acceso", {
            titulo: "Error :(",
            encabezado: "Ocurrio un error en su solicitud",
            mensaje: "No eres un usuario autenticado",
            resumen: "negado"
        })
        return
    } 

    jwt.verify(tokenAcceso, process.env.SECRET, (e) => {
        if (e) {
            res.render("acceso", {
                titulo: "Error :(",
                encabezado: "Ocurrio un error en su solicitud",
                mensaje: "Tu token no es de un usuario valido",
                resumen: "negado"
            })
        } 
        else {
            next();
        }
    })
}
// ----------------------------------------------------------------------

// poniendo un midelware por defecto en todas las peticiones
app.use(cookieParser())
// -----------------------------------------------------------

// empezando a recibir solicitudes y manejarlas segun sea necesario
app.get("/", (req, res) => {
    res.sendFile("index.html")
})
// -----------------------------------------

// creando las rutas para este archivo
app.get("/inicio", validarToken, (req, res) => {
    res.render("inicio")
})

// ----------------------------------------------

app.get("/iniciarSesion", (req,res) => {
    try {
        let nombre = req.query.inputNombre
        let contraseña = req.query.inputContraseña
        iniciarSesion(nombre, contraseña, res, generarTokenAcceso);

    }catch (e) {
        res.render("acceso", {
            titulo: "Error :(",
            encabezado: "Ocurrio un error en su solicitud",
            mensaje: "EL servidor esta fallando, por favor intente mas tarde",
            resumen: "negado"
        })
    }
})
// ---------------------------------------------------------
app.get("/cerrarSesion", validarToken, (req, res) => {
    res.clearCookie("usuario")
    res.redirect("/")
})
// ---------------------------------------------------

app.post("/registrarUsuario", (req, res) => {
    try {
        let nombre = req.body.inputNombreRegistro
        let edad = req.body.inputFecha
        let correo = req.body.inputCorreo
        let contraseña = req.body.inputContraseñaRegistro
    
        ingresarDatos(nombre, edad, correo, contraseña, res)

        res.render("acceso", {
            titulo: "Operacion exitosa",
            encabezado: "Accion realizada correctamente",
            mensaje: "Usuario registrado correctamente",
            resumen: "aprobado"
        })

    }catch (e) {
        res.render("acceso", {
            titulo: "Error :(",
            encabezado: "Ocurrio un error en su solicitud",
            mensaje: "Error al registrar el usuario",
            resumen: "negado"
        })
    }

})
// --------------------------------------------------

app.get("/datos", validarToken, (req, res) => {
    try {
        obtenerDatos(res)
    }catch (e) {
        res.render("acceso", {
            titulo: "Error :(",
            encabezado: "Ocurrio un error en su solicitud",
            mensaje: "No se pudo mostrar la informacion, verifica que seas un usuario autenticado",
            resumen: "negado"
        })
    }
})
// -----------------------------------------------------------

app.post("/actualizar", validarToken, (req,res) => {
    try {
        let nombre = req.body.inputNuevoNombre
        let fecha = req.body.inputNuevaFecha
        let correo = req.body.inputNuevoCorreo
        let contraseña = req.body.inputNuevaContraseña
        let confirmarContraseña = req.body.inputNuevaContraseñaActualizada
        let id = req.body.inputIdActualizar

        if (contraseña == confirmarContraseña) {
            actualizarDatos(nombre, fecha, correo, contraseña, id, res)

        }else {
            alert("Las contraseñas no coinciden!")
        }
    
    }catch (e) {
        res.render("acceso", {
            titulo: "Error :(",
            encabezado: "Ocurrio un error en su solicitud",
            mensaje: "Error al actualziar el usuario, por favor verifica que aun tienes autorizacion y si el ID que ingresaste es correcto",
            resumen: "negado"
        })
    }
})
// -----------------------------------------------------------

app.post("/eliminar", validarToken, (req,res) => {
    try {
        let id = req.body.inputEliminar

        if (isNaN(id)) throw new Error("Solo numeros")

        eliminarDato(id, res)

    }catch (e) {
        res.render("acceso", {
            titulo: "Error :(",
            encabezado: "Ocurrio un error en su solicitud",
            mensaje: "Ocurrio un error en la base de datos",
            resumen: "negado"
        })
    }
})
// ---------------------------------------------------------------------------

// redirigiendo a la tabla general y mostrando los datos
app.get("/tabla-general", validarToken, (req, res) => {
    try {
        tabla(res)
    }catch (e) {
        res.render("acceso", {
            titulo: "Error :(",
            encabezado: "Ocurrio un error en su solicitud",
            mensaje: "Ocurrio un error en la extraccion de informacion",
            resumen: "negado"
        })
    }
})
// ---------------------------------------------------------

// redigiriendo a los ultimos resultados y mostrando los datos
app.get("/ultimos-resultados", validarToken, (req, res) => {
    try {
        resultados(res)
    }catch (e) {
        res.render("acceso", {
            titulo: "Error :(",
            encabezado: "Ocurrio un error en su solicitud",
            mensaje: "Ocurrio un error en la extraccion de informacion",
            resumen: "negado"
        })
    }
})
// -----------------------------------------------------------

// mostrando en consola que logramos levantar la coneccion en dicho puerto
app.listen(puerto, "0.0.0.0", ()=> {
    console.log(`Escuchando en: http://localhost:${puerto}`)
})
