const qs = require("querystring");
const https = require("https");

function getCookie(req, name) {
  const header = req.headers.cookie || "";
  const parts = header.split(";").map(s => s.trim());
  for (const p of parts) {
    const [k, v] = p.split("=");
    if (k === name) return decodeURIComponent(v || "");
  }
  return "";
}

function exchangeCodeForToken({ client_id, client_secret, code, redirect_uri }) {
  const postData = qs.stringify({ client_id, client_secret, code, redirect_uri });
  const options = {
    hostname: "github.com",
    path: "/login/oauth/access_token",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
      "Content-Length": Buffer.byteLength(postData)
    }
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = "";
      res.on("data", chunk => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.access_token) resolve(json.access_token);
          else reject(new Error("No access_token: " + data));
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

module.exports = async function (context, req) {
  try {
    const code = (req.query && req.query.code) || "";
    const state = (req.query && req.query.state) || "";
    const savedState = getCookie(req, "decap_state");

    if (!code) { context.res = { status: 400, body: "Missing code" }; return; }
    if (!state || !savedState || state !== savedState) {
      context.res = { status: 400, body: "Invalid state" }; return;
    }

    const token = await exchangeCodeForToken({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_REDIRECT_URI
    });

    context.res = {
      status: 302,
      headers: { Location: "/admin/callback.html#access_token=" + encodeURIComponent(token) }
    };
  } catch (e) {
    context.res = { status: 500, body: "OAuth error: " + e.message };
  }
};
