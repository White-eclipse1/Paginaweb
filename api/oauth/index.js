const crypto = require("crypto");

module.exports = async function (context, req) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.OAUTH_REDIRECT_URI;
  const scope = process.env.GITHUB_SCOPES || "public_repo";
  if (!clientId || !redirectUri) {
    context.res = { status: 500, body: "Missing env vars in Azure (GITHUB_CLIENT_ID / OAUTH_REDIRECT_URI)" };
    return;
  }

  const state = crypto.randomUUID();
  const authorizeUrl = "https://github.com/login/oauth/authorize" +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${encodeURIComponent(state)}`;

  context.res = {
    status: 302,
    headers: { Location: authorizeUrl }
  };
};
