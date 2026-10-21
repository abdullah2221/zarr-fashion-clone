-- ============================================================
-- seed-placeholder-images.sql
-- ============================================================
-- Assigns LoremFlickr remote placeholder images to products.
-- storage_path accepts full https:// URLs — the Angular app's
-- SupabaseStorageRepository.getProductImageUrl() detects the
-- scheme and returns the URL directly without any bucket call.
--
-- HOW TO USE:
--   1. Run your product inserts first so the slugs exist.
--   2. Execute this file in the Supabase SQL editor or via CLI:
--        supabase db execute -f supabase/seed-placeholder-images.sql
--   3. When real images are uploaded, delete these rows and
--      insert new ones with Supabase storage paths instead.
--
-- PLACEHOLDER STRATEGY:
--   • LoremFlickr returns consistent themed photos by keyword.
--   • Each URL includes a random seed so different products
--     get distinct images while remaining cacheable.
--   • Width is 700px — matches the storefront card target.
-- ============================================================

DO $$
DECLARE
  pid uuid;
BEGIN

  -- ── Casual Slip On (Footwear) ──────────────────────────────
  SELECT id INTO pid FROM public.products WHERE slug = 'casual-slip-on-ic017-black' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, storage_path, alt_text, is_primary, sort_order)
    VALUES
      (pid, 'https://loremflickr.com/700/840/footwear,shoes?lock=11', 'Casual Slip On main image', true, 0),
      (pid, 'https://loremflickr.com/700/840/footwear,sandals?lock=12', 'Casual Slip On alternate', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Sana Safinaz Mahay Lawn (Unstitched) ──────────────────
  SELECT id INTO pid FROM public.products WHERE slug = 'unstitched-mahay-lawn-3-piece-suit' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, storage_path, alt_text, is_primary, sort_order)
    VALUES
      (pid, 'https://loremflickr.com/700/840/pakistani,fashion,lawn?lock=21', 'Mahay Lawn main image', true, 0),
      (pid, 'https://loremflickr.com/700/840/pakistani,dress,suit?lock=22', 'Mahay Lawn alternate', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── J. Off White Lawn Embroidered ─────────────────────────
  SELECT id INTO pid FROM public.products WHERE slug = 'off-white-lawn-embroidered-3p' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, storage_path, alt_text, is_primary, sort_order)
    VALUES
      (pid, 'https://loremflickr.com/700/840/embroidered,lawn,fashion?lock=31', 'Off White Lawn main image', true, 0),
      (pid, 'https://loremflickr.com/700/840/white,dress,fashion?lock=32', 'Off White Lawn alternate', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Sana Safinaz Unstitched 3 Piece ───────────────────────
  SELECT id INTO pid FROM public.products WHERE slug = 'unstitched-3-piece-lawn-suit' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, storage_path, alt_text, is_primary, sort_order)
    VALUES
      (pid, 'https://loremflickr.com/700/840/fashion,pakistani,suit?lock=41', 'Unstitched 3 Piece main image', true, 0),
      (pid, 'https://loremflickr.com/700/840/fabric,textile,floral?lock=42', 'Unstitched 3 Piece alternate', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Printed Maxi Dress ────────────────────────────────────
  SELECT id INTO pid FROM public.products WHERE slug = 'printed-maxi-dress' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, storage_path, alt_text, is_primary, sort_order)
    VALUES
      (pid, 'https://loremflickr.com/700/840/maxi,dress,fashion?lock=51', 'Printed Maxi Dress main image', true, 0),
      (pid, 'https://loremflickr.com/700/840/summer,dress,model?lock=52', 'Printed Maxi Dress alternate', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Linen Muzlin 2 Piece (Sale) ───────────────────────────
  SELECT id INTO pid FROM public.products WHERE slug = 'unstitched-linen-muzlin-2-piece-suit' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, storage_path, alt_text, is_primary, sort_order)
    VALUES
      (pid, 'https://loremflickr.com/700/840/linen,fabric,fashion?lock=61', 'Linen Muzlin 2 Piece main image', true, 0),
      (pid, 'https://loremflickr.com/700/840/unstitched,cloth,design?lock=62', 'Linen Muzlin 2 Piece alternate', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Canvas Patch Pocket Shacket ───────────────────────────
  SELECT id INTO pid FROM public.products WHERE slug = 'canvas-patch-pocket-shacket' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, storage_path, alt_text, is_primary, sort_order)
    VALUES
      (pid, 'https://loremflickr.com/700/840/jacket,fashion,casual?lock=71', 'Canvas Shacket main image', true, 0),
      (pid, 'https://loremflickr.com/700/840/shirt,jacket,style?lock=72', 'Canvas Shacket alternate', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Formal Court Shoes ────────────────────────────────────
  SELECT id INTO pid FROM public.products WHERE slug = 'formal-court-shoes-s066-plum' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, storage_path, alt_text, is_primary, sort_order)
    VALUES
      (pid, 'https://loremflickr.com/700/840/shoes,heels,formal?lock=81', 'Formal Court Shoes main image', true, 0),
      (pid, 'https://loremflickr.com/700/840/pumps,footwear,elegant?lock=82', 'Formal Court Shoes alternate', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Unstitched Muzlin Lawn 3 Piece ────────────────────────
  SELECT id INTO pid FROM public.products WHERE slug = 'unstitched-muzlin-lawn-3-piece-suit' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, storage_path, alt_text, is_primary, sort_order)
    VALUES
      (pid, 'https://loremflickr.com/700/840/lawn,pakistani,fashion?lock=91', 'Muzlin Lawn 3 Piece main image', true, 0),
      (pid, 'https://loremflickr.com/700/840/fabric,print,floral?lock=92', 'Muzlin Lawn 3 Piece alternate', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Ismail's Printed Maxi Dress (Sale) ───────────────────
  SELECT id INTO pid FROM public.products WHERE slug = 'printed-maxi-dress-sale' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, storage_path, alt_text, is_primary, sort_order)
    VALUES
      (pid, 'https://loremflickr.com/700/840/maxi,dress,summer?lock=101', 'Sale Maxi Dress main image', true, 0),
      (pid, 'https://loremflickr.com/700/840/fashion,model,dress?lock=102', 'Sale Maxi Dress alternate', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;

END $$;
