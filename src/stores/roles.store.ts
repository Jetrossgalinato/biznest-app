import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchRoles, createRole, deleteRole } from '@/services/roles.service'
import type { RoleRow, CreateRolePayload } from '@/views/(admin)/roles/types/roles.types'
import { useAlertContext } from '@/composables/useAlert'

export const useRolesStore = defineStore('roles', () => {
  const roles = ref<RoleRow[]>([])
  const isLoading = ref(false)

  const getErrorMessage = (error: unknown): string => {
    return error instanceof Error ? error.message : 'An error occurred'
  }

  const getAlert = () => {
    try {
      return useAlertContext()
    } catch {
      return null
    }
  }

  const loadRoles = async () => {
    isLoading.value = true
    try {
      roles.value = await fetchRoles()
    } catch (error: unknown) {
      getAlert()?.showAlert({
        title: 'Error loading roles',
        description: getErrorMessage(error),
        tone: 'destructive',
      })
    } finally {
      isLoading.value = false
    }
  }

  const addRole = async (payload: CreateRolePayload) => {
    isLoading.value = true
    try {
      const newRole = await createRole(payload)
      roles.value.push(newRole)
      getAlert()?.showAlert({
        title: 'Success',
        description: 'Role created successfully',
        tone: 'success',
      })
      return newRole
    } catch (error: unknown) {
      getAlert()?.showAlert({
        title: 'Error creating role',
        description: getErrorMessage(error),
        tone: 'destructive',
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const removeRole = async (id: string) => {
    isLoading.value = true
    try {
      await deleteRole(id)
      roles.value = roles.value.filter((role) => role.id !== id)
      getAlert()?.showAlert({
        title: 'Success',
        description: 'Role deleted successfully',
        tone: 'success',
      })
    } catch (error: unknown) {
      getAlert()?.showAlert({
        title: 'Error deleting role',
        description: getErrorMessage(error),
        tone: 'destructive',
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    roles,
    isLoading,
    loadRoles,
    addRole,
    removeRole,
  }
})
