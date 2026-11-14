
let estados = ["Pendiente", "En revisión", "En proceso", "Finalizado", "Cancelado"];
let servicios = ["Mantenimiento Preventivo", "Cambio de Aceite", "Frenos", "Revisión General"];

let colorEstado = {
  "Pendiente": "secondary",
  "En revisión": "info",
  "En proceso": "warning",
  "Finalizado": "success",
  "Cancelado": "danger"
};

let usuariosBase = [
  { nombre: "Adrian Alexander", correo: "admin@mecanica.com", contrasenia: "admin123", rol: "Administrador", habilitado: true },
  { nombre: "María López", correo: "maria@gmail.com", contrasenia: "maria123", rol: "Cliente", habilitado: true },
  { nombre: "Pedro Gomez", correo: "pedro@correo.com", contrasenia: "pedro123", rol: "Cliente", habilitado: false }
];

// leer lo que esta guardado en el navegador
let usuarios = JSON.parse(localStorage.getItem("usuarios"));
if (usuarios == null) {
  usuarios = usuariosBase;
}

let solicitudes = JSON.parse(localStorage.getItem("solicitudes"));
if (solicitudes == null) {
  solicitudes = [];
}

let sesion = JSON.parse(sessionStorage.getItem("sesion"));

guardar();


// FUNCIONES 

// guarda los arrays 
function guardar() {
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  localStorage.setItem("solicitudes", JSON.stringify(solicitudes));
}


function fechaHoy() {
  let hoy = new Date();
  let anio = hoy.getFullYear();
  let mes = hoy.getMonth() + 1;
  let dia = hoy.getDate();

  if (mes < 10) {
    mes = "0" + mes;
  }
  if (dia < 10) {
    dia = "0" + dia;
  }

  return anio + "-" + mes + "-" + dia;
}

// mensaje para que inicie sesion
function pedirLogin() {
  Swal.fire({
    title: "Inicie sesión",
    text: "Debe iniciar sesión",
    icon: "info",
    confirmButtonText: "Ir a Iniciar Sesión",
    allowOutsideClick: false
  }).then(function () {
    window.location.href = "login.html";
  });
}


// MENU 

// si hay sesion el boton dice "Cerrar Sesion"
let botonLogin = document.querySelector(".boton-login");

if (sesion != null) {
  botonLogin.textContent = "Cerrar Sesion";

  botonLogin.addEventListener("click", function (e) {
    e.preventDefault();
    sessionStorage.removeItem("sesion");
    window.location.href = "login.html";
  });
}

// solo el administrador puede entrar a Administracion
let enlaceAdmin = document.querySelector('nav a[href="admin.html"]');

enlaceAdmin.addEventListener("click", function (e) {
  if (sesion == null) {
    e.preventDefault();
    pedirLogin();
  } else if (sesion.rol != "Administrador") {
    e.preventDefault();
    Swal.fire("Acceso denegado", "Solo el administrador puede entrar a Administración", "error");
  }
});

// para ver Mis Mantenimientos hay que iniciar sesion
let enlaceMis = document.querySelector('nav a[href="usuario.html"]');

enlaceMis.addEventListener("click", function (e) {
  if (sesion == null) {
    e.preventDefault();
    pedirLogin();
  }
});


// LOGIN 

let formLogin = document.getElementById("formulario");

if (formLogin != null) {
  formLogin.addEventListener("submit", function (e) {
    e.preventDefault();

    let correo = document.getElementById("correo").value.trim().toLowerCase();
    let clave = document.getElementById("contrasenia").value;

    // buscar el usuario con ese correo y contraseña
    let usuario = usuarios.find(function (u) {
      return u.correo == correo && u.contrasenia == clave;
    });

    if (usuario == undefined) {
      Swal.fire("Error", "Correo o contraseña incorrectos", "error");
    } else if (usuario.habilitado == false) {
      Swal.fire("Cuenta deshabilitada", "Contacte al administrador", "warning");
    } else {
      // guardar la sesion
      sesion = { nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol };
      sessionStorage.setItem("sesion", JSON.stringify(sesion));

      Swal.fire("Bienvenido", usuario.nombre, "success").then(function () {
        if (usuario.rol == "Administrador") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "usuario.html";
        }
      });
    }
  });
}


