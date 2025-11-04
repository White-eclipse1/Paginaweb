import fetch from "node-fetch";

// Azure Function: /api/callback (HTTP trigger)
export default async function (context, req) {
  const code = (req.query && req.query.code) || (req.body && req.body.code);
  if (!code) {
    context.res = { status: 400, body: "Missing code" };
    return;
  }

  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  // Intercambia code por access_token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Accept": "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code
    })
  });
  const data = await tokenRes.json();

  if (!data.access_token) {
    context.res = { status: 400, body: JSON.stringify(data) };
    return;
  }

  // Devuelve un HTML que notifica al opener del popup (protocolo Decap)
  const html = `<!doctype html>
<html><body>
<script>
  (function() {
    function receiveMessage(e) {
      // Enviar el token al opener (Decap espera este formato exacto)
      if (e && e.origin) {
        window.opener.postMessage('authorization:github:success:${data.access_token}', '*');
        window.close();
      }
    }
    window.addEventListener('message', receiveMessage, false);
    // "poke" al opener por si no envía postMessage primero
    setInterval(function() {
      window.opener && window.opener.postMessage('authorizing:github', '*');
    }, 500);
  })();
</script>
<p>Autenticado. Puedes cerrar esta ventana.</p>
</body></html>`;

  context.res = {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: html
  };
}
