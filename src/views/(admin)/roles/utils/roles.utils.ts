import type { RoleRow, RoleCounts } from '@/views/(admin)/roles/types/roles.types'
import type {
  PermissionPageGroup,
  RolePermissionsMap,
} from '@/views/(admin)/roles/types/roles.types'
import type { AdminNavItem } from '@/types/admin-sidebar.types'

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

export const getSelectedPagesForRole = (
  rolePermissions: RolePermissionsMap,
  roleId: string | undefined,
): string[] => {
  if (!roleId) {
    return []
  }

  return rolePermissions[roleId] ?? []
}

export const togglePermissionPage = (
  currentPages: string[],
  pagePath: string,
  checked: boolean,
): string[] => {
  const currentPermissions = new Set(currentPages)

  if (checked) {
    currentPermissions.add(pagePath)
  } else {
    currentPermissions.delete(pagePath)
  }

  return Array.from(currentPermissions)
}

export const isGroupFullySelected = (
  groupItems: AdminNavItem[],
  selectedPages: string[],
): boolean => {
  return groupItems.length > 0 && groupItems.every((item) => selectedPages.includes(item.to))
}

export const isGroupPartiallySelected = (
  groupItems: AdminNavItem[],
  selectedPages: string[],
): boolean => {
  const selectedCount = groupItems.filter((item) => selectedPages.includes(item.to)).length
  return selectedCount > 0 && selectedCount < groupItems.length
}

export const buildPermissionPageGroups = (pages: AdminNavItem[]): PermissionPageGroup[] => {
  return [
    {
      title: 'User Pages',
      items: [],
    },
    {
      title: 'Admin Pages',
      items: pages,
    },
  ]
}
