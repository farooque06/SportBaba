-- Create Tournaments Table
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES facilities(id) NOT NULL,
    name TEXT NOT NULL,
    sport TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming', -- upcoming, active, completed
    format TEXT NOT NULL DEFAULT 'knockout', -- knockout, league, league_knockout
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Tournament Teams Table
CREATE TABLE IF NOT EXISTS tournament_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    contact_person TEXT,
    contact_phone TEXT,
    paid_status TEXT DEFAULT 'pending', -- pending, paid
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tournaments_facility ON tournaments(facility_id);
CREATE INDEX IF NOT EXISTS idx_tournament_teams_tournament ON tournament_teams(tournament_id);