// FORMULARIO DE SOLICITUD 

let formCita = document.getElementById("formulario-cita");

if (formCita != null) {

  // ver si el que entro es un cliente
  let esCliente = false;
  if (sesion != null && sesion.rol == "Cliente") {
    esCliente = true;
  }

  // no dejar escoger fechas pasadas
  document.getElementById("fecha").min = fechaHoy();

  // si viene de una tarjeta (solicitud.html?servicio=Frenos) se pone ese servicio
  let parametros = new URLSearchParams(window.location.search);
  let servicioElegido = parametros.get("servicio");
  if (servicios.includes(servicioElegido)) {
    document.getElementById("servicio").value = servicioElegido;
  }

  // el cliente solo pide para el mismo, entonces se ponen sus datos
  if (esCliente) {
    document.getElementById("nombre").value = sesion.nombre;
    document.getElementById("correo").value = sesion.correo;
    document.getElementById("nombre").readOnly = true;
    document.getElementById("correo").readOnly = true;
  }

  formCita.addEventListener("submit", function (e) {
    e.preventDefault();

    // leer los campos
    let nombre = document.getElementById("nombre").value.trim();
    let correo = document.getElementById("correo").value.trim().toLowerCase();
    let telefono = document.getElementById("telefono").value.trim();
    let placa = document.getElementById("placa").value.trim().toUpperCase();
    let marca = document.getElementById("marca").value.trim();
    let modelo = document.getElementById("modelo").value.trim();
    let anio = Number(document.getElementById("anio").value);
    let kilometraje = Number(document.getElementById("kilometraje").value);
    let servicio = document.getElementById("servicio").value;
    let fecha = document.getElementById("fecha").value;
    let hora = document.getElementById("hora").value;
    let observaciones = document.getElementById("observaciones").value.trim();
    let atencion = "";
    let radioMarcado = document.querySelector('input[name="atencion"]:checked');
    if (radioMarcado != null) {
      atencion = radioMarcado.value;
    }

    let extras = [];
    let marcados = document.querySelectorAll('input[type="checkbox"]:checked');
    for (let check of marcados) {
      extras.push(check.value);
    }

    // validaciones: cada error se guarda en el array
    let errores = [];
    let anioActual = new Date().getFullYear();

    if (nombre.length < 3) {
      errores.push("Ingrese el nombre completo");
    }
    if (correo.includes("@") == false || correo.includes(".") == false) {
      errores.push("Correo inválido");
    }
    if (telefono.length != 10 || isNaN(telefono)) {
      errores.push("El teléfono debe tener 10 dígitos");
    }
    if (/^[A-Z]{3}-[0-9]{3,4}$/.test(placa) == false) {
      errores.push("Placa inválida (ejemplo: ABC-1234)");
    }
    if (marca == "") {
      errores.push("Ingrese la marca");
    }
    if (modelo == "") {
      errores.push("Ingrese el modelo");
    }
    if (anio < 1980 || anio > anioActual + 1) {
      errores.push("Año inválido");
    }
    if (isNaN(kilometraje) || kilometraje < 0) {
      errores.push("Kilometraje inválido");
    }
    if (servicios.includes(servicio) == false) {
      errores.push("Seleccione un servicio");
    }
    if (fecha == "" || fecha < fechaHoy()) {
      errores.push("La fecha no puede ser anterior a hoy");
    }
    if (hora == "" || hora < "08:00" || hora > "17:00") {
      errores.push("La hora debe estar entre 08:00 y 17:00");
    }
    if (atencion == "") {
      errores.push("Seleccione el tipo de atención");
    }

    // si hay errores no se guarda
    if (errores.length > 0) {
      Swal.fire("No se guardó la solicitud", errores.join("<br>"), "error");
      return;
    }

    // buscar el numero mas grande para el nuevo id 
    let mayor = 100;
    for (let i = 0; i < solicitudes.length; i++) {
      let numero = Number(solicitudes[i].id.replace("MANT-", ""));
      if (numero > mayor) {
        mayor = numero;
      }
    }

    // si es cliente se usa el correo de su sesion
    if (esCliente) {
      correo = sesion.correo;
    }

    // crear el objeto de la solicitud
    let nueva = {
      id: "MANT-" + (mayor + 1),
      cliente: nombre,
      correo: correo,
      telefono: telefono,
      placa: placa,
      marca: marca,
      modelo: modelo,
      anio: anio,
      kilometraje: kilometraje,
      servicio: servicio,
      atencion: atencion,
      extras: extras,
      fecha: fecha,
      hora: hora,
      observaciones: observaciones,
      estado: "Pendiente"
    };

    solicitudes.push(nueva);
    guardar();
    formCita.reset();

    Swal.fire("Listo", "Solicitud " + nueva.id + " registrada. El administrador la revisará pronto.", "success").then(function () {
      if (esCliente) {
        window.location.href = "usuario.html";
      }
    });
  });
}


