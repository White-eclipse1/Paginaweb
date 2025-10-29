module.exports = async function (context, req) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI; // https://.../api/decap/callback
  const scope =
    process.env.GITHUB_SCOPE ||
    (req.query && req.query.scope) ||
    "repo,user:email";

  if (!clientId || !redirectUri) {
    context.res = { status: 500, body: "Missing env vars" };
    return;
  }

  // CSRF state cookie
  const state = Math.random().toString(36).slice(2);
  const cookie = `decap_state=${state}; Path=/; HttpOnly; SameSite=Lax; Secure`;

  const u = new URL("https://github.com/login/oauth/authorize");
  u.searchParams.set("client_id", clientId);
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("scope", scope);
  u.searchParams.set("state", state);

  context.res = {
    status: 302,
    headers: { Location: u.toString(), "Set-Cookie": cookie }
  };
};
