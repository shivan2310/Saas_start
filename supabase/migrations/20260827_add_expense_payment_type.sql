-- Add paymentType column to expenses table
-- This stores the payment method used for each expense (e.g. UPI, Cash, Credit Card)
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS "paymentType" text;
