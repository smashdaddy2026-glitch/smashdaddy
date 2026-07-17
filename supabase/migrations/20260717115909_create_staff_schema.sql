/*
# Smash Daddy POS System — Staff Schema

## Overview
Adds a staff records table so admins can manage employee details from
the admin panel (single-tenant, no per-staff login — consistent with
the rest of the schema).

## New Tables

### staff
Stores restaurant staff/employee records.
- id: UUID primary key
- name: Full name
- cnic: National ID number (Pakistan CNIC), unique
- phone: Contact phone number
- position: Role/title at the restaurant (e.g. "Cashier", "Chef")
- salary: Monthly salary in PKR
- joining_date: Date the staff member joined
- address: Optional home address
- status: 'active' or 'inactive' (for staff who have left, without deleting history)
- notes: Optional free-text notes
- created_at / updated_at: Timestamps

## Security
- RLS enabled.
- All policies are TO anon, authenticated (no sign-in required — single-tenant POS,
  consistent with the rest of the schema).
*/

CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cnic text NOT NULL UNIQUE,
  phone text NOT NULL,
  position text NOT NULL DEFAULT 'Staff',
  salary numeric(10, 2) NOT NULL DEFAULT 0 CHECK (salary >= 0),
  joining_date date NOT NULL DEFAULT CURRENT_DATE,
  address text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_staff" ON staff;
CREATE POLICY "anon_select_staff" ON staff FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_staff" ON staff;
CREATE POLICY "anon_insert_staff" ON staff FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_staff" ON staff;
CREATE POLICY "anon_update_staff" ON staff FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_staff" ON staff;
CREATE POLICY "anon_delete_staff" ON staff FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS staff_name_idx ON staff(name);
CREATE INDEX IF NOT EXISTS staff_status_idx ON staff(status);
