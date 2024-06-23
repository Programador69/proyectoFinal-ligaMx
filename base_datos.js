import mongoose from "mongoose";

(async () => {
  await mongoose
    .connect(process.env.MONGO_PRIVATE_URL, {})
    .then((db) => console.log("Conectado a la BD"))
    .catch((e) => console.log(e));
})();

const schemaUsuario = mongoose.Schema({
  nombre: String,
  fecha: String,
  correo: String,
  contraseña: String,
});

const modeloUsuario = mongoose.model("Usuario", schemaUsuario);

const iniciarSesion = async (nombre, contraseña, res, generarTokenAcceso) => {
  const usr = await modeloUsuario.findOne({ nombre, contraseña });

  if (usr != null) {
    const infoUsuario = { nombre };
    const tokenAcceso = generarTokenAcceso(infoUsuario);

    const opciones = {
      maxAge: 50000,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    };

    res.cookie("usuario", tokenAcceso, opciones);
    res.redirect(`/inicio`);
    
  } else {
    res.render("acceso", {
        titulo: "Error :(",
        encabezado: "Ocurrio un error en su solicitud",
        mensaje: "Usuario y/o contraseña incorrectos",
        resumen: "negado"
    })
  }
};

// ingresar datos C
const ingresarDatos = async (nombre, fecha, correo, contraseña, res) => {
  const nuevoUsr = new modeloUsuario({nombre, fecha, correo, contraseña});
  const id = nuevoUsr._id;
  await nuevoUsr.save();
//   await modeloUsuario.save();

  res.render("acceso", {
    titulo: "Operacion exitosa",
    encabezado: "Accion realizada correctamente",
    mensaje: `Usuario registrado correctamente, tu ID es: ${id}`,
    resumen: "aprobado",
  });
};

// leer datos           R
const obtenerDatos = async (res) => {
  const data = await modeloUsuario.find();
  // console.log(data)
  res.render("datos", { data });
};

// actualizar datos     U
const actualizarDatos = async (nombre, fecha, correo, contraseña, id, res) => {
  await modeloUsuario.findByIdAndUpdate(id, {
    nombre,
    fecha,
    correo,
    contraseña,
  });

  res.render("acceso", {
    titulo: "Operacion exitosa",
    encabezado: "Accion realizada correctamente",
    mensaje: "Usuario actualizado correctamente",
    resumen: "aprobado",
  });
};

// eliminar un dato     D
const eliminarDato = async (id, res) => {
  await modeloUsuario.findByIdAndDelete(id);

  res.render("acceso", {
    titulo: "Operacion exitosa",
    encabezado: "Accion realizada correctamente",
    mensaje: `Usuario ${id} eliminado correctamente`,
    resumen: "aprobado",
  });
};

export {ingresarDatos, obtenerDatos, actualizarDatos, eliminarDato, iniciarSesion}

// ---------------------------------------------------------------------------------------------------------------
// SQLITE3:

// import sqlite3 from "sqlite3";
// import "ejs";

// // video de donde nos guiamos: https://www.youtube.com/watch?v=ZRYn6tgnEgM

// // funcion anonima para crear de inicio la base de datos
// (() => {
//     const bd = new sqlite3.Database("./app_futbol.db", sqlite3.OPEN_READWRITE, (e) => {
//         if (e) return console.error(e.message)
//     })

//     // crear la tabla       C
//     let solicitud = `CREATE TABLE IF NOT EXISTS usuarios(
//         id INTEGER,
//         nombre TEXT,
//         edad INTEGER,
//         correo TEXT,
//         contraseña TEXT,
//         PRIMARY KEY (id AUTOINCREMENT)
//     )`
//     bd.run(solicitud,[], (e) => {
//         if (e) return console.error(e.message)
//     })

//     bd.close()
// })();

// // Inicio de sesion
// const iniciarSesion = (nombre, contraseña, res, generarTokenAcceso) => {
//     // concectar con la bd
//     const bd = new sqlite3.Database("./app_futbol.db", sqlite3.OPEN_READWRITE, (e) => {
//         if (e) return console.error(e.message)
//     })

//     const infoUsuario = [nombre, contraseña]

//     const solicitud = 'SELECT * FROM usuarios WHERE nombre = ? AND contraseña = ?'

//     bd.all(solicitud, infoUsuario, (e, fila) => {
//         if (e) {
//             res.render("acceso", {
//                 titulo: "Error :(",
//                 encabezado: "Ocurrio un error en su solicitud",
//                 mensaje: "Ocurrio un error interno en la base de datos",
//                 resumen: "negado"
//             })

//         }else {
//             // if (fila.length <= 0) res.redirect("/error")
//             if (fila.length <= 0) {
//                 res.render("acceso", {
//                     titulo: "Error :(",
//                     encabezado: "Ocurrio un error en su solicitud",
//                     mensaje: "Usuario y/o contraseña incorrectos",
//                     resumen: "negado"
//                 })
//                 return
//             }

