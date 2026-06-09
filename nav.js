// Menú de navegación: abre/cierra el desplegable en mobile.
(function(){
  const toggle = document.querySelector(".nav-toggle");
  const nav    = document.querySelector(".site-nav");
  if(!toggle || !nav) return;

  toggle.addEventListener("click", e => {
    e.stopPropagation();
    const abierto = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", abierto ? "true" : "false");
  });

  // Cerrar al tocar fuera del menú
  document.addEventListener("click", e => {
    if(nav.classList.contains("is-open") &&
       !nav.contains(e.target) &&
       !toggle.contains(e.target)){
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
})();
