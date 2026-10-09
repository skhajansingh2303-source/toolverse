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

  // On your official custom domain (toolsverseapp.com), allow full indexing and ranking
  return context.next();
}

