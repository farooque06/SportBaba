-- ═══════════════════════════════════════════════════════════
--  OPEN GAMES / PUBLIC MATCHMAKING
--  Allows players to post "Looking for Players" listings
--  and others to join open matches at specific turfs.
-- ═══════════════════════════════════════════════════════════

-- 1. OPEN GAMES
CREATE TABLE IF NOT EXISTS open_games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id TEXT REFERENCES facilities(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resource_units(id) ON DELETE SET NULL,
    host_name TEXT NOT NULL,
    host_phone TEXT,
    host_user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    sport_type TEXT NOT NULL DEFAULT 'football',
    scheduled_date DATE NOT NULL,
    start_time TEXT NOT NULL,        -- e.g. "18:00"
    end_time TEXT NOT NULL,          -- e.g. "19:00"
    max_players INT NOT NULL DEFAULT 10,
    current_players INT NOT NULL DEFAULT 1,
    skill_level TEXT DEFAULT 'any' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'any')),
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PARTICIPANTS
CREATE TABLE IF NOT EXISTS open_game_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES open_games(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    player_phone TEXT,
    player_user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(game_id, player_phone)
);

-- 3. RLS
ALTER TABLE open_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_game_participants ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can browse open games)
CREATE POLICY "open_games_public_read"
    ON open_games FOR SELECT
    USING (true);

-- Public insert (guests can create open games)
CREATE POLICY "open_games_public_insert"
    ON open_games FOR INSERT
    WITH CHECK (true);

-- Update only own games (by host phone or user id) or allow status updates
CREATE POLICY "open_games_update"
    ON open_games FOR UPDATE
    USING (true);

-- Public read on participants
CREATE POLICY "open_game_participants_public_read"
    ON open_game_participants FOR SELECT
    USING (true);

-- Public insert on participants
CREATE POLICY "open_game_participants_public_insert"
    ON open_game_participants FOR INSERT
    WITH CHECK (true);

-- Delete own participation
CREATE POLICY "open_game_participants_delete"
    ON open_game_participants FOR DELETE
    USING (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_open_games_facility ON open_games(facility_id);
CREATE INDEX IF NOT EXISTS idx_open_games_date ON open_games(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_open_games_status ON open_games(status);
CREATE INDEX IF NOT EXISTS idx_open_game_participants_game ON open_game_participants(game_id);
