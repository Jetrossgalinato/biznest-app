<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-vue-next'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue'
import type { RoleRow } from '@/views/(admin)/roles/types/roles.types'
import { getRoleBadgeVariant } from '@/utils/roles.utils'
import { deleteRole } from '@/services/roles.service'
import { useAlertContext } from '@/composables/useAlert'

defineProps<{
  roles: RoleRow[]
}>()

const emit = defineEmits<{
  (e: 'deleted', id: string): void
}>()

const { showAlert } = useAlertContext()

const isModalOpen = ref(false)
const roleToDelete = ref<RoleRow | null>(null)

const openDeleteModal = (role: RoleRow) => {
  roleToDelete.value = role
  isModalOpen.value = true
}

const handleDeleteAction = async () => {
  if (!roleToDelete.value) return

  await deleteRole(roleToDelete.value.id)
  emit('deleted', roleToDelete.value.id)
  showAlert({
    title: 'Success',
    description: 'Role deleted successfully.',
    tone: 'success',
  })
}
</script>

<template>
  <div
    v-if="roles.length === 0"
    class="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center"
  >
    <p class="text-sm text-muted-foreground">No roles found for your search.</p>
  </div>

  <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    <Card
      v-for="role in roles"
      :key="role.id"
      class="group relative flex flex-col shadow-sm transition-all hover:shadow-md hover:bg-muted/10"
    >
      <CardHeader class="pb-3">
        <div class="flex items-start justify-between gap-4">
          <CardTitle class="text-lg">
            <Badge :variant="getRoleBadgeVariant(role.title)" class="text-sm">{{
              role.title
            }}</Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 text-muted-foreground opacity-100 hover:bg-destructive hover:text-destructive-foreground"
            @click.stop="openDeleteModal(role)"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
        <CardDescription class="mt-1.5 line-clamp-2">
          {{ role.description }}
        </CardDescription>
      </CardHeader>
    </Card>
  </div>

  <ConfirmDeleteModal
    v-model:isOpen="isModalOpen"
    :item-name="roleToDelete?.title"
    item-type="role"
    :action="handleDeleteAction"
  />
</template>
