// Modo claro / oscuro. Se aplica lo antes posible (en <head>) para evitar
// el "flash" de tema incorrecto. Recuerda la preferencia en localStorage y,
// la primera vez, respeta el prefers-color-scheme del sistema.
(function(){

  const KEY = "prode-theme";

  function preferido(){
    const guardado = localStorage.getItem(KEY);
    if(guardado === "dark" || guardado === "light") return guardado;
    return (window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? "dark" : "light";
  }

  function aplicar(tema){
    document.documentElement.setAttribute("data-theme", tema);
  }

  // Aplicar de inmediato (antes de pintar el body)
  aplicar(preferido());

  function configurarBoton(){
    const btn = document.querySelector(".theme-toggle");
    if(!btn) return;

    function refrescar(){
      const oscuro = document.documentElement.getAttribute("data-theme") === "dark";
      btn.textContent = oscuro ? "☀️" : "🌙";
      btn.setAttribute("aria-label", oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
      btn.setAttribute("title", oscuro ? "Modo claro" : "Modo oscuro");
    }

    refrescar();

    btn.addEventListener("click", () => {
      const oscuro = document.documentElement.getAttribute("data-theme") === "dark";
      const siguiente = oscuro ? "light" : "dark";
      localStorage.setItem(KEY, siguiente);
      aplicar(siguiente);
      refrescar();
    });
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", configurarBoton);
  }else{
    configurarBoton();
  }
})();
