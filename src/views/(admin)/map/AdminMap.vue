<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Layers, PenTool, TriangleAlert } from 'lucide-vue-next'
import Map from '@/components/map/Map.vue'
import { useBarangayBorders } from '@/composables/map/useBarangayBorders'
import HazardFormModal from '@/views/(admin)/map/components/HazardFormModal.vue'
import AdminMapRightSidebar from '@/views/(admin)/map/components/AdminMapRightSidebar.vue'
import AdminMapHazardSidebar from '@/views/(admin)/map/components/AdminMapHazardSidebar.vue'
import MappedZoneFormModal from '@/views/(admin)/map/components/MappedZoneFormModal.vue'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TypographyMuted, TypographySmall } from '@/components/typography'
import {
  createMappedZone,
  createZoningLayer,
  deleteMappedZone,
  deleteZoningLayer,
  listMyMappedZones,
  listMyZoningLayers,
  setZoningLayerActive,
  updateMappedZone,
  updateZoningLayer,
} from '@/services/zoning/zoning.service'
import {
  createHazard,
  deleteHazard,
  listHazards,
  updateHazard,
} from '@/services/hazard/hazard.service'
import type {
  CreateMappedZoneInput,
  CreateZoningLayerInput,
  MappedZone,
  MapDrawPoint,
  UpdateMappedZoneInput,
  UpdateZoningLayerInput,
  ZoningLayer,
} from '@/types/zoning.types'
import type {
  CreateHazardFormInput,
  Hazard,
  HazardGeometry,
  HazardGeometryType,
  HazardId,
  UpdateHazardInput,
} from '@/types/hazard.types'

const provider = ref<'google' | 'leaflet'>('leaflet')
const showBarangayBorders = ref(false)
const isSidebarOpen = ref(false)
const isHazardSidebarOpen = ref(false)
const isSavingLayer = ref(false)
const isSavingMappedZone = ref(false)
const isDrawMode = ref(false)
const drawPoints = ref<MapDrawPoint[]>([])
const showMappedZoneModal = ref(false)
const selectedMappedZoneId = ref<string | null>(null)
const zoningLayers = ref<ZoningLayer[]>([])
const mappedZones = ref<MappedZone[]>([])
const hazards = ref<Hazard[]>([])
const isLoadingHazards = ref(false)
const isSavingHazard = ref(false)
const hazardError = ref('')
const selectedHazardId = ref<HazardId | null>(null)
const hazardsEnabled = ref(false)
const hasLoadedHazards = ref(false)
const hazardPlacementType = ref<HazardGeometryType | null>(null)
const hazardDrawPoints = ref<MapDrawPoint[]>([])
const showHazardFormModal = ref(false)

const zoningError = ref('')

const isSidebarSubmitting = computed(() => isSavingLayer.value || isSavingMappedZone.value)

const visibleMappedZones = computed(() => {
  const activeLayerIds = new Set(
    zoningLayers.value
      .filter((layer) => layer.is_active)
      .map((layer) => layer.id),
  )

  return mappedZones.value.filter(
    (zone) => zone.is_visible && activeLayerIds.has(zone.zoning_layer_id),
  )
})

const { barangayBorders, isLoading, errorMessage, loadBarangayBorders } = useBarangayBorders()

onMounted(async () => {
  await Promise.all([loadZoningLayers(), loadMappedZones()])
})

async function toggleBarangayBorders() {
  if (!showBarangayBorders.value) {
    await loadBarangayBorders()
  }

  showBarangayBorders.value = !showBarangayBorders.value
}

async function loadZoningLayers(): Promise<void> {
  zoningError.value = ''
  try {
    zoningLayers.value = await listMyZoningLayers()
  } catch (error) {
    zoningError.value = error instanceof Error ? error.message : 'Failed to load zoning layers.'
  }
}

async function loadMappedZones(): Promise<void> {
  zoningError.value = ''
  try {
    mappedZones.value = await listMyMappedZones()
  } catch (error) {
    zoningError.value = error instanceof Error ? error.message : 'Failed to load mapped zones.'
  }
}

