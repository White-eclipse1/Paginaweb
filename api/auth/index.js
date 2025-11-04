// Azure Function: /api/auth (HTTP trigger)
export default async function (context, req) {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const scope = "repo,user:email"; // repo es necesario si el repo no es público o quieres PRs
  const base = `https://${process.env.SWA_HOSTNAME || req.headers["x-forwarded-host"]}`;
  const redirectUri = `${base}/api/callback`;

  const state = Math.random().toString(36).slice(2); // opcional: podrías guardarlo en cookie
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
