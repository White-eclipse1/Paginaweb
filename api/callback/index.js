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
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
  });
  const data = await tokenRes.json();

  if (!data.access_token) {
    context.res = { status: 400, body: JSON.stringify(data) };
    return;
  }

  // 🔧 Enviar el token de inmediato al opener (Decap escucha este mensaje)
  const html = `<!doctype html>
<html><body>
<script>
  (function() {
    var token = ${JSON.stringify(data.access_token)};
    function send() {
      try {
        // Mensaje que espera Decap:
        // 'authorization:github:success:<token>'
        window.opener && window.opener.postMessage('authorization:github:success:' + token, '*');
      } catch (e) {}
    }

    // Enviar inmediatamente y un par de veces más por si el opener tarda
    send();
    setTimeout(send, 300);
    setTimeout(send, 800);

    // Además, "tocar" al opener por compatibilidad con flujos antiguos
    setInterval(function() {
      try { window.opener && window.opener.postMessage('authorizing:github', '*'); } catch (e) {}
    }, 500);

    // Cerrar en breve
    setTimeout(function(){ window.close(); }, 1200);
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
