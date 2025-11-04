export default async function (context, req) {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const scope = "repo,user:email";
  const host = process.env.SWA_HOSTNAME || req.headers["x-forwarded-host"];
  const base = `https://${host}`;
  const redirectUri = `${base}/api/callback`;

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scope);

  context.res = { status: 302, headers: { Location: url.toString() } };
}
