insert into public.categories (id, name, slug, description, image_path, sort_order)
values
  ('10000000-0000-4000-8000-000000000001', 'UNSTITCHED', 'unstitched', '2 & 3 piece suits', 'categories/unstitched.jpg', 1),
  ('10000000-0000-4000-8000-000000000002', 'READY TO WEAR', 'ready-to-wear', 'Effortless pret', 'categories/ready-to-wear.jpg', 2),
  ('10000000-0000-4000-8000-000000000003', 'SUMMER LAWN', 'lawn', 'Light, breathable edits', 'categories/lawn.jpg', 3),
  ('10000000-0000-4000-8000-000000000004', 'LUXURY PRET', 'eid-edit', 'Premium occasionwear', 'categories/eid-edit.jpg', 4),
  ('10000000-0000-4000-8000-000000000005', 'WEDDING', 'wedding', 'Festive formals', 'categories/wedding.jpg', 5),
  ('10000000-0000-4000-8000-000000000006', 'MODEST WEAR', 'stitched', 'Elegant coverage', 'categories/stitched.jpg', 6),
  ('10000000-0000-4000-8000-000000000007', 'FOOTWEAR', 'footwear', 'Polished finish', 'categories/footwear.jpg', 7),
  ('10000000-0000-4000-8000-000000000008', 'ACCESSORIES', 'sale', 'Complete the look', 'categories/sale.jpg', 8)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image_path = excluded.image_path,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.products (id, legacy_id, sku, name, slug, brand, description, price, original_price, category_id, is_active, is_featured, stock_quantity, metadata)
values
  ('20000000-0000-4000-8000-000000000011', 11, 'INS-IC017-BLK', 'CASUAL SLIP ON IC017-BLACK', 'casual-slip-on-ic017-black', 'INSIGNIA', null, 5450, null, '10000000-0000-4000-8000-000000000007', true, true, 18, '{"collection":"Ready to Wear","rating":4.7,"reviewCount":88,"sizes":["36","37","38","39","40"],"badge":"Trending","isTrending":true,"stockLabel":"Selling fast"}'),
  ('20000000-0000-4000-8000-000000000012', 12, 'SSF-MAHAY-3P', 'UNSTITCHED MAHAY LAWN 3 PIECE SUIT', 'unstitched-mahay-lawn-3-piece-suit', 'SANA SAFINAZ', 'A breathable summer lawn suit with a soft printed palette and elegant seasonal detailing.', 4499, null, '10000000-0000-4000-8000-000000000001', true, true, 7, '{"collection":"Unstitched","rating":4.8,"reviewCount":143,"sizes":["Unstitched","2 Pc","3 Pc"],"badge":"Best Seller","stockLabel":"Only 7 left"}'),
  ('20000000-0000-4000-8000-000000000013', 13, 'J-OFFWHITE-3P', 'OFF WHITE LAWN EMBROIDERED 3P', 'off-white-lawn-embroidered-3p', 'J.', null, 6490, null, '10000000-0000-4000-8000-000000000003', true, true, 20, '{"collection":"Summer Lawn","rating":4.6,"reviewCount":72,"sizes":["S","M","L"],"badge":"New","isNew":true}'),
  ('20000000-0000-4000-8000-000000000014', 14, 'SSF-LAWN-3P', 'UNSTITCHED 3 PIECE LAWN SUIT', 'unstitched-3-piece-lawn-suit', 'SANA SAFINAZ', null, 4499, null, '10000000-0000-4000-8000-000000000001', true, true, 4, '{"collection":"Unstitched","rating":4.9,"reviewCount":214,"sizes":["Unstitched","3 Pc"],"badge":"Limited Stock","stockLabel":"Limited stock"}'),
  ('20000000-0000-4000-8000-000000000015', 15, 'URF-MAXI-PRINT', 'PRINTED MAXI DRESS', 'printed-maxi-dress', 'UR-Fashion Studio', null, 7999, null, '10000000-0000-4000-8000-000000000002', true, true, 14, '{"collection":"Ready to Wear","rating":4.5,"reviewCount":51,"sizes":["XS","S","M","L"],"badge":"Trending","isTrending":true}'),
  ('20000000-0000-4000-8000-000000000021', 21, 'SSF-LINEN-2P', 'UNSTITCHED LINEN MUZLIN 2 PIECE SUIT', 'unstitched-linen-muzlin-2-piece-suit', 'SANA SAFINAZ', null, 5850, 11699, '10000000-0000-4000-8000-000000000008', true, false, 12, '{"collection":"Sale","rating":4.7,"reviewCount":132,"sizes":["Unstitched","2 Pc"],"badge":"Best Seller","stockLabel":"Sale ends soon"}'),
  ('20000000-0000-4000-8000-000000000022', 22, 'ND-SHACKET', 'CANVAS PATCH POCKET SHACKET', 'canvas-patch-pocket-shacket', 'naya dour', null, 4485, 14950, '10000000-0000-4000-8000-000000000002', true, false, 3, '{"collection":"Ready to Wear","rating":4.4,"reviewCount":39,"sizes":["S","M","L"],"badge":"Limited Stock","stockLabel":"Only 3 left"}'),
  ('20000000-0000-4000-8000-000000000023', 23, 'INS-S066-PLUM', 'FORMAL COURT SHOES #S066-PLUM', 'formal-court-shoes-s066-plum', 'INSIGNIA', null, 5725, 11450, '10000000-0000-4000-8000-000000000007', true, false, 16, '{"collection":"Sale","rating":4.6,"reviewCount":61,"sizes":["36","37","38","39"],"stockLabel":"COD available"}'),
  ('20000000-0000-4000-8000-000000000024', 24, 'SSF-MUZLIN-3P', 'UNSTITCHED MUZLIN LAWN 3 PIECE SUIT', 'unstitched-muzlin-lawn-3-piece-suit', 'SANA SAFINAZ', null, 5360, 6699, '10000000-0000-4000-8000-000000000003', true, false, 11, '{"collection":"Summer Lawn","rating":4.8,"reviewCount":97,"sizes":["Unstitched","3 Pc"],"badge":"New","isNew":true}'),
  ('20000000-0000-4000-8000-000000000025', 25, 'ISM-MAXI-PRINT', 'PRINTED MAXI DRESS', 'printed-maxi-dress-sale', 'Ismail''s', null, 3750, 7499, '10000000-0000-4000-8000-000000000002', true, false, 9, '{"collection":"Ready to Wear","rating":4.3,"reviewCount":45,"sizes":["XS","S","M"],"stockLabel":"Selling fast"}')
