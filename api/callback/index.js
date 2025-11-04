export default async function (context, req) {
  const code = (req.query && req.query.code) || (req.body && req.body.code);
  if (!code) { context.res = { status: 400, body: "Missing code" }; return; }

  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Accept": "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
  });
  const data = await tokenRes.json();
  if (!data.access_token) { context.res = { status: 400, body: JSON.stringify(data) }; return; }

  const html = `<!doctype html><html><body><script>
    (function(){
      function ok(){ window.opener && window.opener.postMessage('authorization:github:success:${data.access_token}','*'); window.close(); }
      window.addEventListener('message', ok, false);
      setInterval(function(){ window.opener && window.opener.postMessage('authorizing:github','*'); }, 500);
    })();
  </script>Autenticado. Puedes cerrar esta ventana.</body></html>`;
  context.res = { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" }, body: html };
}
