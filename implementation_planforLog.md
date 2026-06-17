# Activity Logging System for SportBaba

A comprehensive logging system to track who did what, when, and where — at both the **Superadmin** (platform) level and the **Facility Admin** (hub) level.

## Database Design

### Supabase Table: `activity_logs`

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `created_at` | timestamptz | When the action happened |
| `actor_id` | uuid (FK → profiles) | Who performed the action |
| `actor_email` | text | Email snapshot (for quick display) |
| `actor_role` | text | Role at time of action (`superadmin`, `owner`, `manager`, `staff`) |
| `facility_id` | uuid (FK → facilities, nullable) | Which facility it relates to (null = platform-level) |
| `category` | text | Event category (see below) |
| `action` | text | What happened (e.g. `booking.created`, `member.invited`) |
| `description` | text | Human-readable summary |
| `metadata` | jsonb | Extra context (booking ID, old/new values, etc.) |
| `ip_address` | text (nullable) | IP address if available |
| `severity` | text | `info`, `warning`, `critical` |

---

## What to Log

### 🔴 Superadmin Level (Platform-wide — shown at `/admin/logs`)

These are actions only the superadmin performs, affecting the entire platform:

| Category | Action | Severity | Description |
|---|---|---|---|
| **auth** | `superadmin.login` | info | Superadmin logged into admin panel |
| **auth** | `superadmin.impersonate` | warning | Superadmin entered a client's dashboard |
| **auth** | `superadmin.stop_impersonate` | info | Superadmin left impersonation mode |
| **facility** | `facility.approved` | info | Approved a new facility registration |
| **facility** | `facility.suspended` | critical | Suspended a facility's access |
| **facility** | `facility.reactivated` | warning | Reactivated a suspended facility |
| **facility** | `facility.deleted` | critical | Deleted a facility |
| **subscription** | `subscription.plan_changed` | warning | Changed a facility's plan/pricing |
| **subscription** | `subscription.trial_extended` | info | Extended a facility's trial period |
| **subscription** | `subscription.cancelled` | critical | Cancelled a facility's subscription |
| **security** | `2fa.setup` | info | Superadmin enabled 2FA |
| **security** | `2fa.disabled` | warning | Superadmin disabled 2FA |
| **platform** | `settings.updated` | warning | Changed platform-level settings |
| **platform** | `email.broadcast` | info | Sent an email to all/some clients |

### 🟢 Facility Admin Level (Hub-specific — shown at `/dashboard/logs`)

These are actions performed by owners, managers, and staff within a facility:

| Category | Action | Severity | Description |
|---|---|---|---|
| **auth** | `user.login` | info | User logged into the dashboard |
| **auth** | `user.logout` | info | User logged out |
| **auth** | `user.login_failed` | warning | Failed login attempt |
| **booking** | `booking.created` | info | New match/slot booked |
| **booking** | `booking.cancelled` | warning | A booking was cancelled |
| **booking** | `booking.updated` | info | Booking details modified (time, court) |
| **booking** | `booking.completed` | info | Match marked as finished |
| **resource** | `resource.created` | info | New turf/court/resource added |
| **resource** | `resource.updated` | info | Resource settings changed |
| **resource** | `resource.deleted` | warning | Resource removed |
| **member** | `member.invited` | info | Staff/manager invitation sent |
| **member** | `member.role_changed` | warning | Staff member's role was updated |
| **member** | `member.removed` | warning | Team member removed from hub |
| **customer** | `customer.created` | info | New walk-in customer registered |
| **customer** | `customer.updated` | info | Customer details modified |
| **inventory** | `inventory.added` | info | New inventory item added |
| **inventory** | `inventory.updated` | info | Stock count or price changed |
| **inventory** | `inventory.low_stock` | warning | Item went below threshold (auto-logged) |
| **tournament** | `tournament.created` | info | New tournament created |
| **tournament** | `tournament.updated` | info | Tournament details changed |
| **settings** | `settings.updated` | info | Hub settings changed (name, colors, etc.) |
| **billing** | `payment.received` | info | Payment processed |

---

## Implementation Plan

### 1. Supabase Migration

Create the `activity_logs` table with proper indexes on `facility_id`, `actor_id`, `category`, `created_at`.

