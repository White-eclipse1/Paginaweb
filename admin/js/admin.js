const JSON_PATH = "/content/vacantes/vacantes.json";
const IMAGES_DIR = "content/vacantes/imagenes/";
const MD_DIR = "content/vacantes/";

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const msg = (t, ok=true) => { const m=$("#formMsg"); m.textContent=t; m.className = "small mt-3 " + (ok?"text-success":"text-danger"); }

async function me(){
  try{
    const r = await fetch("/.auth/me");
    const j = await r.json();
    const user = j.clientPrincipal;
    if(user){
      $("#userSpan").textContent = user.userDetails || user.userId;
    }
  }catch(e){}
}

function slugify(t){
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}

async function loadIndex(){
  const r = await fetch(JSON_PATH + `?t=${Date.now()}`);
  if(!r.ok){ return { items: [] } }
  return r.json();
}

function renderTable(items){
  const tbody = $("#tablaVacantes tbody");
  tbody.innerHTML = "";
  if(!items.length){ $("#emptyState").classList.remove("d-none"); return; }
  $("#emptyState").classList.add("d-none");
  for(const v of items){
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${v.titulo}</td>
      <td>${v.empresa||""}</td>
      <td>${v.ubicacion||""}</td>
      <td><span class="badge text-bg-light">${v.tipo||""}</span></td>
      <td>${v.activo!==false?'<span class="badge text-bg-success">Activo</span>':'<span class="badge text-bg-secondary">Inactivo</span>'}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary" data-edit="${v.slug}">Editar</button>
      </td>`;
    tbody.appendChild(tr);
  }
}

function pick(form, v={}){
  $("#editSlug").value = v.slug||"";
  $("#titulo").value = v.titulo||"";
  $("#empresa").value = v.empresa||"";
  $("#ubicacion").value = v.ubicacion||"";
  $("#tipo").value = v.tipo||"Tiempo completo";
  $("#salario").value = v.salario||"";
  $("#requisitos").value = (v.requisitos||[]).join("\n");
  $("#beneficios").value = (v.beneficios||[]).join("\n");
  $("#descripcion").value = v.descripcion||"";
  $("#btnDesactivar").classList.toggle("d-none", !v.slug);
  $("#btnEliminar").classList.toggle("d-none", !v.slug);
}

function readForm(){
  return {
    titulo: $("#titulo").value.trim(),
    empresa: $("#empresa").value.trim(),
    ubicacion: $("#ubicacion").value.trim(),
    tipo: $("#tipo").value,
    salario: $("#salario").value.trim(),
    requisitos: $("#requisitos").value.split("\n").map(s=>s.trim()).filter(Boolean),
    beneficios: $("#beneficios").value.split("\n").map(s=>s.trim()).filter(Boolean),
    descripcion: $("#descripcion").value.trim()
  }
}

function toFrontmatter(v){
  const fm = [
    `title: "${v.titulo.replace(/"/g,'\\"')}"`,
    `company: "${(v.empresa||"").replace(/"/g,'\\"')}"`,
    `location: "${(v.ubicacion||"").replace(/"/g,'\\"')}"`,
    `type: "${(v.tipo||"").replace(/"/g,'\\"')}"`,
    `salary: "${(v.salario||"").replace(/"/g,'\\"')}"`,
    `active: ${v.activo!==false}`,
    `date: "${new Date().toISOString()}"`,
    `image: "${v.imagen||""}"`,
    `requirements:\n${(v.requisitos||[]).map(r=>`  - "${r.replace(/"/g,'\\"')}"`).join("\n")||"  -"}\nbenefits:\n${(v.beneficios||[]).map(b=>`  - "${b.replace(/"/g,'\\"')}"`).join("\n")||"  -"}`
  ].join("\n");
  return `---\n${fm}\n---\n\n${v.descripcion}\n`;
}

async function commitFile(path, contentBase64, message){
  const res = await fetch("/api/commit", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ path, contentBase64, message })
  });
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}

async function deleteFile(path, message){
  const res = await fetch("/api/commit", {
    method:"DELETE",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ path, message })
  });
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}

async function uploadImage(file){
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload-image", { method: "POST", body: fd });
  if(!res.ok) throw new Error(await res.text());
  return res.json(); // { path }
}

