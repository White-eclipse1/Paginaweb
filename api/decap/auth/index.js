// Inicia el OAuth con GitHub y redirige al /authorize
module.exports = async function (context, req) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI; // debe apuntar a /api/decap/callback
  const scope = "repo,user"; // o "public_repo" si prefieres solo público

  // state anti-CSRF
  const state = Math.random().toString(36).slice(2);
  const cookie = `decap_state=${state}; Path=/; HttpOnly; SameSite=Lax; Secure`;

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);

  context.res = {
    status: 302,
    headers: {
      "Set-Cookie": cookie,
      Location: url.toString()
    }
  };
};
