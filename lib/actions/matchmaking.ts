"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// ─── Types ───
export interface OpenGame {
  id: string
  facility_id: string
  resource_id: string | null
  host_name: string
  host_phone: string | null
  host_user_id: string | null
  sport_type: string
  scheduled_date: string
  start_time: string
  end_time: string
  max_players: number
  current_players: number
  skill_level: string
  notes: string | null
  status: string
  created_at: string
  updated_at: string
  facility?: { id: string; name: string; slug: string; logo_url: string | null; sport_type: string }
  resource?: { id: string; name: string; unit_type: string } | null
  participants?: OpenGameParticipant[]
}

export interface OpenGameParticipant {
  id: string
  game_id: string
  player_name: string
  player_phone: string | null
  player_user_id: string | null
  joined_at: string
}

// ─── Sanitizer ───
function sanitize(str: string, maxLength: number = 100): string {
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'`;]/g, '')
    .trim()
    .slice(0, maxLength)
}

// ═══════════════════════════════════════════
//  FETCH: List open games (public, no auth)
// ═══════════════════════════════════════════
export async function getOpenGames(filters?: {
  facility_id?: string
  sport_type?: string
  date?: string
  status?: string
}) {
  let query = supabase
    .from('open_games')
    .select(`
      *,
      facility:facilities(id, name, slug, logo_url, sport_type),
      resource:resource_units(id, name, unit_type),
      participants:open_game_participants(id, player_name, player_phone, joined_at)
    `)
    .in('status', ['open', 'full'])
    .order('scheduled_date', { ascending: true })
    .order('start_time', { ascending: true })

  if (filters?.facility_id) {
    query = query.eq('facility_id', filters.facility_id)
  }
  if (filters?.sport_type) {
    query = query.eq('sport_type', filters.sport_type)
  }
  if (filters?.date) {
    query = query.eq('scheduled_date', filters.date)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  // Only show games from today onward
  const today = new Date().toISOString().split('T')[0]
  query = query.gte('scheduled_date', today)

  const { data, error } = await query.limit(50)

  if (error) {
    console.error("Error fetching open games:", error)
    return []
  }
  return data as OpenGame[]
}

// ═══════════════════════════════════════════
//  FETCH SINGLE GAME
// ═══════════════════════════════════════════
export async function getOpenGame(gameId: string) {
  const { data, error } = await supabase
    .from('open_games')
    .select(`
      *,
      facility:facilities(id, name, slug, logo_url, sport_type),
      resource:resource_units(id, name, unit_type),
      participants:open_game_participants(id, player_name, player_phone, joined_at)
    `)
    .eq('id', gameId)
    .single()

  if (error) return null
  return data as OpenGame
}

// ═══════════════════════════════════════════
//  CREATE: Post a "Looking for Players" game
// ═══════════════════════════════════════════
export async function createOpenGame(data: {
  facility_id: string
  resource_id?: string
  host_name: string
  host_phone?: string
  sport_type: string
  scheduled_date: string
  start_time: string
  end_time: string
  max_players: number
  skill_level?: string
  notes?: string
  additional_players?: string[] // Optional players host already has
}) {
  // Validation
  if (!data.host_name || data.host_name.trim().length < 2) {
    return { error: "Name must be at least 2 characters." }
  }
  if (!data.facility_id) {
    return { error: "Please select a venue." }
  }
  if (!data.scheduled_date || !data.start_time || !data.end_time) {
    return { error: "Please select date and time." }
  }
  if (data.max_players < 2 || data.max_players > 30) {
    return { error: "Players must be between 2 and 30." }
  }

  // Filter and sanitize additional players
  const extraPlayers = (data.additional_players || [])
    .map(p => sanitize(p, 80))
    .filter(p => p.length >= 2)

  const totalStartingPlayers = 1 + extraPlayers.length
  if (totalStartingPlayers > data.max_players) {
    return { error: `Starting players (${totalStartingPlayers}) cannot exceed max player limit (${data.max_players}).` }
  }

  // Check date is not in the past
  const gameDate = new Date(data.scheduled_date + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (gameDate < today) {
    return { error: "Cannot create a game in the past." }
  }

  // Validate start and end time format
  if (data.start_time >= data.end_time) {
    return { error: "End time must be after start time." }
  }

  const initialStatus = totalStartingPlayers >= data.max_players ? 'full' : 'open'

  const insertData = {
    facility_id: data.facility_id,
    resource_id: data.resource_id || null,
    host_name: sanitize(data.host_name, 80),
    host_phone: data.host_phone ? sanitize(data.host_phone, 20) : null,
    sport_type: data.sport_type || 'football',
    scheduled_date: data.scheduled_date,
    start_time: data.start_time,
    end_time: data.end_time,
    max_players: data.max_players,
    current_players: totalStartingPlayers,
    skill_level: data.skill_level || 'any',
    notes: data.notes ? sanitize(data.notes, 500) : null,
    status: initialStatus,
  }

  const { data: game, error } = await supabase
    .from('open_games')
    .insert(insertData)
    .select()
    .single()

  if (error) return { error: error.message }

  // Add host and any initial players to participants
  if (game) {
    const participantsToInsert = [
      {
        game_id: game.id,
        player_name: insertData.host_name,
        player_phone: insertData.host_phone,
      },
      ...extraPlayers.map((name, idx) => ({
        game_id: game.id,
        player_name: name,
        player_phone: null,
      }))
    ]

    await supabase.from('open_game_participants').insert(participantsToInsert)
  }

  revalidatePath("/open-games")
  return { success: true, game }
}

// ═══════════════════════════════════════════
//  JOIN: Player joins an open game
// ═══════════════════════════════════════════
export async function joinOpenGame(gameId: string, player: {
  player_name: string
  player_phone?: string
}) {
  if (!player.player_name || player.player_name.trim().length < 2) {
    return { error: "Name must be at least 2 characters." }
  }

  // Fetch the game
  const { data: game, error: fetchError } = await supabase
    .from('open_games')
    .select('id, max_players, current_players, status')
    .eq('id', gameId)
    .single()

  if (fetchError || !game) return { error: "Game not found." }
  if (game.status !== 'open') return { error: "This game is no longer accepting players." }
  if (game.current_players >= game.max_players) return { error: "This game is already full." }

  // Check if player already joined (by phone)
  if (player.player_phone) {
    const { data: existing } = await supabase
      .from('open_game_participants')
      .select('id')
      .eq('game_id', gameId)
      .eq('player_phone', player.player_phone)
      .maybeSingle()

    if (existing) return { error: "You have already joined this game." }
  }

  // Add participant
  const { error: joinError } = await supabase
    .from('open_game_participants')
    .insert({
      game_id: gameId,
      player_name: sanitize(player.player_name, 80),
      player_phone: player.player_phone ? sanitize(player.player_phone, 20) : null,
    })

  if (joinError) return { error: joinError.message }

  // Update player count
  const newCount = game.current_players + 1
  const newStatus = newCount >= game.max_players ? 'full' : 'open'

  await supabase
    .from('open_games')
    .update({
      current_players: newCount,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', gameId)

  revalidatePath("/open-games")
  return { success: true, current_players: newCount, status: newStatus }
}

// ═══════════════════════════════════════════
//  LEAVE: Player leaves an open game
// ═══════════════════════════════════════════
export async function leaveOpenGame(gameId: string, playerPhone: string) {
  if (!playerPhone) return { error: "Phone number required to leave." }

  const { data: participant, error: findError } = await supabase
    .from('open_game_participants')
    .select('id')
    .eq('game_id', gameId)
    .eq('player_phone', playerPhone)
    .maybeSingle()

  if (findError || !participant) return { error: "You are not in this game." }

  // Remove participant
  await supabase
    .from('open_game_participants')
    .delete()
    .eq('id', participant.id)

  // Decrement count
  const { data: game } = await supabase
    .from('open_games')
    .select('current_players')
    .eq('id', gameId)
    .single()

  if (game) {
    const newCount = Math.max(0, game.current_players - 1)
    await supabase
      .from('open_games')
      .update({
        current_players: newCount,
        status: 'open',
        updated_at: new Date().toISOString(),
      })
      .eq('id', gameId)
  }

  revalidatePath("/open-games")
  return { success: true }
}

// ═══════════════════════════════════════════
//  CANCEL: Host cancels an open game
// ═══════════════════════════════════════════
export async function cancelOpenGame(gameId: string, hostPhone: string) {
  // Verify the caller is the host
  const { data: game } = await supabase
    .from('open_games')
    .select('host_phone')
    .eq('id', gameId)
    .single()

  if (!game) return { error: "Game not found." }
  if (game.host_phone !== hostPhone) return { error: "Only the host can cancel this game." }

  const { error } = await supabase
    .from('open_games')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', gameId)

  if (error) return { error: error.message }

  revalidatePath("/open-games")
  return { success: true }
}

// ═══════════════════════════════════════════
//  GET FACILITIES (for dropdown in create form)
// ═══════════════════════════════════════════
export async function getMatchmakingFacilities() {
  const { data, error } = await supabase
    .from('facilities')
    .select('id, name, slug, sport_type, logo_url, config')
    .order('name')

  if (error) return []
  return data || []
}

// ═══════════════════════════════════════════
//  GET RESOURCES for a facility (for form)
// ═══════════════════════════════════════════
export async function getMatchmakingResources(facilityId: string) {
  const { data, error } = await supabase
    .from('resource_units')
    .select('id, name, unit_type')
    .eq('facility_id', facilityId)
    .eq('is_active', true)
    .order('name')

  if (error) return []
  return data || []
}