async function save(e){
  e.preventDefault();
  const data = readForm();
  if(!data.titulo || !data.empresa || !data.ubicacion || !data.descripcion){ msg("Llena los campos obligatorios", false); return; }
  const editing = $("#editSlug").value;
  const slug = editing || slugify(data.titulo);

  // Imagen (opcional)
  const imgFile = $("#imagen").files[0];
  if(imgFile){
    if(imgFile.size > 2*1024*1024) return msg("Imagen > 2 MB", false);
    const up = await uploadImage(imgFile);
    data.imagen = "/" + up.path; // ruta pública en el sitio
  }

  const md = toFrontmatter({ ...data, slug, activo: true });
  const mdPath = `${MD_DIR}${slug}.md`;

  // Actualizar índice
  const idx = await loadIndex();
  const items = idx.items||[];
  const meta = { slug, titulo:data.titulo, empresa:data.empresa, ubicacion:data.ubicacion, tipo:data.tipo, salario:data.salario, imagen:data.imagen||"", activo:true, date:new Date().toISOString() };
  const i = items.findIndex(x=>x.slug===slug);
  if(i>=0) items[i]= { ...items[i], ...meta }; else items.unshift(meta);
  const jsonBase64 = btoa(unescape(encodeURIComponent(JSON.stringify({ items }, null, 2))));
  const mdBase64 = btoa(unescape(encodeURIComponent(md)));

  // Commits
  await commitFile(mdPath, mdBase64, editing?`chore(jobs): update ${slug}`:`feat(jobs): add ${slug}`);
  await commitFile(`${MD_DIR}vacantes.json`, jsonBase64, `chore(jobs): update index`);

  msg(editing?"Vacante actualizada":"Vacante publicada");
  $("#vacanteForm").reset();
  $("#editSlug").value="";
  $("#btnDesactivar").classList.add("d-none");
  $("#btnEliminar").classList.add("d-none");
  await refresh();
}

async function toggleActive(){
  const slug = $("#editSlug").value;
  if(!slug) return;
  const idx = await loadIndex();
  const items = idx.items||[];
  const i = items.findIndex(x=>x.slug===slug);
  if(i<0) return;
  items[i].activo = !items[i].activo;
  const jsonBase64 = btoa(unescape(encodeURIComponent(JSON.stringify({ items }, null, 2))));
  await commitFile(`${MD_DIR}vacantes.json`, jsonBase64, `chore(jobs): toggle ${slug}`);
  msg(items[i].activo?"Activada":"Desactivada");
  await refresh();
}

async function removeVacante(){
  const slug = $("#editSlug").value;
  if(!slug) return;
  if(!confirm("¿Eliminar esta vacante?")) return;

  // Eliminar MD
  await deleteFile(`${MD_DIR}${slug}.md`, `chore(jobs): delete ${slug}`);

  // Quitar del índice
  const idx = await loadIndex();
  const items = (idx.items||[]).filter(x=>x.slug!==slug);
  const jsonBase64 = btoa(unescape(encodeURIComponent(JSON.stringify({ items }, null, 2))));
  await commitFile(`${MD_DIR}vacantes.json`, jsonBase64, `chore(jobs): update index after delete`);
  msg("Eliminada");
  $("#vacanteForm").reset();
  $("#editSlug").value="";
  $("#btnDesactivar").classList.add("d-none");
  $("#btnEliminar").classList.add("d-none");
  await refresh();
}

async function refresh(){
  const {items} = await loadIndex();
  renderTable(items||[]);
}

document.addEventListener("click",(e)=>{
  const edit = e.target.closest("[data-edit]");
  if(edit){
    const slug = edit.getAttribute("data-edit");
    fetch(`${MD_DIR}${slug}.md?${Date.now()}`).then(r=>r.text()).then(t=>{
      const fm = /---([\s\S]*?)---\s*([\s\S]*)/m.exec(t);
      const body = fm? fm[2].trim(): t;
      const meta = {};
      if(fm){
        fm[1].split("\n").forEach(line=>{
          if(line.startsWith("title:")) meta.titulo = line.split(":").slice(1).join(":").trim().replace(/^"|"$/g,"");
          if(line.startsWith("company:")) meta.empresa = line.split(":").slice(1).join(":").trim().replace(/^"|"$/g,"");
          if(line.startsWith("location:")) meta.ubicacion = line.split(":").slice(1).join(":").trim().replace(/^"|"$/g,"");
          if(line.startsWith("type:")) meta.tipo = line.split(":").slice(1).join(":").trim().replace(/^"|"$/g,"");
          if(line.startsWith("salary:")) meta.salario = line.split(":").slice(1).join(":").trim().replace(/^"|"$/g,"");
          if(line.startsWith("image:")) meta.imagen = line.split(":").slice(1).join(":").trim().replace(/^"|"$/g,"");
        });
      }
      meta.descripcion = body;
      meta.slug = slug;
      pick("#vacanteForm", meta);
      msg(`Editando: ${meta.titulo}`);
    });
  }
});

$("#vacanteForm").addEventListener("submit", save);
$("#btnLimpiar").addEventListener("click", ()=>{ $("#vacanteForm").reset(); $("#editSlug").value=""; $("#btnDesactivar").classList.add("d-none"); $("#btnEliminar").classList.add("d-none"); msg("Formulario limpio"); });
$("#btnDesactivar").addEventListener("click", toggleActive);
$("#btnEliminar").addEventListener("click", removeVacante);
$("#search").addEventListener("input", async (e)=>{
  const q = e.target.value.toLowerCase();
  const {items} = await loadIndex();
  const f = (items||[]).filter(v=>[v.titulo,v.empresa,v.ubicacion,v.tipo].join(" ").toLowerCase().includes(q));
  renderTable(f);
});

me(); refresh();
