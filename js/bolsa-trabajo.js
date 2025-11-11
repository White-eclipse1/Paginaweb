(async function(){
  const res = await fetch("/content/vacantes/vacantes.json?"+Date.now());
  const data = res.ok ? await res.json() : { items: [] };
  let items = (data.items||[]).filter(v=>v.activo!==false);

  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");

  function card(v){
    const img = v.imagen ? `<img src="${v.imagen}" class="card-img-top" alt="">` : "";
    return `<div class="col-md-6 col-lg-4">
      <article class="card h-100">
        ${img}
        <div class="card-body d-flex flex-column">
          <h3 class="h6 m-0">${v.titulo}</h3>
          <div class="text-muted small mb-2">${v.empresa||""} • ${v.ubicacion||""}</div>
          <div class="mb-2"><span class="badge text-bg-light">${v.tipo||""}</span></div>
          <div class="mt-auto d-flex justify-content-between align-items-center">
            <div class="fw-semibold">${v.salario||""}</div>
            <a class="btn btn-outline-primary btn-sm" href="vacante.html?slug=${encodeURIComponent(v.slug)}">Ver detalle</a>
          </div>
        </div>
      </article>
    </div>`;
  }

  function render(list){
    grid.innerHTML = list.map(card).join("");
    empty.classList.toggle("d-none", list.length>0);
  }

  function applyFilters(){
    const q = document.getElementById("q").value.toLowerCase();
    const tipo = document.getElementById("fTipo").value;
    let r = items.filter(v => [v.titulo,v.empresa,v.ubicacion,v.tipo].join(" ").toLowerCase().includes(q));
    if(tipo) r = r.filter(v=>v.tipo===tipo);
    render(r);
  }

  document.getElementById("q").addEventListener("input", applyFilters);
  document.getElementById("fTipo").addEventListener("change", applyFilters);

  render(items);
})();
