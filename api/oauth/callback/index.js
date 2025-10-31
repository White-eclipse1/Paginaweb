const fetch = require("node-fetch");

module.exports = async function (context, req) {
  const { code } = req.query;

  if (!code) {
    context.res = {
      status: 400,
      body: { error: "Missing code parameter" },
    };
    return;
  }

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.OAUTH_REDIRECT_URI,
      }),
    });

    const data = await response.json();
    context.res = {
      headers: { "Content-Type": "application/json" },
      body: data,
    };
  } catch (err) {
    context.res = {
      status: 500,
      body: { error: err.message },
    };
  }
};
