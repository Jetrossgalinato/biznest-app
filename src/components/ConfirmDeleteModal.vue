<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAlertContext } from '@/composables/useAlert'
import { Loader2 } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    title?: string
    description?: string
    itemName?: string
    itemType?: string
    action?: () => Promise<void>
  }>(),
  {
    title: 'Confirm Deletion',
    itemType: 'item',
  },
)

const emit = defineEmits<{
  (e: 'update:isOpen', val: boolean): void
  (e: 'confirm'): void
}>()

const { showAlert } = useAlertContext()
const isLoading = ref(false)

const closeModal = () => {
  if (isLoading.value) return
  emit('update:isOpen', false)
}

const confirmDelete = async () => {
  if (!props.action) {
    emit('confirm')
    return
  }

  try {
    isLoading.value = true
    await props.action()
    emit('update:isOpen', false)
  } catch (error) {
    console.error('Action failed:', error)
    emit('update:isOpen', false)
    showAlert({
      title: 'Action Failed',
      description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      tone: 'destructive',
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Dialog
    :open="props.isOpen"
    @update:open="
      (val) => {
        if (!isLoading) emit('update:isOpen', val)
      }
    "
  >
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle class="text-destructive">{{ props.title }}</DialogTitle>
        <DialogDescription>
          <template v-if="props.description">
            {{ props.description }}
          </template>
          <template v-else>
            Are you sure you want to delete
            <strong class="text-foreground" v-if="props.itemName">{{ props.itemName }}</strong
            ><span v-else>this {{ props.itemType }}</span
            >? This action cannot be undone.
          </template>
        </DialogDescription>
      </DialogHeader>

      <DialogFooter class="mt-4">
        <Button variant="outline" @click="closeModal" :disabled="isLoading">Cancel</Button>
        <Button variant="destructive" @click="confirmDelete" :disabled="isLoading">
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped></style>