async function loadHazards(force = false): Promise<void> {
  if (hasLoadedHazards.value && !force) {
    return
  }

  isLoadingHazards.value = true
  hazardError.value = ''

  try {
    const response = await listHazards({
      page: 1,
      pageSize: 100,
      sortBy: 'created_at',
      sortOrder: 'desc',
    })

    hazards.value = response.data
    hasLoadedHazards.value = true
  } catch (error) {
    hazardError.value = error instanceof Error ? error.message : 'Failed to load hazards.'
  } finally {
    isLoadingHazards.value = false
  }
}

async function ensureHazardsLoaded(): Promise<void> {
  await loadHazards(false)
}

const isHazardPlacementActive = computed(() => hazardPlacementType.value !== null)

const activeDrawPoints = computed(() =>
  isHazardPlacementActive.value ? hazardDrawPoints.value : drawPoints.value,
)

const isAnyDrawModeActive = computed(() => isDrawMode.value || isHazardPlacementActive.value)

function startHazardPlacement(placementType: HazardGeometryType): void {
  if (isDrawMode.value) {
    cancelDrawZoneMode()
  }

  hazardError.value = ''
  hazardPlacementType.value = placementType
  hazardDrawPoints.value = []
  showHazardFormModal.value = false
}

function cancelHazardPlacement(): void {
  hazardPlacementType.value = null
  hazardDrawPoints.value = []
  showHazardFormModal.value = false
}

function appendHazardPoint(point: MapDrawPoint): void {
  if (!hazardPlacementType.value) {
    return
  }

  if (hazardPlacementType.value === 'point') {
    hazardDrawPoints.value = [point]
    showHazardFormModal.value = true
    return
  }

  hazardDrawPoints.value = [...hazardDrawPoints.value, point]
}

function moveHazardPoint(index: number, point: MapDrawPoint): void {
  if (!hazardPlacementType.value || hazardPlacementType.value === 'point') {
    return
  }

  hazardDrawPoints.value = hazardDrawPoints.value.map((existingPoint, existingPointIndex) => {
    if (existingPointIndex !== index) {
      return existingPoint
    }

    return point
  })
}

function undoLastHazardPoint(): void {
  if (!hazardPlacementType.value || hazardDrawPoints.value.length === 0) {
    return
  }

  if (hazardPlacementType.value === 'point') {
    hazardDrawPoints.value = []
    return
  }

  hazardDrawPoints.value = hazardDrawPoints.value.slice(0, -1)
}

function finishHazardPlacement(): void {
  if (!hazardPlacementType.value) {
    return
  }

  if (hazardPlacementType.value === 'linestring' && hazardDrawPoints.value.length < 2) {
    hazardError.value = 'Draw at least 2 points to create a hazard line.'
    return
  }

  if (hazardPlacementType.value === 'polygon' && hazardDrawPoints.value.length < 3) {
    hazardError.value = 'Draw at least 3 points to create a hazard polygon.'
    return
  }

  showHazardFormModal.value = true
}

function buildHazardGeometry(): HazardGeometry | null {
  if (!hazardPlacementType.value || hazardDrawPoints.value.length === 0) {
    return null
  }

  const toCoordinates = (point: MapDrawPoint): [number, number] => [point.lng, point.lat]
  const firstDrawPoint = hazardDrawPoints.value[0]

  if (!firstDrawPoint) {
    return null
  }

  if (hazardPlacementType.value === 'point') {
    return {
      type: 'Point',
      coordinates: toCoordinates(firstDrawPoint),
    }
  }

  if (hazardPlacementType.value === 'linestring') {
    return {
      type: 'LineString',
      coordinates: hazardDrawPoints.value.map(toCoordinates),
    }
  }

  const ring = hazardDrawPoints.value.map(toCoordinates)
  const [firstPoint] = ring
  const lastPoint = ring[ring.length - 1]

  if (
    firstPoint
    && lastPoint
    && (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1])
  ) {
    ring.push(firstPoint)
  }

  return {
    type: 'Polygon',
    coordinates: [ring],
  }
}

