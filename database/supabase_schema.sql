-- ==============================================================================
-- OrbitSuite • Supabase Database Schema & Row-Level-Security (RLS) Setup
-- ==============================================================================
-- Anleitung:
-- 1. Erstelle ein kostenloses Konto auf https://supabase.com
-- 2. Erstelle ein neues Projekt (z.B. "orbitsuite")
-- 3. Öffne im linken Menü den "SQL Editor"
-- 4. Füge dieses Script ein und klicke auf "Run"
-- 5. Kopiere unter "Project Settings" > "API" deine Projekt-URL und den anon public key
-- 6. Trage beide Werte in OrbitSuite unter "Cloud-Sync & Konto" ein
-- ==============================================================================

-- 1. Haupt-Tabelle für Benutzer-Synchronisation erstellen
CREATE TABLE IF NOT EXISTS public.orbit_sync (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    tasks JSONB DEFAULT '[]'::jsonb,
    notes JSONB DEFAULT '[]'::jsonb,
    habits JSONB DEFAULT '[]'::jsonb,
    focus JSONB DEFAULT '{"sessions": 0, "minutes": 0}'::jsonb,
    riddles JSONB DEFAULT '{"solved": [], "streak": 0, "custom": []}'::jsonb,
    puzzles JSONB DEFAULT '{}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Row Level Security (RLS) aktivieren (Absolute Datensicherheit)
ALTER TABLE public.orbit_sync ENABLE ROW LEVEL SECURITY;

-- 3. Richtlinien: Jeder authentifizierte Benutzer kann AUSSCHLIESSLICH seine eigenen Daten verwalten
DROP POLICY IF EXISTS "Benutzer können nur ihre eigenen OrbitSuite-Daten lesen" ON public.orbit_sync;
CREATE POLICY "Benutzer können nur ihre eigenen OrbitSuite-Daten lesen" 
    ON public.orbit_sync FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Benutzer können ihre eigenen OrbitSuite-Daten erstellen" ON public.orbit_sync;
CREATE POLICY "Benutzer können ihre eigenen OrbitSuite-Daten erstellen" 
    ON public.orbit_sync FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Benutzer können ihre eigenen OrbitSuite-Daten aktualisieren" ON public.orbit_sync;
CREATE POLICY "Benutzer können ihre eigenen OrbitSuite-Daten aktualisieren" 
    ON public.orbit_sync FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Benutzer können ihre eigenen OrbitSuite-Daten löschen" ON public.orbit_sync;
CREATE POLICY "Benutzer können ihre eigenen OrbitSuite-Daten löschen" 
    ON public.orbit_sync FOR DELETE 
    USING (auth.uid() = user_id);

-- 4. Realtime aktivieren (für sofortige Live-Synchronisation zwischen PC & Smartphone)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orbit_sync;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
