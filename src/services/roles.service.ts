import type { CreateRolePayload, RoleRow, RolePage } from '@/views/(admin)/roles/types/roles.types'
import { getSupabaseClient } from '@/services/supabase.client'

const ROLES_TABLE = 'roles'
const ROLE_PAGES = 'role_pages'

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Unable to fetch roles right now. Please try again.'
}

export const fetchRoles = async (): Promise<RoleRow[]> => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from(ROLES_TABLE)
    .select('*')
    .order('title', { ascending: true })

  if (error) {
    throw new Error(getErrorMessage(error))
  }

  if (!data) {
    return []
  }

  return data.map((row) => ({
    id: row.id || '',
    title: row.title || 'Unknown Role',
    description: row.description || '',
  }))
}

export const fetchPages = async (): Promise<RolePage[]> => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from(ROLE_PAGES)
    .select('*')
    .order('pages', { ascending: true })

  if (error) {
    throw new Error(getErrorMessage(error))
  }

  if (!data) {
    return []
  }

  return data.map((row) => ({
    id: row.id || '',
    pages: row.pages || 'Unknown Page',
    role_id: row.role_id || '',
  }))
}

export const createRole = async (payload: CreateRolePayload): Promise<RoleRow> => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from(ROLES_TABLE)
    .insert({
      title: payload.title,
      description: payload.description,
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(getErrorMessage(error))
  }

  return {
    id: data?.id || '',
    title: data?.title || payload.title,
    description: data?.description || payload.description,
  }
}