async function handleSaveHazard(payload: CreateHazardFormInput): Promise<void> {
  if (!hazardPlacementType.value) {
    hazardError.value = 'Choose a hazard placement type first.'
    return
  }

  const geometry = buildHazardGeometry()
  if (!geometry) {
    hazardError.value = 'Capture a valid geometry on the map first.'
    return
  }

  isSavingHazard.value = true
  hazardError.value = ''

  try {
    const createdHazard = await createHazard({
      ...payload,
      geometry,
      geometry_type: hazardPlacementType.value,
    })

    hazards.value = [createdHazard, ...hazards.value]
    hasLoadedHazards.value = true
    hazardsEnabled.value = true
    selectedHazardId.value = createdHazard.id
    cancelHazardPlacement()
  } catch (error) {
    hazardError.value = error instanceof Error ? error.message : 'Failed to create hazard.'
  } finally {
    isSavingHazard.value = false
  }
}

async function handleCreateLayer(payload: CreateZoningLayerInput): Promise<void> {
  isSavingLayer.value = true
  zoningError.value = ''

  try {
    const createdLayer = await createZoningLayer(payload)
    zoningLayers.value = [createdLayer, ...zoningLayers.value]
  } catch (error) {
    zoningError.value = error instanceof Error ? error.message : 'Failed to save zoning layer.'
  } finally {
    isSavingLayer.value = false
  }
}

async function handleUpdateLayer(payload: {
  layerId: string
  input: UpdateZoningLayerInput
}): Promise<void> {
  isSavingLayer.value = true
  zoningError.value = ''

  try {
    const updatedLayer = await updateZoningLayer(payload.layerId, payload.input)
    zoningLayers.value = zoningLayers.value.map((layer) => {
      if (layer.id !== updatedLayer.id) {
        return layer
      }

      return updatedLayer
    })
  } catch (error) {
    zoningError.value = error instanceof Error ? error.message : 'Failed to update zoning layer.'
  } finally {
    isSavingLayer.value = false
  }
}

async function handleDeleteLayer(layerId: string): Promise<void> {
  isSavingLayer.value = true
  zoningError.value = ''

  try {
    await deleteZoningLayer(layerId)
    zoningLayers.value = zoningLayers.value.filter((layer) => layer.id !== layerId)
  } catch (error) {
    zoningError.value = error instanceof Error ? error.message : 'Failed to delete zoning layer.'
  } finally {
    isSavingLayer.value = false
  }
}

async function handleToggleLayerVisibility(payload: {
  layerId: string
  isActive: boolean
}): Promise<void> {
  isSavingLayer.value = true
  zoningError.value = ''

  try {
    const updatedLayer = await setZoningLayerActive(payload.layerId, payload.isActive)
    zoningLayers.value = zoningLayers.value.map((layer) => {
      if (layer.id !== updatedLayer.id) {
        return layer
      }

      return updatedLayer
    })
  } catch (error) {
    zoningError.value = error instanceof Error ? error.message : 'Failed to toggle layer visibility.'
  } finally {
    isSavingLayer.value = false
  }
}

function startDrawZoneMode(): void {
  if (isHazardPlacementActive.value) {
    cancelHazardPlacement()
  }

  if (zoningLayers.value.length === 0) {
    zoningError.value = 'Please add at least one zoning layer before drawing a zone.'
    return
  }

  zoningError.value = ''
  drawPoints.value = []
  isDrawMode.value = true
}

function handleMapClick(point: MapDrawPoint): void {
  if (isHazardPlacementActive.value) {
    appendHazardPoint(point)

    if (hazardPlacementType.value === 'point') {
      showHazardFormModal.value = true
    }

    return
  }

  if (!isDrawMode.value) {
    return
  }

  drawPoints.value = [...drawPoints.value, point]
}

function handleDrawPointMove(index: number, point: MapDrawPoint): void {
  if (isHazardPlacementActive.value) {
    moveHazardPoint(index, point)
    return
  }

  if (!isDrawMode.value) {
    return
  }

  drawPoints.value = drawPoints.value.map((existingPoint, existingPointIndex) => {
    if (existingPointIndex !== index) {
      return existingPoint
    }

    return point
  })
}

