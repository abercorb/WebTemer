document.addEventListener("DOMContentLoaded", function () {
  const burger = document.getElementById("burger");
  const navMenu = document.getElementById("nav-menu");
  const navOverlay = document.getElementById("nav-overlay");
  const odsBtn = document.getElementById("ods-more-btn");
  const odsExtra = document.getElementById("ods-extra");

  function abrirMenu() {
    navMenu.classList.add("nav-menu--open");
    navOverlay.classList.add("nav-overlay--visible");
    burger.setAttribute("aria-expanded", "true");
  }

  function cerrarMenu() {
    navMenu.classList.remove("nav-menu--open");
    navOverlay.classList.remove("nav-overlay--visible");
    burger.setAttribute("aria-expanded", "false");
  }

  if (burger) {
    burger.addEventListener("click", function () {
      const abierto = navMenu.classList.contains("nav-menu--open");
      if (abierto) {
        cerrarMenu();
      } else {
        abrirMenu();
      }
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener("click", cerrarMenu);
  }

  // Cerrar menú al hacer clic en un enlace
  navMenu.querySelectorAll("a").forEach(function (enlace) {
    enlace.addEventListener("click", cerrarMenu);
  });

  // Mostrar / ocultar texto extra ODS
  if (odsBtn && odsExtra) {
    odsBtn.addEventListener("click", function () {
      const oculto = odsExtra.classList.contains("ods__extra--hidden");
      if (oculto) {
        odsExtra.classList.remove("ods__extra--hidden");
        odsBtn.textContent = "Ocultar información";
      } else {
        odsExtra.classList.add("ods__extra--hidden");
        odsBtn.textContent = "Saber más sobre nuestro impacto";
      }
    });
  }
});