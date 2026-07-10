/*
# Smash Daddy POS System — Initial Schema

## Overview
Single-tenant POS schema (no per-user auth). All data is shared/public within the restaurant.

## New Tables

### menu_items
Stores all menu items available for ordering.
- id: UUID primary key
- name: Item name (e.g. "Smash Burger")
- category: Category label (e.g. "Burgers", "Drinks")
- price: Price in PKR (numeric, 2 decimal places)
- description: Optional description
- is_available: Toggle to hide items without deleting
- created_at: Timestamp

### orders
Stores each completed order/transaction.
- id: UUID primary key
- total_amount: Total in PKR
- payment_method: 'cash' or 'card'
- created_at: Timestamp of the order

### order_items
Line items belonging to an order.
- id: UUID primary key
- order_id: FK to orders
- menu_item_id: FK to menu_items (nullable in case item is later deleted)
- item_name: Snapshot of item name at time of order
- item_price: Snapshot of price at time of order
- quantity: Quantity ordered

## Security
- RLS enabled on all tables.
- All policies are TO anon, authenticated (no sign-in required — single-tenant POS).
*/

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  description text,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_menu_items" ON menu_items;
CREATE POLICY "anon_select_menu_items" ON menu_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_menu_items" ON menu_items;
CREATE POLICY "anon_insert_menu_items" ON menu_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_menu_items" ON menu_items;
CREATE POLICY "anon_update_menu_items" ON menu_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_menu_items" ON menu_items;
CREATE POLICY "anon_delete_menu_items" ON menu_items FOR DELETE
  TO anon, authenticated USING (true);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_amount numeric(10, 2) NOT NULL CHECK (total_amount >= 0),
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_delete_orders" ON orders FOR DELETE
  TO anon, authenticated USING (true);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  item_price numeric(10, 2) NOT NULL CHECK (item_price >= 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_menu_item_id_idx ON order_items(menu_item_id);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_order_items" ON order_items;
CREATE POLICY "anon_select_order_items" ON order_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_order_items" ON order_items;
CREATE POLICY "anon_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_order_items" ON order_items;
CREATE POLICY "anon_update_order_items" ON order_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_order_items" ON order_items;
CREATE POLICY "anon_delete_order_items" ON order_items FOR DELETE
  TO anon, authenticated USING (true);

-- Seed a few default menu items
INSERT INTO menu_items (name, category, price, description) VALUES
  ('Classic Smash Burger', 'Burgers', 850, 'Single smash patty with American cheese, pickles & secret sauce'),
  ('Double Smash Burger', 'Burgers', 1250, 'Two smash patties stacked with double cheese'),
  ('Smash Chicken Burger', 'Burgers', 950, 'Crispy smashed chicken fillet with jalapeños'),
  ('Loaded Fries', 'Sides', 550, 'Crispy fries loaded with cheese sauce & toppings'),
  ('Regular Fries', 'Sides', 350, 'Golden crispy fries'),
  ('Onion Rings', 'Sides', 400, 'Beer-battered onion rings'),
  ('Coca-Cola', 'Drinks', 150, 'Chilled can of Coca-Cola'),
  ('Sprite', 'Drinks', 150, 'Chilled can of Sprite'),
  ('Fresh Lemonade', 'Drinks', 250, 'Freshly squeezed lemonade'),
  ('Chocolate Milkshake', 'Drinks', 450, 'Thick creamy chocolate milkshake')
ON CONFLICT DO NOTHING;
