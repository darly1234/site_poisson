export async function onRequest(context) {
  const { request, params } = context;
  const url = new URL(request.url);
  const path = params.path ? params.path.join('/') : '';

  const targetUrl = `http://72.60.254.10:3002/${path}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || '');
  headers.delete('host');

  const proxyRequest = new Request(targetUrl, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
  });

  const response = await fetch(proxyRequest);

  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Origin', '*');
  newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  newHeaders.set('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: newHeaders });
  }

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  });
}
