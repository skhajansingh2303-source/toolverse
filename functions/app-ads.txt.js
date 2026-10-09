export async function onRequest() {
  const content = "google.com, pub-1902327524390179, DIRECT, f08c47fec0942fa0\n";
  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
