// Pantalla de carga. Muestra img/carga.png + "Cargando" + barra de progreso.
// Permanece visible un mínimo de MIN_MS aunque los datos lleguen antes.
(function(){

  const MIN_MS = 2000;
  const inicio = Date.now();

  let loader, fill, finalizado = false, raf = null;

  function tomarRefs(){
    loader = document.getElementById("loader");
    fill   = loader ? loader.querySelector(".loader__fill") : null;
  }

  // Avance "creciente" hasta 90% durante MIN_MS (el 100% se completa al terminar)
  function animar(){
    if(!finalizado && fill){
      const t = (Date.now() - inicio) / MIN_MS;
      const pct = Math.min(90, t * 90);
      fill.style.width = pct + "%";
    }
    raf = requestAnimationFrame(animar);
  }

  function ocultar(){
    finalizado = true;
    const restante = Math.max(0, MIN_MS - (Date.now() - inicio));

    setTimeout(() => {
      if(fill) fill.style.width = "100%";

      setTimeout(() => {
        if(raf) cancelAnimationFrame(raf);
        if(loader){
          loader.classList.add("is-hidden");
          setTimeout(() => loader.remove(), 450);
        }
      }, 300);
    }, restante);
  }

  // API pública: la página llama Loader.done() cuando terminó de cargar datos.
  window.Loader = { done: ocultar };

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", () => { tomarRefs(); animar(); });
  }else{
    tomarRefs(); animar();
  }
})();
