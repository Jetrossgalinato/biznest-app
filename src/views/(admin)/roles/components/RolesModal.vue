<script setup lang="ts">
import { ref } from 'vue'
import { useAlertContext } from '@/composables/useAlert'
import { createRole } from '@/services/roles.service'
import type { RoleRow, RolesModalProps } from '@/views/(admin)/roles/types/roles.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const props = defineProps<RolesModalProps>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'created', role: RoleRow): void
}>()

const roleName = ref('')
const roleDescription = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

const { showSuccess, showAlert } = useAlertContext()

const resetForm = (): void => {
  roleName.value = ''
  roleDescription.value = ''
}

const onOpenChange = (open: boolean): void => {
  if (!open) {
    resetForm()
    errorMessage.value = ''
  }

  emit('update:isOpen', open)
}

const handleCreate = async (): Promise<void> => {
  const title = roleName.value.trim()
  const description = roleDescription.value.trim()

  if (!title) {
    errorMessage.value = 'Role name is required.'
    showAlert({
      title: 'Missing Role Name',
      description: 'Please enter a role name.',
      tone: 'destructive',
    })
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const createdRole = await createRole({ title, description })
    showSuccess('Role created successfully!')
    emit('created', createdRole)
    resetForm()
    emit('update:isOpen', false)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unable to create role right now.'
    errorMessage.value = msg
    showAlert({
      title: 'Failed to Create Role',
      description: msg,
      tone: 'destructive',
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Dialog :open="props.isOpen" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Add Role</DialogTitle>
        <DialogDescription>
          Define a new role and set a clear description for your access policy.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-2">
        <div class="grid gap-2">
          <Label for="role-name">Role Name</Label>
          <Input id="role-name" v-model="roleName" placeholder="e.g. Operations Manager" />
        </div>

        <div class="grid gap-2">
          <Label for="role-description">Description</Label>
          <Input
            id="role-description"
            v-model="roleDescription"
            placeholder="Briefly describe the role responsibility"
          />
        </div>

        <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>
      </div>

      <DialogFooter>
        <Button variant="outline" :disabled="isSubmitting" @click="onOpenChange(false)"
          >Cancel</Button
        >
        <Button :disabled="isSubmitting" @click="handleCreate">
          {{ isSubmitting ? 'Creating...' : 'Create Role' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped></style>