function undoLastDrawPoint(): void {
  if (isHazardPlacementActive.value) {
    undoLastHazardPoint()
    return
  }

  if (!isDrawMode.value || drawPoints.value.length === 0) {
    return
  }

  drawPoints.value = drawPoints.value.slice(0, -1)
}

function handleDrawUndoShortcut(event: KeyboardEvent): void {
  const activePoints = isHazardPlacementActive.value ? hazardDrawPoints.value : drawPoints.value

  if (!isAnyDrawModeActive.value || activePoints.length === 0) {
    return
  }

  if (event.defaultPrevented || event.shiftKey || event.altKey) {
    return
  }

  const isUndoShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z'
  if (!isUndoShortcut) {
    return
  }

  const target = event.target as HTMLElement | null
  const isTypingTarget = target
    && (
      target.tagName === 'INPUT'
      || target.tagName === 'TEXTAREA'
      || target.isContentEditable
    )

  if (isTypingTarget) {
    return
  }

  event.preventDefault()
  undoLastDrawPoint()
}

onMounted(() => {
  window.addEventListener('keydown', handleDrawUndoShortcut)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleDrawUndoShortcut)
})

function cancelDrawZoneMode(): void {
  isDrawMode.value = false
  drawPoints.value = []
  showMappedZoneModal.value = false
}

function finishDrawZoneMode(): void {
  if (drawPoints.value.length < 3) {
    zoningError.value = 'Draw at least 3 points to create a polygon.'
    return
  }

  showMappedZoneModal.value = true
}

function handleHazardPlacementCancel(): void {
  cancelHazardPlacement()
}

async function handleSaveMappedZone(
  payload: Omit<CreateMappedZoneInput, 'points'>,
): Promise<void> {
  isSavingMappedZone.value = true
  zoningError.value = ''

  try {
    await createMappedZone({
      ...payload,
      points: drawPoints.value,
    })

    await loadMappedZones()
    cancelDrawZoneMode()
  } catch (error) {
    zoningError.value = error instanceof Error ? error.message : 'Failed to save mapped zone.'
  } finally {
    isSavingMappedZone.value = false
  }
}

async function handleUpdateMappedZone(payload: {
  zoneId: string
  input: UpdateMappedZoneInput
}): Promise<void> {
  isSavingMappedZone.value = true
  zoningError.value = ''

  try {
    await updateMappedZone(payload.zoneId, payload.input)
    await loadMappedZones()
  } catch (error) {
    zoningError.value = error instanceof Error ? error.message : 'Failed to update mapped zone.'
  } finally {
    isSavingMappedZone.value = false
  }
}

async function handleDeleteMappedZone(zoneId: string): Promise<void> {
  isSavingMappedZone.value = true
  zoningError.value = ''

  try {
    await deleteMappedZone(zoneId)
    await loadMappedZones()
  } catch (error) {
    zoningError.value = error instanceof Error ? error.message : 'Failed to delete mapped zone.'
  } finally {
    isSavingMappedZone.value = false
  }
}

function handleFocusMappedZone(zoneId: string): void {
  selectedMappedZoneId.value = zoneId
}

async function handleToggleHazardsEnabled(enabled: boolean): Promise<void> {
  hazardsEnabled.value = enabled

  if (enabled) {
    await ensureHazardsLoaded()
  }
}

function handleStartCreateHazard(placementType: HazardGeometryType): void {
  startHazardPlacement(placementType)
}

function handleSelectHazard(hazardId: HazardId): void {
  selectedHazardId.value = hazardId
}

async function handleUpdateHazard(payload: {
  hazardId: HazardId
  input: UpdateHazardInput
}): Promise<void> {
  isSavingHazard.value = true
  hazardError.value = ''

  try {
    const updatedHazard = await updateHazard(payload.hazardId, payload.input)
    hazards.value = hazards.value.map((hazard) => {
      if (hazard.id !== updatedHazard.id) {
        return hazard
      }

      return updatedHazard
    })
  } catch (error) {
    hazardError.value = error instanceof Error ? error.message : 'Failed to update hazard.'
  } finally {
    isSavingHazard.value = false
  }
}

