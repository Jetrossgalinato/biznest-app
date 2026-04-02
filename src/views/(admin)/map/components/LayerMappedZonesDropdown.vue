<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronRight, Pencil, Trash2 } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TypographyMuted, TypographySmall } from '@/components/typography'
import type { MappedZone } from '@/types/zoning.types'

const props = withDefaults(
  defineProps<{
    layerId: string
    mappedZones?: MappedZone[]
    isSubmitting?: boolean
  }>(),
  {
    mappedZones: () => [],
    isSubmitting: false,
  },
)

const emit = defineEmits<{
  (e: 'update-mapped-zone', zoneId: string): void
  (e: 'delete-mapped-zone', zoneId: string): void
  (e: 'select-mapped-zone', zoneId: string): void
}>()

const isExpanded = ref(false)

const zones = computed(() => {
  return props.mappedZones.filter((zone) => zone.zoning_layer_id === props.layerId)
})

function toggleExpanded(): void {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div>
    <button
      type="button"
      class="mt-2 flex w-full items-center gap-2 rounded-md border px-2 py-1 text-left"
      @click="toggleExpanded"
    >
      <TypographySmall as="span" class="text-xs font-medium">Mapped Zones</TypographySmall>
      <Badge variant="secondary" class="ml-auto">
        {{ zones.length }}
      </Badge>
      <ChevronRight
        class="h-3.5 w-3.5 transition-transform"
        :class="isExpanded ? 'rotate-90' : ''"
      />
    </button>

    <div v-if="isExpanded" class="mt-2 space-y-1">
      <div
        v-for="zone in zones"
        :key="zone.id"
        class="cursor-pointer rounded-md border p-2 transition-colors hover:bg-muted/50"
        @click="emit('select-mapped-zone', zone.id)"
      >
        <div class="flex items-center gap-1">
          <TypographySmall as="span" class="flex-1 truncate text-xs font-medium">{{ zone.name }}</TypographySmall>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Update mapped zone"
            :disabled="isSubmitting"
            @click.stop="emit('update-mapped-zone', zone.id)"
          >
            <Pencil class="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Delete mapped zone"
            :disabled="isSubmitting"
            @click.stop="emit('delete-mapped-zone', zone.id)"
          >
            <Trash2 class="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
        <TypographyMuted
          v-if="zone.description"
          as="p"
          class="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground"
        >
          {{ zone.description }}
        </TypographyMuted>
      </div>

      <TypographyMuted
        v-if="zones.length === 0"
        as="p"
        class="text-[11px] text-muted-foreground"
      >
        No mapped zones under this layer yet.
      </TypographyMuted>
    </div>
  </div>
</template>
