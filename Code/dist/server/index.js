// Minimal Cloudflare Worker entry point for the static birthday site.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
    url.pathname = requestedPath;

    const response = await env.ASSETS.fetch(new Request(url.toString(), request));
    if (response.status !== 404 || requestedPath.includes(".")) {
      return response;
    }

    const fallback = new URL("/index.html", request.url);
    return env.ASSETS.fetch(new Request(fallback.toString(), request));
  },
};