### 2. Server Action: `lib/actions/logs.ts`

#### [NEW] [logs.ts](file:///d:/farooque/projects/SportBaba/lib/actions/logs.ts)

A reusable `logActivity()` helper that all other server actions can call:

```typescript
export async function logActivity({
  action,        // e.g. "booking.created"
  category,      // e.g. "booking"
  description,   // e.g. "Booked Court 1 at 3:00 PM"
  severity?,     // defaults to "info"
  facilityId?,   // null for platform-level
  metadata?,     // any extra JSON context
})
```

And query functions:
- `getActivityLogs(facilityId, filters)` — for facility admin dashboard
- `getPlatformLogs(filters)` — for superadmin panel

### 3. Facility Admin UI: `/dashboard/logs`

#### [NEW] [page.tsx](file:///d:/farooque/projects/SportBaba/app/dashboard/logs/page.tsx)

A beautiful activity timeline page with:
- Filterable by **category** (auth, booking, member, etc.)
- Filterable by **severity** (info, warning, critical)
- Filterable by **date range**
- Searchable by description
- Each log entry shows: icon, timestamp, who, what, severity badge
- Restricted to **Owner** and **Manager** roles

### 4. Superadmin UI: `/admin/logs`

#### [NEW] [page.tsx](file:///d:/farooque/projects/SportBaba/app/admin/logs/page.tsx)

A platform-wide audit log with:
- All platform-level actions (approvals, suspensions, impersonations)
- Ability to filter by **facility** to see a specific client's logs
- Critical severity items highlighted in red
- Export to CSV option

### 5. Integrate Logging into Existing Actions

Sprinkle `logActivity()` calls into existing server actions:

| File | Actions to Log |
|---|---|
| [auth.ts](file:///d:/farooque/projects/SportBaba/lib/actions/auth.ts) | Login, logout, failed login, 2FA events |
| [booking.ts](file:///d:/farooque/projects/SportBaba/lib/actions/booking.ts) | Create, cancel, update, complete bookings |
| [members.ts](file:///d:/farooque/projects/SportBaba/lib/actions/members.ts) | Invite, remove, change role |
| [resources.ts](file:///d:/farooque/projects/SportBaba/lib/actions/resources.ts) | Create, update, delete resources |
| [facility.ts](file:///d:/farooque/projects/SportBaba/lib/actions/facility.ts) | Register, update settings |
| [admin.ts](file:///d:/farooque/projects/SportBaba/lib/actions/admin.ts) | Approve, suspend, impersonate |
| [inventory.ts](file:///d:/farooque/projects/SportBaba/lib/actions/inventory.ts) | Add, update stock |
| [customers.ts](file:///d:/farooque/projects/SportBaba/lib/actions/customers.ts) | Create, update customers |
| [tournament.ts](file:///d:/farooque/projects/SportBaba/lib/actions/tournament.ts) | Create, update tournaments |

### 6. Navigation Updates

- Add "Activity Log" to [Sidebar.tsx](file:///d:/farooque/projects/SportBaba/components/layout/Sidebar.tsx) and [MobileNav.tsx](file:///d:/farooque/projects/SportBaba/components/layout/MobileNav.tsx) (Owner/Manager only)
- Add "Audit Log" to the [AdminSidebar](file:///d:/farooque/projects/SportBaba/components/layout/AdminSidebar.tsx)

---

## Open Questions

> [!IMPORTANT]
> **Log Retention**: How long should we keep logs? Options:
> - Forever (simple, grows over time)
> - 90 days (auto-cleanup via Supabase cron)
> - 1 year

> [!IMPORTANT]
> **Real-time vs. Fire-and-forget**: Should logging be:
> - **Fire-and-forget** (non-blocking, logs asynchronously — faster, but could silently fail)
> - **Await** (waits for the log to be saved — slightly slower but guaranteed)
> I recommend **fire-and-forget** so logging never slows down the actual user action.

---

## Verification Plan

### Manual Verification
- Perform a booking → verify it appears in `/dashboard/logs`
- Approve a facility from admin → verify it appears in `/admin/logs`
- Filter by category, severity, and date range
- Check that Staff users cannot access the logs page