// ADMINISTRACION 

let tablaSolicitudes = document.getElementById("tabla-solicitudes");
let tablaUsuarios = document.getElementById("tabla-usuarios");

if (tablaSolicitudes != null) {
  if (sesion == null) {
    pedirLogin();
  } else if (sesion.rol != "Administrador") {
    Swal.fire({
      title: "Acceso denegado",
      text: "Solo el administrador puede ver este contenido",
      icon: "error",
      allowOutsideClick: false
    }).then(function () {
      window.location.href = "index.html";
    });
  } else {
    // es el administrador: se muestra el panel
    document.querySelector(".panel").style.display = "block";
    mostrarSolicitudes(solicitudes);
    mostrarUsuarios();

    // buscador por placa o cliente
    document.getElementById("buscador").addEventListener("input", function () {
      let texto = this.value.toLowerCase();

      let encontradas = solicitudes.filter(function (s) {
        return s.placa.toLowerCase().includes(texto) || s.cliente.toLowerCase().includes(texto);
      });

      mostrarSolicitudes(encontradas);
    });
  }
}

// dibuja la tabla de solicitudes
function mostrarSolicitudes(lista) {
  tablaSolicitudes.innerHTML = "";

  lista.forEach(function (s) {
    let opciones = estados.map(function (estado) {
      if (estado == s.estado) {
        return "<option selected>" + estado + "</option>";
      } else {
        return "<option>" + estado + "</option>";
      }
    });

    tablaSolicitudes.innerHTML += `
      <tr>
        <td><b>${s.id}</b></td>
        <td>${s.cliente}</td>
        <td>${s.placa}</td>
        <td>${s.servicio}</td>
        <td>${s.fecha} ${s.hora}</td>
        <td>
          <select class="form-select form-select-sm" onchange="cambiarEstado('${s.id}', this.value)">
            ${opciones.join("")}
          </select>
        </td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editarSolicitud('${s.id}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarSolicitud('${s.id}')">Eliminar</button>
        </td>
      </tr>
    `;
  });
}

// cambia el estado cuando se elige otro en el select
function cambiarEstado(id, nuevoEstado) {
  let s = solicitudes.find(function (x) {
    return x.id == id;
  });

  s.estado = nuevoEstado;
  guardar();
  Swal.fire("Estado actualizado", id + " ahora está " + nuevoEstado, "success");
}


