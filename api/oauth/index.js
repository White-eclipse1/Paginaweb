const crypto = require("crypto");

module.exports = async function (context, req) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.OAUTH_REDIRECT_URI;
  const state = crypto.randomUUID();
  const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=public_repo&state=${state}`;

  context.res = {
    status: 302,
    headers: {
      Location: authorizeUrl,
    },
  };
};