//             const infoUsuario = {nombre}
//             const tokenAcceso = generarTokenAcceso(infoUsuario)

//             const opciones = {
//                 maxAge: 50000,
//                 httpOnly: true,
//                 secure: true,
//                 sameSite: "strict"
//             }

//             res.cookie("usuario", tokenAcceso, opciones)
//             res.redirect(`/inicio`)
//         }
//     })

//     bd.close()
// }

// // ingresar datos
// const ingresarDatos = (nombre, fecha, correo, contraseña) => {
//     // concectar con la bd
//     const bd = new sqlite3.Database("./app_futbol.db", sqlite3.OPEN_READWRITE, (e) => {
//         if (e) return console.error(e.message)
//     })

//     // const info_usuario = ["Chavo", 12, "elchavo@vecindad.com","tortaDeJamon"]
//     const infoUsuario = [nombre, fecha, correo, contraseña]

//     const solicitud = `INSERT INTO usuarios (nombre, edad, correo, contraseña)
//     VALUES (?,?,?,?)`

//     bd.run(solicitud, infoUsuario, (e) => {
//         if (e) return console.error(e.message)
//     })

//     bd.close()
// }

// // leer datos           R
// const obtenerDatos = (res) => {
//     // concectar con la bd
//     const bd = new sqlite3.Database("./app_futbol.db", sqlite3.OPEN_READWRITE, (e) => {
//         if (e) return console.error(e.message)
//     })

//     const consulta = 'SELECT * FROM usuarios'
//     bd.all(consulta,[], (e, filas) => {
//         if (e) return console.error(e.message);
//         let data = filas.map(f => {
//             // console.log(`ID: ${f.id},Nombre: ${f.nombre}, Edad: ${f.edad}, Correo: ${f.correo}, Contraseña: ${f.contraseña}`)
//             return {
//                 nombre : `${f.nombre}`,
//                 edad: `${f.edad}`,
//                 correo: `${f.correo}`,
//                 contraseña: `${f.contraseña}`
//             }
//         })

//         // console.log(data)
//         res.render("datos", {data})
//     })

//     bd.close()
// }

// // actualizar datos     U
// const actualizarDatos = (nombre, fecha, correo, contraseña, id) => {
//     // concectar con la bd
//     const bd = new sqlite3.Database("./app_futbol.db", sqlite3.OPEN_READWRITE, (e) => {
//         if (e) return console.error(e.message)
//     })

//     const actualizacion = [nombre, fecha, correo, contraseña, id]

//     const consulta = 'UPDATE usuarios SET nombre = ?, edad = ?, correo = ?, contraseña = ? WHERE id = ?'
//     bd.run(consulta,actualizacion, (e) => {
//         if (e) {
//             res.render("acceso", {
//                 titulo: "Error :(",
//                 encabezado: "Ocurrio un error en su solicitud",
//                 mensaje: "No se pudo actualizar el usuario, verifica que el ID ingresado sea valido y que todavia seas un usuario autenticado",
//                 resumen: "negado"
//             })
//         }
//     })

//     bd.close()
// }

// // eliminar un dato     D
// const eliminarDato = (id, res) => {
//     // concectar con la bd
//     const bd = new sqlite3.Database("./app_futbol.db", sqlite3.OPEN_READWRITE, (e) => {
//         if (e) return console.error(e.message)
//     })

//     const consulta = 'DELETE FROM usuarios WHERE id = ?'
//     bd.run(consulta, id, (e) => {
//         if (e) {
//             res.render("acceso", {
//                 titulo: "Error :(",
//                 encabezado: "Ocurrio un error en su solicitud",
//                 mensaje: "No se pudo eliminar el usuario, verifica que el ID ingresado sea valido y que todavia seas un usuario autenticado",
//                 resumen: "negado"
//             })

//         }else {
//             res.render("acceso", {
//                 titulo: "Operacion exitosa",
//                 encabezado: "Accion realizada correctamente",
//                 mensaje: `Usuario ${id} eliminado correctamente`,
//                 resumen: "aprobado"
//             })
//         }
//     })

//     bd.close()
// }

// // eliminar la tabla
// const eliminarTabla = () => {
//     // concectar con la bd
//     const bd = new sqlite3.Database("./app_futbol.db", sqlite3.OPEN_READWRITE, (e) => {
//         if (e) return console.error(e.message)
//     })

//     const solicitud = 'DROP TABLE usuarios'
//     bd.run(solicitud, (e) => {
//         if (e) return console.error("Ocurrio un error: " + e.message)
//     })

//     bd.close()
// }

// export {ingresarDatos, obtenerDatos, actualizarDatos, eliminarDato, eliminarTabla, iniciarSesion}
