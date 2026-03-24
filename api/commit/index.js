// api/commit/index.js
const fetch = (...a) => import("node-fetch").then(({default: f}) => f(...a));

module.exports = async function (context, req) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO; // "owner/name"
  const branch = process.env.GITHUB_BRANCH || "main";
  if(!token || !repo) {
    context.res = { status:500, body:"Missing GITHUB_TOKEN or GITHUB_REPO" };
    return;
  }

  const [owner, name] = repo.split("/");
  const gh = "https://api.github.com";
  const path = req.body?.path || req.query.path;
  const message = req.body?.message || "chore: update";

  if(!path) { context.res = { status:400, body:"path required" }; return; }

  async function getSha(p){
    const r = await fetch(`${gh}/repos/${owner}/${name}/contents/${encodeURIComponent(p)}?ref=${branch}`, {
      headers:{ Authorization:`Bearer ${token}`, "User-Agent":"swa-commit" }
    });
    if(r.status===404) return null;
    const j = await r.json();
    return j.sha || null;
  }

  if(req.method === "DELETE"){
    const sha = await getSha(path);
    if(!sha) { context.res = { status:404, body:"not found" }; return; }
    const r = await fetch(`${gh}/repos/${owner}/${name}/contents/${encodeURIComponent(path)}`,{
      method:"DELETE",
      headers:{ Authorization:`Bearer ${token}`, "User-Agent":"swa-commit", "Content-Type":"application/json" },
      body: JSON.stringify({ message, sha, branch })
    });
    const j = await r.json();
    context.res = { status:r.status, body: JSON.stringify(j) };
    return;
  }

  const contentBase64 = req.body?.contentBase64;
  if(!contentBase64) { context.res = { status:400, body:"contentBase64 required" }; return; }

  const sha = await getSha(path);
  const r = await fetch(`${gh}/repos/${owner}/${name}/contents/${encodeURIComponent(path)}`,{
    method:"PUT",
    headers:{ Authorization:`Bearer ${token}`, "User-Agent":"swa-commit", "Content-Type":"application/json" },
    body: JSON.stringify({ message, content: contentBase64, sha, branch })
  });
  const j = await r.json();
  context.res = { status:r.status, body: JSON.stringify(j) };
};
