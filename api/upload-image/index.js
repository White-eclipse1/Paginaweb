// api/upload-image/index.js
const multiparty = require("multiparty");
const fs = require("fs");
const path = require("path");
const fetch = (...a) => import("node-fetch").then(({default: f}) => f(...a));

module.exports = async function (context, req) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if(!token || !repo) {
    context.res = { status:500, body:"Missing GITHUB_TOKEN or GITHUB_REPO" };
    return;
  }

  const [owner, name] = repo.split("/");
  const gh = "https://api.github.com";

  const form = new multiparty.Form();
  const file = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if(err) return reject(err);
      const f = files.file?.[0];
      resolve(f);
    });
  }).catch(err => null);

  if(!file) { context.res = { status:400, body:"file required" }; return; }

  const buf = fs.readFileSync(file.path);
  const b64 = buf.toString("base64");
  const safeName = path.basename(file.originalFilename || "img");
  const savePath = `content/vacantes/imagenes/${Date.now()}-${safeName}`;

  const r = await fetch(`${gh}/repos/${owner}/${name}/contents/${encodeURIComponent(savePath)}`,{
    method:"PUT",
    headers:{
      Authorization:`Bearer ${token}`,
      "User-Agent":"swa-commit",
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      message:`assets(job): ${safeName}`,
      content: b64,
      branch
    })
  });
  const j = await r.json();

  if(r.status >= 200 && r.status < 300) {
    context.res = {
      status: 200,
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ path: savePath })
    };
  } else {
    context.res = { status: r.status, body: JSON.stringify(j) };
  }
};
