"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { isAlphabeticName, isValidPhone } from "@/lib/utils"

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
  status?: 'pending' | 'approved' | 'rejected'
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
      participants:open_game_participants(id, player_name, player_phone, player_user_id, status, joined_at)
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
      participants:open_game_participants(id, player_name, player_phone, player_user_id, status, joined_at)
    `)
    .eq('id', gameId)
    .single()

  if (error) return null
  return data as OpenGame
}

// ═══════════════════════════════════════════
//  CREATE: Post a "Looking for Players" game (Logged in only)
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
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in to create an open game." }
  }

  // Strict host name validation (characters only)
  const hostNameTrimmed = data.host_name?.trim() || ""
  if (!isAlphabeticName(hostNameTrimmed)) {
    return { error: "Host name must contain only letters and spaces (min 2 characters)." }
  }

  // Strict phone validation (digits only if provided)
  if (data.host_phone && !isValidPhone(data.host_phone.replace(/\D/g, ''))) {
    return { error: "Contact phone must be a valid 10-digit number." }
  }

  if (!data.facility_id) {
    return { error: "Please select a venue." }
  }
  if (!data.scheduled_date || !data.start_time || !data.end_time) {
    return { error: "Please select date and time." }
  }

  // Max players validation (strict numeric range)
  const maxPlayersNum = Number(data.max_players)
  if (isNaN(maxPlayersNum) || maxPlayersNum < 2 || maxPlayersNum > 30) {
    return { error: "Max players must be a number between 2 and 30." }
  }

  // Filter and sanitize additional players with character validation
  const extraPlayers: string[] = []
  for (const rawName of (data.additional_players || [])) {
    const trimmed = rawName.trim()
    if (!isAlphabeticName(trimmed)) {
      return { error: `Player name "${trimmed}" must contain only letters and spaces.` }
    }
    extraPlayers.push(sanitize(trimmed, 80))
  }

  const totalStartingPlayers = 1 + extraPlayers.length
  if (totalStartingPlayers > maxPlayersNum) {
    return { error: `Starting players (${totalStartingPlayers}) cannot exceed max player limit (${maxPlayersNum}).` }
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

  const initialStatus = totalStartingPlayers >= maxPlayersNum ? 'full' : 'open'

  const insertData = {
    facility_id: data.facility_id,
    resource_id: data.resource_id || null,
    host_name: sanitize(hostNameTrimmed, 80),
    host_phone: data.host_phone ? data.host_phone.replace(/\D/g, '').slice(0, 10) : null,
    host_user_id: session.user.id,
    sport_type: data.sport_type || 'football',
    scheduled_date: data.scheduled_date,
    start_time: data.start_time,
    end_time: data.end_time,
    max_players: maxPlayersNum,
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

  // Add host and initial players to participants
  if (game) {
    const participantsToInsert = [
      {
        game_id: game.id,
        player_name: insertData.host_name,
        player_phone: insertData.host_phone,
        player_user_id: session.user.id,
        status: 'approved',
      },
      ...extraPlayers.map((name) => ({
        game_id: game.id,
        player_name: name,
        player_phone: null,
        player_user_id: null,
        status: 'approved',
      }))
    ]

    await supabase.from('open_game_participants').insert(participantsToInsert)
  }

  revalidatePath("/open-games")
  revalidatePath("/player")
  return { success: true, game }
}

// ═══════════════════════════════════════════
//  JOIN: Player joins an open game
// ═══════════════════════════════════════════
export async function joinOpenGame(gameId: string, player: {
  player_name: string
  player_phone?: string
}) {
  const session = await auth()
  const playerName = player.player_name?.trim() || ""

  // Character-only name validation
  if (!isAlphabeticName(playerName)) {
    return { error: "Player name must contain only letters and spaces (min 2 characters)." }
  }

  // Number-only phone validation if provided
  const cleanPhone = player.player_phone ? player.player_phone.replace(/\D/g, '') : null
  if (cleanPhone && !isValidPhone(cleanPhone)) {
    return { error: "Contact phone must be a valid 10-digit number." }
  }

  // Fetch the game
  const { data: game, error: fetchError } = await supabase
    .from('open_games')
    .select('id, host_user_id, host_phone, max_players, current_players, status')
    .eq('id', gameId)
    .single()

  if (fetchError || !game) return { error: "Game not found." }
  if (game.status !== 'open') return { error: "This game is no longer accepting players." }
  if (game.current_players >= game.max_players) return { error: "This game is already full." }

  // Check if player is already the host
  if (session?.user?.id && game.host_user_id === session.user.id) {
    return { error: "You are already the host of this game." }
  }

  // Check if already joined (by user ID or phone)
  if (session?.user?.id) {
    const { data: existingUser } = await supabase
      .from('open_game_participants')
      .select('id')
      .eq('game_id', gameId)
      .eq('player_user_id', session.user.id)
      .maybeSingle()

    if (existingUser) return { error: "You have already joined this game." }
  }

  if (cleanPhone) {
    const { data: existingPhone } = await supabase
      .from('open_game_participants')
      .select('id')
      .eq('game_id', gameId)
      .eq('player_phone', cleanPhone)
      .maybeSingle()

    if (existingPhone) return { error: "You have already joined this game." }
  }

  // Insert participant as approved (or pending join)
  const { error: joinError } = await supabase
    .from('open_game_participants')
    .insert({
      game_id: gameId,
      player_name: sanitize(playerName, 80),
      player_phone: cleanPhone,
      player_user_id: session?.user?.id || null,
      status: 'approved',
    })

  if (joinError) return { error: joinError.message }

  // Update player count
  const newCount = (game.current_players || 0) + 1
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
  revalidatePath("/player")
  return { success: true, current_players: newCount, status: newStatus }
}

// ═══════════════════════════════════════════
//  HOST MANAGEMENT: Verify Host Authorization
// ═══════════════════════════════════════════
async function verifyGameHost(gameId: string, hostPhoneVerify?: string): Promise<{ isHost: boolean; game: any; error?: string }> {
  const session = await auth()
  const { data: game, error } = await supabase
    .from('open_games')
    .select('*, participants:open_game_participants(*)')
    .eq('id', gameId)
    .single()

  if (error || !game) return { isHost: false, game: null, error: "Game not found." }

  // Check by logged-in user id or verified host phone
  const isHost = (session?.user?.id && game.host_user_id === session.user.id) ||
    (hostPhoneVerify && game.host_phone === hostPhoneVerify.replace(/\D/g, ''))

  if (!isHost) {
    return { isHost: false, game, error: "Only the host can manage players in this match." }
  }

  return { isHost: true, game }
}

// ═══════════════════════════════════════════
//  HOST: Approve Pending Participant
// ═══════════════════════════════════════════
export async function approveParticipant(gameId: string, participantId: string, hostPhoneVerify?: string) {
  const { isHost, game, error: authError } = await verifyGameHost(gameId, hostPhoneVerify)
  if (!isHost || !game) return { error: authError || "Unauthorized" }

  const participant = game.participants?.find((p: any) => p.id === participantId)
  if (!participant) return { error: "Player request not found." }

  if (participant.status === 'approved') {
    return { success: true, message: "Player already approved." }
  }

  if (game.current_players >= game.max_players) {
    return { error: "Match is already at maximum capacity." }
  }

  // Mark as approved
  const { error: updateError } = await supabase
    .from('open_game_participants')
    .update({ status: 'approved' })
    .eq('id', participantId)

  if (updateError) return { error: updateError.message }

  // Increment current players
  const nextCount = game.current_players + 1
  await supabase
    .from('open_games')
    .update({
      current_players: nextCount,
      status: nextCount >= game.max_players ? 'full' : 'open',
      updated_at: new Date().toISOString(),
    })
    .eq('id', gameId)

  revalidatePath("/open-games")
  revalidatePath("/player")
  return { success: true }
}

// ═══════════════════════════════════════════
//  HOST: Remove / Reject Participant
// ═══════════════════════════════════════════
export async function removeParticipant(gameId: string, participantId: string, hostPhoneVerify?: string) {
  const { isHost, game, error: authError } = await verifyGameHost(gameId, hostPhoneVerify)
  if (!isHost || !game) return { error: authError || "Unauthorized" }

  const participant = game.participants?.find((p: any) => p.id === participantId)
  if (!participant) return { error: "Player not found." }

  // Prevent host from removing themselves
  if (game.host_user_id && participant.player_user_id === game.host_user_id) {
    return { error: "Host cannot be removed from the game. You can cancel the game instead." }
  }

  // Delete participant
  const { error: deleteError } = await supabase
    .from('open_game_participants')
    .delete()
    .eq('id', participantId)

  if (deleteError) return { error: deleteError.message }

  // Decrement current player count if was approved
  const wasApproved = participant.status !== 'rejected' && participant.status !== 'pending'
  const newCount = wasApproved ? Math.max(1, game.current_players - 1) : game.current_players

  await supabase
    .from('open_games')
    .update({
      current_players: newCount,
      status: 'open',
      updated_at: new Date().toISOString(),
    })
    .eq('id', gameId)

  revalidatePath("/open-games")
  revalidatePath("/player")
  return { success: true }
}

// ═══════════════════════════════════════════
//  HOST: Update Game Status (Cancel / Complete)
// ═══════════════════════════════════════════
export async function updateGameStatus(
  gameId: string, 
  status: 'open' | 'full' | 'cancelled' | 'completed',
  hostPhoneVerify?: string
) {
  const { isHost, error: authError } = await verifyGameHost(gameId, hostPhoneVerify)
  if (!isHost) return { error: authError || "Unauthorized" }

  const { error } = await supabase
    .from('open_games')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', gameId)

  if (error) return { error: error.message }

  revalidatePath("/open-games")
  revalidatePath("/player")
  return { success: true }
}

// ═══════════════════════════════════════════
//  LEAVE: Player leaves an open game
// ═══════════════════════════════════════════
export async function leaveOpenGame(gameId: string, playerPhone?: string) {
  const session = await auth()
  const userId = session?.user?.id
  const cleanPhone = playerPhone ? playerPhone.replace(/\D/g, '') : null

  if (!userId && !cleanPhone) {
    return { error: "Phone number or login required to leave." }
  }

  let query = supabase.from('open_game_participants').select('id, status').eq('game_id', gameId)
  if (userId) {
    query = query.eq('player_user_id', userId)
  } else if (cleanPhone) {
    query = query.eq('player_phone', cleanPhone)
  }

  const { data: participant, error: findError } = await query.maybeSingle()

  if (findError || !participant) return { error: "You are not in this game." }

  // Remove participant
  await supabase
    .from('open_game_participants')
    .delete()
    .eq('id', participant.id)

  // Decrement count if approved
  const { data: game } = await supabase
    .from('open_games')
    .select('current_players')
    .eq('id', gameId)
    .single()

  if (game) {
    const newCount = Math.max(1, (game.current_players || 1) - 1)
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
  revalidatePath("/player")
  return { success: true }
}

// ═══════════════════════════════════════════
//  CANCEL: Host cancels an open game
// ═══════════════════════════════════════════
export async function cancelOpenGame(gameId: string, hostPhone?: string) {
  return updateGameStatus(gameId, 'cancelled', hostPhone)
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
