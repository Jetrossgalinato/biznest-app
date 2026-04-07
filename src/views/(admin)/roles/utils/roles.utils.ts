import type { RoleRow, RoleCounts } from '@/views/(admin)/roles/types/roles.types'

export const getRoleCounts = (rows: RoleRow[]): RoleCounts => {
  const total = rows.length
  const active = rows.length // Assuming all are active for now, since status is not in RoleRow
  const system = 0 // Assuming none are system for now

  return { total, active, system }
}

export const filterRoleRows = (rows: RoleRow[], searchQuery: string): RoleRow[] => {
  const normalizedQuery = searchQuery.trim().toLowerCase()

  if (!normalizedQuery) {
    return rows
  }

  return rows.filter((row) => {
    return (
      row.title.toLowerCase().includes(normalizedQuery) ||
      row.description.toLowerCase().includes(normalizedQuery) ||
      row.id.toLowerCase().includes(normalizedQuery)
    )
  })
}
