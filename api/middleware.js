export function middleware(req) {
  return new Response(null, {
    status: 200,
    headers: {
      "x-frame-options": "", // Allow embedding anywhere
    },
  });
}
