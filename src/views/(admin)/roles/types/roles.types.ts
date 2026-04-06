export type RoleStatus = 'active' | 'inactive'

export interface RoleRow {
  id: string
  name: string
  description: string
  status: RoleStatus
  isSystem: boolean
}

export interface RoleCounts {
  total: number
  active: number
  system: number
}
