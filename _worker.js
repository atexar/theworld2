// Cloudflare Pages advanced-mode Worker. No secrets, external calls, or storage.
const aliases = {
  'genesis.atexar.in': '/genesis/',
  'solutions.atexar.in': '/solutions/',
  'insights.atexar.in': '/insights/'
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (Object.hasOwn(aliases, url.hostname) || url.hostname === 'www.atexar.in') {
      const originalHost = url.hostname;
      url.hostname = 'atexar.in';
      url.protocol = 'https:';
      url.port = '';
      if (url.pathname === '/' && Object.hasOwn(aliases, originalHost)) url.pathname = aliases[originalHost];
      return Response.redirect(url.toString(), originalHost === 'www.atexar.in' ? 301 : 302);
    }
    return env.ASSETS.fetch(request);
  }
};
