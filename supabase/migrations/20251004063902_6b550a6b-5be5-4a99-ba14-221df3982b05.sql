-- First migration: Add super_admin to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';