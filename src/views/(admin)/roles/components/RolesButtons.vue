<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'add-role'): void
}>()

const triggerAddRole = () => {
  emit('add-role')
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-end gap-2">
    <Button variant="default" @click="triggerAddRole">
      <Plus class="size-4" />
      Add Role
    </Button>
  </div>
</template>

<style scoped></style>
