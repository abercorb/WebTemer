document.addEventListener("DOMContentLoaded", function () {
  const menuBtn = document.getElementById("menu");
  const navMenu = document.getElementById("nav_menu");
  const navOverlay = document.getElementById("nav_overlay");
  const odsBtn = document.getElementById("btn_ods_extra");
  const odsExtra = document.getElementById("ods_extra");

  function abrirMenu() {
    navMenu.classList.add("nav_menu--open");
    navOverlay.classList.add("nav_overlay--visible");
    menuBtn.setAttribute("aria-expanded", "true");
  }

  function cerrarMenu() {
    navMenu.classList.remove("nav_menu--open");
    navOverlay.classList.remove("nav_overlay--visible");
    menuBtn.setAttribute("aria-expanded", "false");
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      const abierto = navMenu.classList.contains("nav_menu--open");
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
      const oculto = odsExtra.classList.contains("ods_extra_escondido");
      if (oculto) {
        odsExtra.classList.remove("ods_extra_escondido");
        odsBtn.textContent = "Ocultar información";
      } else {
        odsExtra.classList.add("ods_extra_escondido");
        odsBtn.textContent = "Saber más sobre nuestro impacto";
      }
    });
  }
});