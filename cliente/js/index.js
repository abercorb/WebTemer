document.addEventListener("DOMContentLoaded", function () {
  const botonMenu = document.getElementById("menu");
  const menuNavegacion = document.getElementById("nav_menu");
  const capaFondoMenu = document.getElementById("nav_overlay");
  const botonMostrarOds = document.getElementById("btn_ods_extra");
  const contenedorTextoOds = document.getElementById("ods_extra");

  inicializarInterfaz();

  function inicializarInterfaz() {
    if (botonMenu) {
      botonMenu.addEventListener("click", alternarEstadoMenu);
    }

    if (capaFondoMenu) {
      capaFondoMenu.addEventListener("click", cerrarMenuNavegacion);
    }

    menuNavegacion.querySelectorAll("a").forEach(function (enlace) {
      enlace.addEventListener("click", cerrarMenuNavegacion);
    });

    if (botonMostrarOds && contenedorTextoOds) {
      botonMostrarOds.addEventListener("click", alternarInformacionOds);
    }
  }

  function alternarEstadoMenu() {
    const estaAbierto = menuNavegacion.classList.contains("nav_menu--open");
    if (estaAbierto) {
      cerrarMenuNavegacion();
    } else {
      abrirMenuNavegacion();
    }
  }

  function abrirMenuNavegacion() {
    menuNavegacion.classList.add("nav_menu--open");
    capaFondoMenu.classList.add("nav_overlay--visible");
    botonMenu.setAttribute("aria-expanded", "true");
  }

  function cerrarMenuNavegacion() {
    menuNavegacion.classList.remove("nav_menu--open");
    capaFondoMenu.classList.remove("nav_overlay--visible");
    botonMenu.setAttribute("aria-expanded", "false");
  }

  function alternarInformacionOds() {
    const estaOculto = contenedorTextoOds.classList.contains("ods_extra_escondido");
    if (estaOculto) {
      contenedorTextoOds.classList.remove("ods_extra_escondido");
      botonMostrarOds.textContent = "Ocultar información";
    } else {
      contenedorTextoOds.classList.add("ods_extra_escondido");
      botonMostrarOds.textContent = "Saber más sobre nuestro impacto";
    }
  }
});