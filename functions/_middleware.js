export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Directly serve ads.txt and app-ads.txt for Google AdSense & AdMob verification
  if (url.pathname === '/ads.txt' || url.pathname === '/app-ads.txt') {
    const content = "google.com, pub-1902327524390179, DIRECT, f08c47fec0942fa0\n";
    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  // Handle Cloudflare email protection 404 URL if requested by crawlers or users
  if (url.pathname.startsWith('/cdn-cgi/l/email-protection')) {
    return Response.redirect('https://toolsverseapp.com/contact/', 301);
  }

  // Ensure robots.txt always responds immediately with 200
  if (url.pathname === '/robots.txt') {
    const robots = `User-agent: *\nAllow: /\n\nSitemap: https://toolsverseapp.com/sitemap.xml\n`;
    return new Response(robots, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // If the visitor or search crawler is on the *.pages.dev subdomain:
  if (url.hostname.endsWith('.pages.dev')) {
    const response = await context.next();
    const newHeaders = new Headers(response.headers);

    // Prevent Google, Bing, and all search engines from indexing the .pages.dev preview URL
    newHeaders.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }

  // On your official custom domain (toolsverseapp.com), cache HTML at edge for instant TTFB
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }
  return response;
}

