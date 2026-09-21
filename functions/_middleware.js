export async function onRequest(context) {
  const url = new URL(context.request.url);

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
