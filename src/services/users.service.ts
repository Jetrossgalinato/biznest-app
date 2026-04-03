import type { UserRow, UserStatus } from '@/views/(admin)/users/types/users-table.types'
import { getSupabaseClient } from '@/services/supabase.client'

type GenericDbRow = Record<string, unknown>

const PROFILE_TABLE = 'profiles'
const GET_ALL_USERS_RPC = 'get_all_users'

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Unable to fetch users right now. Please try again.'
}

const asRecord = (value: unknown): GenericDbRow => {
  if (typeof value === 'object' && value !== null) {
    return value as GenericDbRow
  }

  return {}
}

const getText = (row: GenericDbRow, keys: string[]): string => {
  for (const key of keys) {
    const value = row[key]

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }

  return ''
}

const getFlag = (row: GenericDbRow, keys: string[]): boolean | null => {
  for (const key of keys) {
    const value = row[key]

    if (typeof value === 'boolean') {
      return value
    }
  }

  return null
}

const normalizeRole = (value: string): string => {
  const normalized = value.toLowerCase()

  if (normalized === 'superadmin') {
    return 'superadmin'
  }

  if (normalized === 'admin') {
    return 'admin'
  }

  return 'user'
}

const normalizeStatus = (row: GenericDbRow): UserStatus => {
  const explicitStatus = getText(row, ['status'])

  if (explicitStatus) {
    const normalized = explicitStatus.toLowerCase()

    if (normalized === 'active') {
      return 'Active'
    }

    if (normalized === 'suspended') {
      return 'Suspended'
    }

    if (normalized === 'pending') {
      return 'Pending'
    }
  }

  const isSuspended = getFlag(row, ['is_suspended'])
  if (isSuspended) {
    return 'Suspended'
  }

  const isActive = getFlag(row, ['is_active'])
  if (isActive === false) {
    return 'Pending'
  }

  const emailConfirmedAt = getText(row, ['email_confirmed_at'])
  if (!emailConfirmedAt) {
    return 'Pending'
  }

  return 'Active'
}

const toUserRow = (input: unknown): UserRow | null => {
  const row = asRecord(input)

  const id = getText(row, ['id', 'user_id'])
  if (!id) {
    return null
  }

  const fullName = getText(row, ['full_name', 'fullname', 'username', 'name']) || 'Unknown User'
  const email = getText(row, ['email']) || 'No email'
  const role = normalizeRole(getText(row, ['role']) || 'user')
  const status = normalizeStatus(row)

  return {
    id,
    fullName,
    email,
    role,
    status,
  }
}

const mapRows = (rows: unknown[] | null): UserRow[] => {
  if (!rows) {
    return []
  }

  return rows.map(toUserRow).filter((row): row is UserRow => row !== null)
}

const shouldFallbackFromRpc = (error: { code?: string; message?: string } | null): boolean => {
  if (!error) {
    return false
  }

  const message = (error.message ?? '').toLowerCase()
  return error.code === '42883' || message.includes(GET_ALL_USERS_RPC)
}

export const fetchAllUsers = async (): Promise<UserRow[]> => {
  const supabase = getSupabaseClient()

  const { data: rpcData, error: rpcError } = await supabase.rpc(GET_ALL_USERS_RPC)

  if (!rpcError) {
    return mapRows(Array.isArray(rpcData) ? rpcData : null)
  }

  if (!shouldFallbackFromRpc(rpcError)) {
    throw new Error(getErrorMessage(rpcError))
  }

  const { data: profilesData, error: profilesError } = await supabase
    .from(PROFILE_TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (profilesError) {
    throw new Error(getErrorMessage(profilesError))
  }

  return mapRows(Array.isArray(profilesData) ? profilesData : null)
}
