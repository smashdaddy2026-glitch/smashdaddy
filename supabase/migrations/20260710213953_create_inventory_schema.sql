/*
# Smash Daddy POS System — Inventory Schema

## Overview
Adds stock/inventory tracking for raw ingredients (buns, patties, cheese, etc.)
separate from the sellable menu_items table.

## New Tables

### inventory_items
Tracks stock levels for ingredients/supplies.
- id: UUID primary key
- name: Item name (e.g. "Burger Buns", "Beef Patty")
- unit: Unit of measurement (e.g. "pcs", "kg", "ltr", "packs")
- quantity: Current quantity on hand (numeric, allows decimals like 2.5 kg)
- low_stock_threshold: Quantity at/below which the item is flagged as low stock
- created_at: Timestamp
- updated_at: Timestamp, refreshed whenever the row is updated

## Security
- RLS enabled.
- All policies are TO anon, authenticated (no sign-in required — single-tenant POS,
  consistent with the rest of the schema).
*/

CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  unit text NOT NULL DEFAULT 'pcs',
  quantity numeric(10, 2) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  low_stock_threshold numeric(10, 2) NOT NULL DEFAULT 0 CHECK (low_stock_threshold >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_inventory_items" ON inventory_items;
CREATE POLICY "anon_select_inventory_items" ON inventory_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_inventory_items" ON inventory_items;
CREATE POLICY "anon_insert_inventory_items" ON inventory_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_inventory_items" ON inventory_items;
CREATE POLICY "anon_update_inventory_items" ON inventory_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_inventory_items" ON inventory_items;
CREATE POLICY "anon_delete_inventory_items" ON inventory_items FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS inventory_items_name_idx ON inventory_items(name);

-- Seed a few common restaurant stock items
INSERT INTO inventory_items (name, unit, quantity, low_stock_threshold) VALUES
  ('Burger Buns', 'pcs', 100, 20),
  ('Beef Patty', 'pcs', 80, 15),
  ('Chicken Patty', 'pcs', 60, 15),
  ('Cheese Slices', 'pcs', 150, 30),
  ('Lettuce', 'kg', 5, 1),
  ('Tomato', 'kg', 5, 1),
  ('Pickles', 'kg', 3, 0.5),
  ('Fries (Frozen)', 'kg', 20, 5),
  ('Cooking Oil', 'ltr', 10, 2),
  ('Coca-Cola Cans', 'pcs', 48, 12)
ON CONFLICT DO NOTHING;
