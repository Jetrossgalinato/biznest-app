<script setup lang="ts">
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import type { RoleRow } from '@/views/(admin)/roles/types/roles.types'

defineProps<{
  roles: RoleRow[]
}>()
</script>

<template>
  <div v-if="roles.length === 0" class="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
    <p class="text-sm text-muted-foreground">No roles found for your search.</p>
  </div>

  <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    <Card v-for="role in roles" :key="role.id" class="flex flex-col shadow-sm transition-all hover:shadow-md">
      <CardHeader class="pb-3">
        <div class="flex items-start justify-between gap-4">
          <CardTitle class="text-lg">{{ role.name }}</CardTitle>
          <span
            class="inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize"
            :class="
              role.status === 'active'
                ? 'border-green-500/30 bg-green-500/10 text-green-700'
                : 'border-muted-foreground/30 bg-muted text-muted-foreground'
            "
          >
            {{ role.status }}
          </span>
        </div>
        <CardDescription class="mt-1.5 line-clamp-2">
          {{ role.description }}
        </CardDescription>
      </CardHeader>
      <CardContent class="mt-auto pb-5">
        <div v-if="role.isSystem" class="inline-flex items-center rounded-md bg-secondary/60 px-2 py-1 text-xs font-medium text-secondary-foreground">
          System Role
        </div>
        <div v-else class="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
          Custom Role
        </div>
      </CardContent>
    </Card>
  </div>
</template>
