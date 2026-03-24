export default async function (context, req) {
  const clientId = process.env.OAUTH_CLIENT_ID;

  if (!clientId) {
    context.res = { status: 500, body: "Missing OAUTH_CLIENT_ID" };
    return;
  }

  const scope = "repo,user:email";
  const host = process.env.SWA_HOSTNAME || req.headers["x-forwarded-host"] || req.headers.host;
  const redirectUri = `https://${host}/api/callback`;
  const state = Math.random().toString(36).slice(2);

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);

  context.res = {
    status: 302,
    headers: { Location: url.toString() }
  };
}
