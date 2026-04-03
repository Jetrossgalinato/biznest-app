export type UserStatus = 'Active' | 'Pending' | 'Suspended'

export type UserRoleFilter = 'all' | 'user' | 'admin' | 'superadmin'

export interface UserRow {
  id: string
  fullName: string
  email: string
  role: string
  status: UserStatus
}
