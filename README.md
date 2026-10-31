# XYLER DIGITAL STORE — starter project

Starter UI for a dark navy digital store / PPOB website.

## Included
- Responsive Home page with dark-blue styling and white buttons.
- Four main navigation items: Home, Produk, Akun, Support.
- Demo product categories and filtering.
- Login dialog placeholder.
- Initial Supabase SQL schema.
- Cloudflare Pages Functions backend planning notes.

## Important: demo only
This ZIP is not yet a live store. It does not process payments, contact PPOB suppliers,
authenticate users, or provide a production admin panel. Product cards and system labels
are placeholders. Do not accept real payments using this starter.

## Deploy frontend preview
1. Create a Cloudflare account.
2. Create a Pages project and upload this folder (or connect a Git repository).
3. Build command: leave blank.
4. Build output directory: `/` (project root).
5. Cloudflare Pages will assign a `*.pages.dev` address.

## Next development steps
1. Create Supabase project and configure Auth (email + Google OAuth).
2. Apply and review `database/schema.sql`.
3. Add strict Row Level Security policies and server-side Owner/Admin role checks.
4. Build real Admin Panel CRUD pages.
5. Choose a payment gateway and PPOB supplier; implement their APIs server-side.
6. Test callbacks, duplicate requests, failed/pending transactions, and refunds before launch.

Never place Supabase service-role keys, supplier secrets, or payment secrets in `assets/app.js`.
