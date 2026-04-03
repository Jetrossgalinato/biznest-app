<script setup lang="ts">
import { computed, ref } from 'vue'
import ActionButtons from '@/views/(admin)/users/components/ActionButtons.vue'
import Header from '@/views/(admin)/users/components/UsersHeader.vue'
import UsersTable from '@/views/(admin)/users/components/UsersTable.vue'
import type { UserRoleFilter, UserRow } from '@/views/(admin)/users/types/users-table.types'

const rows = ref<UserRow[]>([])
const searchQuery = ref('')
const roleFilter = ref<UserRoleFilter>('all')

const normalizeText = (value: string): string => value.trim().toLowerCase()

const filteredRows = computed<UserRow[]>(() => {
  const normalizedQuery = normalizeText(searchQuery.value)

  return rows.value.filter((row) => {
    const normalizedRole = normalizeText(row.role)

    const matchesRole = roleFilter.value === 'all' || normalizedRole === roleFilter.value

    const matchesQuery =
      !normalizedQuery ||
      normalizeText(row.id).includes(normalizedQuery) ||
      normalizeText(row.fullName).includes(normalizedQuery) ||
      normalizeText(row.email).includes(normalizedQuery)

    return matchesRole && matchesQuery
  })
})

const totalUsersCount = computed(
  () => rows.value.filter((row) => normalizeText(row.role) === 'user').length,
)
const adminCount = computed(
  () => rows.value.filter((row) => normalizeText(row.role) === 'admin').length,
)
const superadminCount = computed(
  () => rows.value.filter((row) => normalizeText(row.role) === 'superadmin').length,
)
</script>

<template>
  <section class="w-full space-y-5">
    <Header
      v-model:search-query="searchQuery"
      v-model:role-filter="roleFilter"
      :total-users-count="totalUsersCount"
      :admin-count="adminCount"
      :superadmin-count="superadminCount"
    >
      <template #actions>
        <ActionButtons />
      </template>
    </Header>

    <UsersTable :rows="filteredRows" />
  </section>
</template>

<style scoped></style>