on conflict (legacy_id) do update set
  name = excluded.name,
  slug = excluded.slug,
  brand = excluded.brand,
  description = excluded.description,
  price = excluded.price,
  original_price = excluded.original_price,
  category_id = excluded.category_id,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured,
  stock_quantity = excluded.stock_quantity,
  metadata = excluded.metadata;

insert into public.product_images (product_id, storage_path, alt_text, is_primary, sort_order)
values
  ('20000000-0000-4000-8000-000000000011', 'products/11/main.jpg', 'CASUAL SLIP ON IC017-BLACK', true, 0),
  ('20000000-0000-4000-8000-000000000011', 'products/11/alt.jpg', 'CASUAL SLIP ON IC017-BLACK alternate', false, 1),
  ('20000000-0000-4000-8000-000000000012', 'products/12/main.jpg', 'UNSTITCHED MAHAY LAWN 3 PIECE SUIT', true, 0),
  ('20000000-0000-4000-8000-000000000012', 'products/12/alt.jpg', 'UNSTITCHED MAHAY LAWN 3 PIECE SUIT alternate', false, 1),
  ('20000000-0000-4000-8000-000000000013', 'products/13/main.jpg', 'OFF WHITE LAWN EMBROIDERED 3P', true, 0),
  ('20000000-0000-4000-8000-000000000013', 'products/13/alt.jpg', 'OFF WHITE LAWN EMBROIDERED 3P alternate', false, 1),
  ('20000000-0000-4000-8000-000000000014', 'products/14/main.jpg', 'UNSTITCHED 3 PIECE LAWN SUIT', true, 0),
  ('20000000-0000-4000-8000-000000000014', 'products/14/alt.jpg', 'UNSTITCHED 3 PIECE LAWN SUIT alternate', false, 1),
  ('20000000-0000-4000-8000-000000000015', 'products/15/main.jpg', 'PRINTED MAXI DRESS', true, 0),
  ('20000000-0000-4000-8000-000000000015', 'products/15/alt.jpg', 'PRINTED MAXI DRESS alternate', false, 1),
  ('20000000-0000-4000-8000-000000000021', 'products/21/main.jpg', 'UNSTITCHED LINEN MUZLIN 2 PIECE SUIT', true, 0),
  ('20000000-0000-4000-8000-000000000021', 'products/21/alt.jpg', 'UNSTITCHED LINEN MUZLIN 2 PIECE SUIT alternate', false, 1),
  ('20000000-0000-4000-8000-000000000022', 'products/22/main.jpg', 'CANVAS PATCH POCKET SHACKET', true, 0),
  ('20000000-0000-4000-8000-000000000022', 'products/22/alt.jpg', 'CANVAS PATCH POCKET SHACKET alternate', false, 1),
  ('20000000-0000-4000-8000-000000000023', 'products/23/main.jpg', 'FORMAL COURT SHOES #S066-PLUM', true, 0),
  ('20000000-0000-4000-8000-000000000023', 'products/23/alt.jpg', 'FORMAL COURT SHOES #S066-PLUM alternate', false, 1),
  ('20000000-0000-4000-8000-000000000024', 'products/24/main.jpg', 'UNSTITCHED MUZLIN LAWN 3 PIECE SUIT', true, 0),
  ('20000000-0000-4000-8000-000000000024', 'products/24/alt.jpg', 'UNSTITCHED MUZLIN LAWN 3 PIECE SUIT alternate', false, 1),
  ('20000000-0000-4000-8000-000000000025', 'products/25/main.jpg', 'PRINTED MAXI DRESS', true, 0),
  ('20000000-0000-4000-8000-000000000025', 'products/25/alt.jpg', 'PRINTED MAXI DRESS alternate', false, 1)
on conflict do nothing;
