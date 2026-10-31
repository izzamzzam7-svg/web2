# Backend API placeholder

Cloudflare Pages Functions can host server-side endpoints in this folder.
Before implementing payment and supplier endpoints:

1. Select a payment gateway and obtain its official API documentation.
2. Select a PPOB supplier and obtain its official API documentation.
3. Store all secrets as Cloudflare environment variables, never in browser JS.
4. Verify payment callbacks/signatures on the server.
5. Make order creation idempotent to prevent duplicate supplier requests.
6. Verify supplier status using authenticated server-side requests.
7. Add rate limits, request validation, logs, and authorization checks.

No live payment or supplier request is implemented in this starter.
