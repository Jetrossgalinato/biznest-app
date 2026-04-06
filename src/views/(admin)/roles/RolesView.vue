<script setup lang="ts">
import { computed, ref } from 'vue'
import RolesHeader from '@/views/(admin)/roles/components/RolesHeader.vue'
import RolesButtons from '@/views/(admin)/roles/components/RolesButtons.vue'
import RolesModal from '@/views/(admin)/roles/components/RolesModal.vue'
import RolesCards from '@/views/(admin)/roles/components/RolesCards.vue'
import type { RoleRow } from '@/views/(admin)/roles/types/roles.types'
import { getRoleCounts, filterRoleRows } from '@/views/(admin)/roles/utils/roles.utils'

const searchQuery = ref('')
const addRoleModalOpen = ref(false)

const rows = ref<RoleRow[]>([
  {
    id: 'role-1',
    name: 'Superadmin',
    description: 'Full platform control and all administrative permissions.',
    status: 'active',
    isSystem: true,
  },
  {
    id: 'role-2',
    name: 'Admin',
    description: 'Can manage users, reports, and operational settings.',
    status: 'active',
    isSystem: true,
  },
  {
    id: 'role-3',
    name: 'Reviewer',
    description: 'Reviews submissions and moderates role-based workflows.',
    status: 'active',
    isSystem: false,
  },
  {
    id: 'role-4',
    name: 'Assistant',
    description: 'Supports daily operations with limited scoped permissions.',
    status: 'inactive',
    isSystem: false,
  },
])

const roleCounts = computed(() => getRoleCounts(rows.value))

const filteredRows = computed<RoleRow[]>(() => filterRoleRows(rows.value, searchQuery.value))

const openAddRoleModal = (): void => {
  addRoleModalOpen.value = true
}

const refreshRoles = (): void => {
  rows.value = [...rows.value]
}
</script>

<template>
  <section class="w-full space-y-5">
    <RolesHeader
      v-model:search-query="searchQuery"
      :total-roles-count="roleCounts.total"
      :active-roles-count="roleCounts.active"
      :system-roles-count="roleCounts.system"
    >
      <template #actions>
        <RolesButtons @add-role="openAddRoleModal" @refresh="refreshRoles" />
      </template>
    </RolesHeader>

    <RolesCards :roles="filteredRows" />

    <RolesModal v-model:isOpen="addRoleModalOpen" />
  </section>
</template>
