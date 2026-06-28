-- Fix businesses RLS policies: the original policies used `user_id` but the
-- column is `owner_id`. This migration recreates them with the correct name.
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query.

DROP POLICY IF EXISTS "businesses: owner insert" ON public.businesses;
CREATE POLICY "businesses: owner insert"
  ON public.businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "businesses: owner update" ON public.businesses;
CREATE POLICY "businesses: owner update"
  ON public.businesses FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "businesses: owner delete" ON public.businesses;
CREATE POLICY "businesses: owner delete"
  ON public.businesses FOR DELETE
  USING (auth.uid() = owner_id);
