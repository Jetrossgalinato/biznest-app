<script setup lang="ts">
import { computed, type Component } from 'vue'
import type { AdminNavItem, AdminSidebarIconName } from '@/types/admin-sidebar.types'
import type { PermissionModalProps } from '@/views/(admin)/roles/types/roles.types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  BarChart3,
  Bell,
  FileText,
  LayoutDashboard,
  Map as MapIcon,
  Settings,
  Shield,
  Users,
} from 'lucide-vue-next'
import {
  buildPermissionPageGroups,
  isGroupFullySelected,
  isGroupPartiallySelected,
} from '@/views/(admin)/roles/utils/roles.utils'

const iconMap: Record<AdminSidebarIconName, Component> = {
  dashboard: LayoutDashboard,
  map: MapIcon,
  report: FileText,
  analytics: BarChart3,
  users: Users,
  roles: Shield,
  notifications: Bell,
  settings: Settings,
}

const props = withDefaults(defineProps<PermissionModalProps>(), {
  isLoading: false,
  isSaving: false,
})

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'toggle-permission', pagePath: string, checked: boolean): void
  (e: 'save'): void
}>()

const onOpenChange = (open: boolean): void => {
  emit('update:isOpen', open)
}

const onCheckboxChange = (pagePath: string, event: Event): void => {
  const target = event.target as HTMLInputElement
  emit('toggle-permission', pagePath, target.checked)
}

const onGroupCheckboxChange = (groupItems: AdminNavItem[], event: Event): void => {
  const target = event.target as HTMLInputElement
  const checked = target.checked
  groupItems.forEach((item) => {
    const isChecked = props.selectedPages.includes(item.to)
    if (checked !== isChecked) {
      emit('toggle-permission', item.to, checked)
    }
  })
}

const pageGroups = computed(() => {
  return buildPermissionPageGroups(props.pages)
})
</script>

<template>
  <Dialog :open="props.isOpen" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Role Page Permissions</DialogTitle>
        <DialogDescription>
          Manage page access for
          <span class="font-medium text-foreground">{{ props.role?.title || 'Selected role' }}</span
          >.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-2 max-h-[60vh] overflow-y-auto pr-2">
        <p v-if="props.isLoading" class="text-sm text-muted-foreground">Loading permissions...</p>

        <template v-else>
          <div v-for="group in pageGroups" :key="group.title" class="space-y-3">
            <div class="flex items-center justify-between border-b pb-2">
              <h4 class="text-sm font-semibold text-foreground">{{ group.title }}</h4>
              <label
                class="flex items-center gap-2"
                :class="{
                  'cursor-pointer': group.items.length > 0,
                  'opacity-50 cursor-not-allowed': group.items.length === 0,
                }"
              >
                <span class="text-xs text-muted-foreground">Select All</span>
                <input
                  type="checkbox"
                  class="h-4 w-4"
                  :checked="isGroupFullySelected(group.items, props.selectedPages)"
                  :indeterminate.prop="isGroupPartiallySelected(group.items, props.selectedPages)"
                  :disabled="group.items.length === 0 || props.isLoading || props.isSaving"
                  @change="onGroupCheckboxChange(group.items, $event)"
                />
              </label>
            </div>

            <div class="grid gap-2">
              <div
                v-if="group.items.length === 0"
                class="text-sm text-muted-foreground py-4 text-center border rounded-md border-dashed"
              >
                No pages available yet.
              </div>
              <label
                v-for="page in group.items"
                :key="page.to"
                :for="`permission-${props.role?.id || 'role'}-${page.to}`"
                class="flex items-center justify-between gap-3 rounded-md border px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <component
                    :is="iconMap[page.icon]"
                    v-if="page.icon && iconMap[page.icon]"
                    class="h-4 w-4 text-muted-foreground"
                  />
                  <span class="text-sm font-medium">{{ page.label }}</span>
                </div>
                <input
                  :id="`permission-${props.role?.id || 'role'}-${page.to}`"
                  type="checkbox"
                  class="h-4 w-4"
                  :checked="props.selectedPages.includes(page.to)"
                  :disabled="props.isLoading || props.isSaving"
                  @change="onCheckboxChange(page.to, $event)"
                />
              </label>
            </div>
          </div>
        </template>
      </div>

      <DialogFooter>
        <Button variant="outline" :disabled="props.isSaving" @click="onOpenChange(false)"
          >Cancel</Button
        >
        <Button :disabled="props.isLoading || props.isSaving" @click="emit('save')">
          {{ props.isSaving ? 'Saving...' : 'Save Permissions' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped></style>
