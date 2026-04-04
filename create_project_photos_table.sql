-- 1. Create the project_photos table
CREATE TABLE IF NOT EXISTS public.project_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;

-- 3. Create a policy that allows anyone (since we use the ANON key) to insert/view/delete project photos
DROP POLICY IF EXISTS "Enable full access for all users" ON public.project_photos;
CREATE POLICY "Enable full access for all users" ON public.project_photos
    FOR ALL TO public
    USING (true) WITH CHECK (true);
