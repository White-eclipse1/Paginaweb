let lastScroll = 0;
const header = document.querySelector(".header");
const threshold = 10; // Cantidad de pixeles de tolerancia

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;

  // Si el scroll es menor a 0 (rebote en iOS) no hace nada
  if (currentScroll <= 0) {
    header.style.transform = "translateY(0)";
    return;
  }

  // Si el movimiento es muy pequeño, lo ignoramos para mayor suavidad
  if (Math.abs(currentScroll - lastScroll) < threshold) return;

  if (currentScroll > lastScroll && currentScroll > 150) {
    // Bajando: Escondemos el header
    header.style.transform = "translateY(-100%)";
  } else {
    // Subiendo: Mostramos el header
    header.style.transform = "translateY(0)";
  }

  lastScroll = currentScroll;
}, { passive: true }); // Mejora el rendimiento del scroll