async function handleDeleteHazard(hazardId: HazardId): Promise<void> {
  isSavingHazard.value = true
  hazardError.value = ''

  try {
    await deleteHazard(hazardId)
    hazards.value = hazards.value.filter((hazard) => hazard.id !== hazardId)

    if (selectedHazardId.value === hazardId) {
      selectedHazardId.value = null
    }
  } catch (error) {
    hazardError.value = error instanceof Error ? error.message : 'Failed to delete hazard.'
  } finally {
    isSavingHazard.value = false
  }
}
</script>

<template>
  <div class="w-full h-full flex flex-col gap-3 p-3">
    <div class="flex flex-wrap items-center gap-2">
      <TypographySmall as="label" class="text-sm font-medium">Map Provider</TypographySmall>
      <Select v-model="provider">
        <SelectTrigger class="w-60">
          <SelectValue placeholder="Select map provider" />
        </SelectTrigger>
        <SelectContent style="z-index: 9999">
          <SelectItem value="leaflet"><TypographySmall as="span">Leaflet OpenStreetMap</TypographySmall></SelectItem>
          <SelectItem value="google"><TypographySmall as="span">Google Maps</TypographySmall></SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" :disabled="isLoading" @click="toggleBarangayBorders">
        <TypographySmall as="span">{{ showBarangayBorders ? 'Hide Barangay Border' : 'Show Barangay Border' }}</TypographySmall>
      </Button>

      <Button variant="outline" @click="startDrawZoneMode">
        <PenTool class="h-4 w-4" />
        <TypographySmall as="span">Draw Zone</TypographySmall>
      </Button>

      <TypographyMuted v-if="isLoading" as="span" class="text-xs text-muted-foreground">Loading barangay borders...</TypographyMuted>
      <TypographySmall v-if="errorMessage" as="span" class="text-xs text-destructive">{{ errorMessage }}</TypographySmall>
    </div>

    <div class="relative flex-1 min-h-0">
      <Map
        :provider="provider"
        :show-barangay-borders="showBarangayBorders"
        :barangay-borders="barangayBorders"
        :mapped-zones="visibleMappedZones"
        :hazards="hazards"
        :show-hazards="hazardsEnabled"
        :selected-hazard-id="selectedHazardId"
        :selected-mapped-zone-id="selectedMappedZoneId"
        :draw-points="activeDrawPoints"
        :is-draw-mode="isAnyDrawModeActive"
        @map-click="handleMapClick"
        @draw-point-move="handleDrawPointMove"
      />

      <Button
        variant="secondary"
        class="absolute right-30 top-3 z-9998"
        @click="isHazardSidebarOpen = true"
      >
        <TriangleAlert class="h-4 w-4" />
        <TypographySmall as="span">Hazards</TypographySmall>
      </Button>

      <Button
        variant="secondary"
        class="absolute right-3 top-3 z-9998"
        @click="isSidebarOpen = true"
      >
        <Layers class="h-4 w-4" />
        <TypographySmall as="span">Layers</TypographySmall>
      </Button>

      <AdminMapHazardSidebar
        :is-open="isHazardSidebarOpen"
        :hazards="hazards"
        :is-enabled="hazardsEnabled"
        :is-loading="isLoadingHazards"
        :is-submitting="isSavingHazard"
        :error-message="hazardError"
        :selected-hazard-id="selectedHazardId"
        @close="isHazardSidebarOpen = false"
        @refresh="loadHazards(true)"
        @toggle-enabled="handleToggleHazardsEnabled"
        @select-hazard="handleSelectHazard"
        @start-create-hazard="handleStartCreateHazard"
        @update-hazard="handleUpdateHazard"
        @delete-hazard="handleDeleteHazard"
      />

      <AdminMapRightSidebar
        :is-open="isSidebarOpen"
        :layers="zoningLayers"
        :mapped-zones="mappedZones"
        :is-submitting="isSidebarSubmitting"
        @close="isSidebarOpen = false"
        @submit-layer="handleCreateLayer"
        @update-layer="handleUpdateLayer"
        @delete-layer="handleDeleteLayer"
        @update-mapped-zone="handleUpdateMappedZone"
        @delete-mapped-zone="handleDeleteMappedZone"
        @focus-mapped-zone="handleFocusMappedZone"
        @toggle-layer-visibility="handleToggleLayerVisibility"
      />

      <div
        v-if="isHazardPlacementActive"
        class="absolute left-3 top-3 z-9999 rounded-md border bg-card/95 px-3 py-2 text-xs shadow"
      >
        <TypographySmall as="p" class="font-medium text-xs">Hazard Placement Active</TypographySmall>
        <TypographyMuted as="p" class="text-xs text-muted-foreground">
          {{ hazardPlacementType === 'point' ? 'Click the map once to place a pin.' : `Captured ${hazardDrawPoints.length} points` }}
        </TypographyMuted>
        <div class="mt-2 flex gap-2">
          <Button
            v-if="hazardPlacementType !== 'point'"
            size="sm"
            variant="outline"
            :disabled="hazardDrawPoints.length === 0"
            @click="undoLastHazardPoint"
          >
            <TypographySmall as="span">Undo</TypographySmall>
          </Button>
          <Button size="sm" variant="outline" @click="handleHazardPlacementCancel">
            <TypographySmall as="span">Cancel</TypographySmall>
          </Button>
          <Button
            v-if="hazardPlacementType !== 'point'"
            size="sm"
            :disabled="
              hazardPlacementType === 'linestring'
                ? hazardDrawPoints.length < 2
                : hazardDrawPoints.length < 3
            "
            @click="finishHazardPlacement"
          >
            <TypographySmall as="span">
              {{ hazardPlacementType === 'linestring' ? 'Finish Line' : 'Finish Polygon' }}
            </TypographySmall>
          </Button>
        </div>
      </div>

      <div
        v-else-if="isDrawMode"
        class="absolute left-3 top-3 z-9999 rounded-md border bg-card/95 px-3 py-2 text-xs shadow"
      >
        <TypographySmall as="p" class="font-medium text-xs">Draw Mode Active</TypographySmall>
        <TypographyMuted as="p" class="text-xs text-muted-foreground">{{ drawPoints.length }} points</TypographyMuted>
        <div class="mt-2 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            :disabled="drawPoints.length === 0"
            @click="undoLastDrawPoint"
          >
            <TypographySmall as="span">Undo</TypographySmall>
          </Button>
          <Button size="sm" variant="outline" @click="cancelDrawZoneMode"><TypographySmall as="span">Cancel</TypographySmall></Button>
          <Button size="sm" :disabled="drawPoints.length < 3" @click="finishDrawZoneMode">
            <TypographySmall as="span">Save Polygon</TypographySmall>
          </Button>
        </div>
      </div>

      <div
        v-if="zoningError"
        class="absolute bottom-3 left-3 z-9999 rounded-md border border-destructive/45 bg-destructive/12 px-3 py-2 text-xs text-destructive shadow"
      >
        <TypographySmall as="p" class="m-0 text-xs text-destructive">{{ zoningError }}</TypographySmall>
      </div>

      <HazardFormModal
        :open="showHazardFormModal"
        mode="add"
        :is-submitting="isSavingHazard"
        :placement-type="hazardPlacementType"
        :point-count="hazardDrawPoints.length"
        @close="handleHazardPlacementCancel"
        @submit-create="handleSaveHazard"
      />

      <MappedZoneFormModal
        :open="showMappedZoneModal"
        :layers="zoningLayers"
        :is-submitting="isSavingMappedZone"
        :point-count="drawPoints.length"
        @close="showMappedZoneModal = false"
        @submit="handleSaveMappedZone"
      />
    </div>
  </div>
</template>
