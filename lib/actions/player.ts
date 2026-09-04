"use server"

import { supabase } from "@/lib/supabase"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export interface PlayerStats {
  totalMatchesJoined: number
  totalBookings: number
  activeGamesCount: number
}

export interface PlayerDashboardData {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
  stats: PlayerStats
  upcomingMatches: any[]
  recentBookings: any[]
  recommendedGames: any[]
}

export async function getPlayerDashboardData(): Promise<PlayerDashboardData | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  const userId = session.user.id
  const userEmail = session.user.email?.toLowerCase() || ""
  const today = new Date().toISOString().split("T")[0]

  try {
    // 1. Fetch upcoming matches the player is participating in
    const { data: participations } = await supabase
      .from("open_game_participants")
      .select("game_id, joined_at")
      .eq("player_user_id", userId)

    const joinedGameIds = (participations || []).map((p) => p.game_id)

    let upcomingMatches: any[] = []
    if (joinedGameIds.length > 0) {
      const { data: games } = await supabase
        .from("open_games")
        .select(`
          *,
          facility:facilities(id, name, slug, logo_url, sport_type),
          resource:resource_units(id, name, unit_type),
          participants:open_game_participants(id, player_name, player_user_id)
        `)
        .in("id", joinedGameIds)
        .gte("scheduled_date", today)
        .in("status", ["open", "full"])
        .order("scheduled_date", { ascending: true })
        .order("start_time", { ascending: true })
        .limit(10)

      upcomingMatches = games || []
    }

    // Also include games hosted by this user
    const { data: hostedGames } = await supabase
      .from("open_games")
      .select(`
        *,
        facility:facilities(id, name, slug, logo_url, sport_type),
        resource:resource_units(id, name, unit_type),
        participants:open_game_participants(id, player_name, player_user_id)
      `)
      .eq("host_user_id", userId)
      .gte("scheduled_date", today)
      .in("status", ["open", "full"])
      .order("scheduled_date", { ascending: true })
      .limit(10)

    // Merge unique matches
    const allMatchesMap = new Map<string, any>()
    for (const m of [...upcomingMatches, ...(hostedGames || [])]) {
      allMatchesMap.set(m.id, m)
    }
    const mergedUpcomingMatches = Array.from(allMatchesMap.values())

    // 2. Fetch recent bookings associated with this user
    let recentBookings: any[] = []
    const { data: userBookings } = await supabase
      .from("bookings")
      .select(`
        id,
        start_time,
        end_time,
        status,
        total_price,
        paid_amount,
        payment_status,
        created_at,
        facility:facilities(id, name, slug),
        resource:resource_units(name, unit_type)
      `)
      .or(`user_id.eq.${userId},guest_email.eq.${userEmail}`)
      .order("start_time", { ascending: false })
      .limit(10)

    recentBookings = userBookings || []

    // 3. Recommended open community games (games player hasn't joined yet)
    const { data: openGames } = await supabase
      .from("open_games")
      .select(`
        *,
        facility:facilities(id, name, slug, logo_url, sport_type),
        resource:resource_units(id, name, unit_type)
      `)
      .eq("status", "open")
      .gte("scheduled_date", today)
      .order("scheduled_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(6)

    const recommendedGames = (openGames || []).filter(
      (g) => !joinedGameIds.includes(g.id) && g.host_user_id !== userId
    )

    return {
      user: {
        id: userId,
        name: session.user.name || null,
        email: session.user.email || null,
        image: session.user.image || null,
      },
      stats: {
        totalMatchesJoined: (participations || []).length,
        totalBookings: recentBookings.length,
        activeGamesCount: mergedUpcomingMatches.length,
      },
      upcomingMatches: mergedUpcomingMatches,
      recentBookings,
      recommendedGames,
    }
  } catch (err) {
    console.error("getPlayerDashboardData error:", err)
    return null
  }
}

export async function leaveGameAsPlayer(gameId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "You must be signed in to leave this match." }

  try {
    const { error: deleteError } = await supabase
      .from("open_game_participants")
      .delete()
      .eq("game_id", gameId)
      .eq("player_user_id", session.user.id)

    if (deleteError) {
      return { error: deleteError.message }
    }

    // Decrement current_players on open_games
    const { data: game } = await supabase
      .from("open_games")
      .select("current_players, max_players")
      .eq("id", gameId)
      .single()

    if (game) {
      const nextCount = Math.max(1, (game.current_players || 1) - 1)
      await supabase
        .from("open_games")
        .update({
          current_players: nextCount,
          status: "open",
          updated_at: new Date().toISOString(),
        })
        .eq("id", gameId)
    }

    revalidatePath("/player")
    revalidatePath("/open-games")
    return { success: true }
  } catch (err: any) {
    return { error: err.message || "Failed to leave match." }
  }
}

export async function quickJoinGame(gameId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Please log in to join." }

  try {
    // Check if already joined
    const { data: existing } = await supabase
      .from("open_game_participants")
      .select("id")
      .eq("game_id", gameId)
      .eq("player_user_id", session.user.id)
      .maybeSingle()

    if (existing) {
      return { error: "You have already joined this game." }
    }

    // Get current game status
    const { data: game, error: fetchErr } = await supabase
      .from("open_games")
      .select("id, current_players, max_players, status")
      .eq("id", gameId)
      .single()

    if (fetchErr || !game) return { error: "Game not found" }
    if (game.current_players >= game.max_players) {
      return { error: "This game is already full." }
    }

    // Insert participant
    const { error: joinErr } = await supabase.from("open_game_participants").insert({
      game_id: gameId,
      player_name: session.user.name || "Player",
      player_user_id: session.user.id,
      joined_at: new Date().toISOString(),
    })

    if (joinErr) return { error: joinErr.message }

    // Update count
    const nextCount = game.current_players + 1
    await supabase
      .from("open_games")
      .update({
        current_players: nextCount,
        status: nextCount >= game.max_players ? "full" : "open",
        updated_at: new Date().toISOString(),
      })
      .eq("id", gameId)

    revalidatePath("/player")
    revalidatePath("/open-games")
    return { success: true }
  } catch (err: any) {
    return { error: err.message || "Failed to join game" }
  }
}
