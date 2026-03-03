-- SSM Website: Add Google Maps columns to site_config
-- Run this in the Supabase SQL Editor

ALTER TABLE public.site_config
    ADD COLUMN IF NOT EXISTS google_maps_url TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS google_maps_embed_url TEXT DEFAULT '';
