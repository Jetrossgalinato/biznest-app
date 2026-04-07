export type RoleStatus = 'active' | 'inactive'

export interface RoleRow {
  id: string
  title: string
  description: string
}

export interface CreateRolePayload {
  title: string
  description: string
}

export interface RolePage {
  id: string
  pages: string
  role_id: string
}

export interface RoleCounts {
  total: number
  active: number
  system: number
}
