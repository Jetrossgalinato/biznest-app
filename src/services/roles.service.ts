import type { CreateRolePayload, RoleRow, RolePage } from '@/views/(admin)/roles/types/roles.types'
import { getSupabaseClient } from '@/services/supabase.client'

const ROLES_TABLE = 'roles'
const ROLE_PAGES = 'role_pages'

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

export const fetchRoles = async (): Promise<RoleRow[]> => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from(ROLES_TABLE)
    .select('*')
    .order('title', { ascending: true })

  if (error) {
    throw new Error(getErrorMessage(error, 'Unable to fetch roles right now. Please try again.'))
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
    throw new Error(
      getErrorMessage(error, 'Unable to fetch role pages right now. Please try again.'),
    )
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
    throw new Error(getErrorMessage(error, 'Unable to create role right now. Please try again.'))
  }

  return {
    id: data?.id || '',
    title: data?.title || payload.title,
    description: data?.description || payload.description,
  }
}

export const deleteRole = async (id: string): Promise<void> => {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from(ROLES_TABLE).delete().eq('id', id)

  if (error) {
    throw new Error(getErrorMessage(error, 'Unable to delete role right now. Please try again.'))
  }
}

export const fetchRolePagePaths = async (roleId: string): Promise<string[]> => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from(ROLE_PAGES)
    .select('pages')
    .eq('role_id', roleId)
    .order('pages', { ascending: true })

  if (error) {
    throw new Error(
      getErrorMessage(error, 'Unable to load role permissions right now. Please try again.'),
    )
  }

  if (!data) {
    return []
  }

  return data
    .map((row) => row.pages)
    .filter((page): page is string => typeof page === 'string' && page.length > 0)
}

export const replaceRolePagePaths = async (roleId: string, pagePaths: string[]): Promise<void> => {
  const supabase = getSupabaseClient()

  const uniquePaths = Array.from(new Set(pagePaths))

  const { error: deleteError } = await supabase.from(ROLE_PAGES).delete().eq('role_id', roleId)

  if (deleteError) {
    throw new Error(
      getErrorMessage(deleteError, 'Unable to save role permissions right now. Please try again.'),
    )
  }

  if (uniquePaths.length === 0) {
    return
  }

  const rows = uniquePaths.map((pagePath) => ({
    role_id: roleId,
    pages: pagePath,
  }))

  const { error: insertError } = await supabase.from(ROLE_PAGES).insert(rows)

  if (insertError) {
    throw new Error(
      getErrorMessage(insertError, 'Unable to save role permissions right now. Please try again.'),
    )
  }
}

export const fetchAllowedPagePathsForRoleTitle = async (roleTitle: string): Promise<string[]> => {
  const normalizedRoleTitle = roleTitle.trim()

  if (!normalizedRoleTitle) {
    return []
  }

  const supabase = getSupabaseClient()

  const { data: roleData, error: roleError } = await supabase
    .from(ROLES_TABLE)
    .select('id')
    .ilike('title', normalizedRoleTitle)
    .limit(1)
    .maybeSingle()

  if (roleError) {
    throw new Error(
      getErrorMessage(roleError, 'Unable to resolve role permissions right now. Please try again.'),
    )
  }

  if (!roleData?.id) {
    return []
  }

  return fetchRolePagePaths(roleData.id)
}