function editarSolicitud(id) {
  let s = solicitudes.find(function (x) {
    return x.id == id;
  });


  let opciones = "";
  for (let i = 0; i < servicios.length; i++) {
    if (servicios[i] == s.servicio) {
      opciones += "<option selected>" + servicios[i] + "</option>";
    } else {
      opciones += "<option>" + servicios[i] + "</option>";
    }
  }

  Swal.fire({
    title: "Editar " + id,
    html: `
      <label>Servicio</label>
      <select class="form-select" id="edit-servicio">${opciones}</select>
      <label>Fecha</label>
      <input class="form-control" type="date" id="edit-fecha" value="${s.fecha}">
      <label>Hora</label>
      <input class="form-control" type="time" id="edit-hora" value="${s.hora}">
    `,
    showCancelButton: true,
    confirmButtonText: "Guardar",
    cancelButtonText: "Cancelar",
    
    preConfirm: function () {
      let hora = document.getElementById("edit-hora").value;
      let fecha = document.getElementById("edit-fecha").value;

      if (fecha == "" || hora < "08:00" || hora > "17:00") {
        Swal.showValidationMessage("Revise la fecha y la hora (08:00 a 17:00)");
        return false;
      }

      s.servicio = document.getElementById("edit-servicio").value;
      s.fecha = fecha;
      s.hora = hora;
    }
  }).then(function (resultado) {
    if (resultado.isConfirmed) {
      guardar();
      mostrarSolicitudes(solicitudes);
      Swal.fire("Guardado", id + " fue actualizada", "success");
    }
  });
}

// eliminar con confirmacion
function eliminarSolicitud(id) {
  Swal.fire({
    title: "¿Eliminar " + id + "?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  }).then(function (resultado) {
    if (resultado.isConfirmed) {
      // filter deja todas menos la que se elimina
      solicitudes = solicitudes.filter(function (x) {
        return x.id != id;
      });
      guardar();
      mostrarSolicitudes(solicitudes);
      Swal.fire("Eliminado", "", "success");
    }
  });
}

// dibuja la tabla de usuarios
function mostrarUsuarios() {
  tablaUsuarios.innerHTML = "";

  usuarios.forEach(function (u) {
    let claseRol = "cliente";
    if (u.rol == "Administrador") {
      claseRol = "admin";
    }

    let claseEstado = "rojo";
    let textoEstado = "Deshabilitado";
    let textoBoton = "Habilitar";
    if (u.habilitado) {
      claseEstado = "verde";
      textoEstado = "Habilitado";
      textoBoton = "Deshabilitar";
    }

    let accion = "";
    if (u.rol == "Administrador") {
      accion = "Sesión activa";
    } else {
      accion = `<button class="btn btn-sm btn-secondary" onclick="cambiarUsuario('${u.correo}')">${textoBoton}</button>`;
    }

    tablaUsuarios.innerHTML += `
      <tr>
        <td><b>${u.nombre}</b></td>
        <td>${u.correo}</td>
        <td><span class="badge etiqueta ${claseRol}">${u.rol}</span></td>
        <td><span class="badge etiqueta ${claseEstado}">${textoEstado}</span></td>
        <td>${accion}</td>
      </tr>
    `;
  });
}

// habilitar o deshabilitar un usuario
function cambiarUsuario(correo) {
  let u = usuarios.find(function (x) {
    return x.correo == correo;
  });

  if (u.habilitado) {
    u.habilitado = false;
  } else {
    u.habilitado = true;
  }

  guardar();
  mostrarUsuarios();
}


// PERFIL 

let tablaMias = document.getElementById("tabla-mis-solicitudes");

if (tablaMias != null) {
  if (sesion == null) {
    pedirLogin();
  } else {
    let mias = solicitudes.filter(function (s) {
      return s.correo == sesion.correo;
    });

    // datos del perfil
    document.getElementById("perfil-nombre").textContent = sesion.nombre;
    document.getElementById("perfil-correo").textContent = sesion.correo;
    document.getElementById("perfil-rol").textContent = sesion.rol;
    document.getElementById("perfil-total").textContent = mias.length;

    if (mias.length == 0) {
      tablaMias.innerHTML = "<tr><td colspan='5'>Todavía no tiene solicitudes registradas.</td></tr>";
    }

    mias.forEach(function (s) {
      tablaMias.innerHTML += `
        <tr>
          <td><b>${s.id}</b></td>
          <td>${s.placa} - ${s.marca} ${s.modelo}</td>
          <td>${s.servicio}</td>
          <td>${s.fecha} ${s.hora}</td>
          <td><span class="badge text-bg-${colorEstado[s.estado]}">${s.estado}</span></td>
        </tr>
      `;
    });
  }
}
