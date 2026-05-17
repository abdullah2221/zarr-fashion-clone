# UR-Fashion Supabase Backend Architecture

## Planned tables
- `profiles`
- `products`
- `categories`
- `product_images`
- `orders`
- `order_items`
- `wishlist_items`
- `feedback`
- `banners`
- `campaigns`
- `admin_settings`

## Storage
Use a public-read Supabase Storage bucket named `product-images`.
- Store only the object path in `product_images.storage_path`.
- Use `is_primary = true` for the card/detail hero image.
- Use `sort_order` for gallery ordering.
- Keep multiple images per product; a partial unique index enforces one primary image per product.

## Roles and admin model
`profiles.role` is the application authorization source.
- Allowed roles: `customer`, `admin`, `super_admin`.
- Public registration should create only `customer` profiles.
- Admin users are created first through normal auth provisioning, then promoted manually in the Supabase dashboard or SQL console.
- No public admin registration route should be exposed.

## RLS strategy
Enable RLS on every application table.

- Public read: active `products`, active `categories`, active `banners`, active `campaigns`, and approved `feedback`.
- Admin write: only `admin` and `super_admin` profiles may insert/update/delete product, category, product image, banner, campaign, and admin setting records.
- Role and settings safety: only `super_admin` should manage user roles and `admin_settings`; catalog/content writes may be handled by `admin` and `super_admin`.
- Wishlist: authenticated users may select/insert/delete only rows where `user_id = auth.uid()`.
- Orders: authenticated users may insert orders for themselves and select only their own orders.
- Order items: access is allowed only through ownership of the parent order.
- Feedback: authenticated users may submit their own feedback; guest/customer submissions can be supported with nullable `user_id` plus rate limiting or server-side validation later. Only admins may approve/reject.
- Profiles: users may read/update their own profile; only privileged roles may read or change other users' roles.
- Prevent self-escalation by requiring users to keep their existing `profiles.role` value when updating their own profile.

A helper SQL function such as `public.is_admin()` should centralize admin checks from `profiles.role`.

## SSR guidance
- The Angular app should request Supabase through `SupabaseClientService` rather than constructing clients ad hoc.
- Browser-only auth persistence is enabled only in the browser.
- Repositories should tolerate an unconfigured client during local development; the existing UI remains on local/mock services until integration work begins.

## Local fallback retained in phase 1
- Cart remains localStorage-backed.
- Wishlist remains localStorage-backed in the current UI service.
- Product rendering remains mock-data-backed through the existing `ProductService`.
- `LocalCartRepository`, `LocalWishlistRepository`, and `LocalProductRepository` are prepared as explicit fallback adapters for later composition.

## Storefront read migration
- Run `schema.sql`, then `rls-policies.sql`, then `storage.sql`, then `seed.sql`.
- Upload category and product image files into the `product-images` bucket using the object paths referenced by `seed.sql`.
- When `SUPABASE_URL` and `SUPABASE_ANON_KEY` are configured, the storefront prefers Supabase reads; if configuration is absent or live reads fail, it falls back to local static data.
