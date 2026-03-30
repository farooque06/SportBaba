-- SportBaba Core Schema (PostgreSQL/Supabase)

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 1. FACILITIES (TENANTS)
-- Each organization/facility in the SaaS.
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    sport_type TEXT CHECK (sport_type IN ('football', 'cricket', 'both')),
    config JSONB DEFAULT '{}'::jsonb, -- Store theme colors, business hours, etc.
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PROFILES
-- Global user accounts (linked to Clerk user_id).
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. MEMBERSHIPS
-- Multi-tenancy link between Users and Facilities with roles.
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('owner', 'manager', 'staff', 'player')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(profile_id, facility_id)
);

-- 4. COURTS / PITCHES / NETS
CREATE TABLE resource_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Pitch A", "Net 1"
    unit_type TEXT NOT NULL, -- "pitch", "net"
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. BOOKINGS
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resource_units(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    total_price DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraint to prevent double booking on the same pitch
    EXCLUDE USING gist (
        resource_id WITH =,
        tstzrange(start_time, end_time) WITH &&
    )
);

-- 6. TOURNAMENTS
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sport_type TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    config JSONB DEFAULT '{}'::jsonb, -- Tournament format, points system
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) on everything
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
