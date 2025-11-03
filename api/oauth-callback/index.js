const fetch = require("node-fetch"); // v2 (CommonJS)

module.exports = async function (context, req) {
  const code = (req.query && req.query.code) || (req.body && req.body.code);
  if (!code) {
    context.res = { status: 400, body: { error: "Missing code" } };
    return;
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = process.env.OAUTH_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    context.res = { status: 500, body: { error: "Missing env vars in Azure" } };
    return;
  }

  try {
    const resp = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri
      })
    });
    const data = await resp.json();
    // Devuelve en el formato que Decap espera (JSON con access_token, etc)
    context.res = { headers: { "Content-Type": "application/json" }, body: data };
  } catch (e) {
    context.res = { status: 500, body: { error: e.message } };
  }
};
