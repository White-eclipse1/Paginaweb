export default async function (context, req) {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const scope = "repo,user:email";

  // Toma hostname de var de entorno o del header
  const hostFromEnvOrHeader = process.env.SWA_HOSTNAME || req.headers["x-forwarded-host"];

  // Si ya empieza con http, úsalo tal cual; si no, antepone https://
  const base = hostFromEnvOrHeader.startsWith("http")
    ? hostFromEnvOrHeader
    : `https://${hostFromEnvOrHeader}`;

  const redirectUri = `${base}/api/callback`;

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scope);

  context.res = { status: 302, headers: { Location: url.toString() } };
}
