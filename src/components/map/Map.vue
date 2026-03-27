<!-- Map.vue -->
<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import type { LayerGroup as LeafletLayerGroup, Map as LeafletMap } from "leaflet"
import "leaflet/dist/leaflet.css"

defineOptions({
  name: "AdminMapCanvas",
})

type MapProvider = "google" | "leaflet"

type BarangayLngLat = [number, number]

type BarangayPolygonGeometry = {
  type: "Polygon"
  coordinates: BarangayLngLat[][]
}

type BarangayMultiPolygonGeometry = {
  type: "MultiPolygon"
  coordinates: BarangayLngLat[][][]
}

type BarangayFeature = {
  type: "Feature"
  geometry: BarangayPolygonGeometry | BarangayMultiPolygonGeometry
  properties?: {
    brgy_name?: string
    [key: string]: unknown
  }
}

type BarangayFeatureCollection = {
  type: "FeatureCollection"
  features: BarangayFeature[]
}

const props = withDefaults(
  defineProps<{
    provider?: MapProvider
    showBarangayBorders?: boolean
    barangayBorders?: BarangayFeatureCollection | null
  }>(),
  {
    provider: "leaflet",
    showBarangayBorders: false,
    barangayBorders: null,
  },
)

type GoogleMapInstance = {
  setCenter: (latLng: { lat: number; lng: number }) => void
}

type GooglePolygonPath = {
  lat: number
  lng: number
}

type GoogleLatLng = {
  lat: () => number
  lng: () => number
}

type GoogleMapMouseEvent = {
  latLng?: GoogleLatLng
}

type GooglePolygonInstance = {
  setMap: (map: GoogleMapInstance | null) => void
  addListener?: (eventName: "click" | "mouseover" | "mouseout", handler: (event: GoogleMapMouseEvent) => void) => void
}

type GoogleInfoWindowInstance = {
  setContent: (content: string) => void
  setPosition: (position: GooglePolygonPath) => void
  open: (options: { map: GoogleMapInstance }) => void
  close: () => void
}

type GoogleMapCtor = new (
  element: HTMLElement,
  options: { center: { lat: number; lng: number }; zoom: number; mapId?: string },
) => GoogleMapInstance

type AdvancedMarkerLibrary = {
  AdvancedMarkerElement: new (options: {
    position: { lat: number; lng: number }
    map: GoogleMapInstance
    title?: string
  }) => unknown
}

type LegacyMarkerCtor = new (options: {
  position: { lat: number; lng: number }
  map: GoogleMapInstance
  title?: string
}) => unknown

type GoogleMapsAPI = {
  Map?: GoogleMapCtor
  Marker?: LegacyMarkerCtor
  Polygon?: new (options: {
    paths: GooglePolygonPath[][]
    strokeColor: string
    strokeOpacity: number
    strokeWeight: number
    fillColor: string
    fillOpacity: number
    map: GoogleMapInstance
  }) => GooglePolygonInstance
  InfoWindow?: new () => GoogleInfoWindowInstance
  importLibrary?: (name: string) => Promise<unknown>
  marker?: {
    AdvancedMarkerElement?: AdvancedMarkerLibrary["AdvancedMarkerElement"]
  }
}

type MapsLibrary = {
  Map: GoogleMapCtor
}

type GoogleWindow = Window & {
  google?: {
    maps?: GoogleMapsAPI
  }
}

const mapContainer = ref<HTMLDivElement | null>(null)
const mapError = ref("")
const butuan = { lat: 8.9475, lng: 125.5406 }
const googleMapsApiKeyMeta = document.querySelector('meta[name="google-maps-api-key"]') as
  | HTMLMetaElement
  | null
const googleMapsApiKey = googleMapsApiKeyMeta?.content?.trim() ?? ""
const resolvedGoogleMapsApiKey =
  googleMapsApiKey.startsWith("%VITE_") && googleMapsApiKey.endsWith("%") ? "" : googleMapsApiKey
let googleMapsLoader: Promise<void> | null = null
let leafletMap: LeafletMap | null = null
let googleMap: GoogleMapInstance | null = null
let googleBarangayPolygons: GooglePolygonInstance[] = []
let googleBarangayInfoWindow: GoogleInfoWindowInstance | null = null
let leafletBarangayLayer: LeafletLayerGroup | null = null

const BARANGAY_BORDER_COLORS = [
  "#ef4444",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#eab308",
  "#f97316",
  "#06b6d4",
]

onMounted(async () => {
  await initProviderMap()
})

watch(
  () => props.provider,
  async () => {
    destroyLeafletMap()
    destroyGoogleBarangayPolygons()
    googleMap = null

    if (mapContainer.value) {
      mapContainer.value.innerHTML = ""
    }

    await nextTick()
    await initProviderMap()
  },
)

onBeforeUnmount(() => {
  destroyLeafletMap()
  destroyGoogleBarangayPolygons()
  googleMap = null
})

watch(
  () => [props.showBarangayBorders, props.barangayBorders],
  async () => {
    await renderBarangayBordersForActiveProvider()
  },
  { deep: true },
)

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function loadGoogleMaps(): Promise<void> {
  const googleWindow = window as GoogleWindow

  if (!resolvedGoogleMapsApiKey) {
    return Promise.reject(new Error("Missing VITE_GOOGLE_MAPS_API_KEY"))
  }

  if (googleWindow.google?.maps) {
    return Promise.resolve()
  }

  if (googleMapsLoader) {
    return googleMapsLoader
  }

  googleMapsLoader = new Promise((resolve, reject) => {
    const existingScript = document.getElementById("google-maps-sdk") as HTMLScriptElement | null

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true })
      existingScript.addEventListener("error", () => reject(new Error("Google Maps failed to load")), {
        once: true,
      })
      return
    }

    const script = document.createElement("script")
    script.id = "google-maps-sdk"
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${resolvedGoogleMapsApiKey}&loading=async&libraries=marker&v=weekly`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Google Maps failed to load"))
    document.head.appendChild(script)
  })

  return googleMapsLoader
}

async function initGoogleMap(): Promise<boolean> {
  if (!mapContainer.value) return false

  const googleWindow = window as GoogleWindow
  const googleMaps = googleWindow.google?.maps

  if (!googleMaps) {
    return false
  }

  let MapCtor: GoogleMapCtor | undefined
  let AdvancedMarkerElement: AdvancedMarkerLibrary["AdvancedMarkerElement"] | undefined

  if (typeof googleMaps.Map === "function") {
    MapCtor = googleMaps.Map
  }

  if (!MapCtor && typeof googleMaps.importLibrary === "function") {
    const mapsLibrary = (await googleMaps.importLibrary("maps")) as unknown as MapsLibrary
    if (typeof mapsLibrary.Map === "function") {
      MapCtor = mapsLibrary.Map
    }
  }

  if (typeof googleMaps.importLibrary === "function") {
    const markerLibrary = (await googleMaps.importLibrary("marker")) as unknown as AdvancedMarkerLibrary
    AdvancedMarkerElement = markerLibrary.AdvancedMarkerElement
  } else {
    AdvancedMarkerElement = googleMaps.marker?.AdvancedMarkerElement
  }

  if (!MapCtor) return false

  const map = new MapCtor(mapContainer.value, {
    center: butuan,
    zoom: 12,
    mapId: "DEMO_MAP_ID",
  })
  googleMap = map

  if (AdvancedMarkerElement) {
    new AdvancedMarkerElement({
      position: butuan,
      map,
      title: "Butuan City",
    })
    await renderGoogleBarangayBorders()
    return true
  }

  if (googleMaps.Marker) {
    console.warn("AdvancedMarkerElement is unavailable; falling back to legacy Marker")
    new googleMaps.Marker({
      position: butuan,
      map,
      title: "Butuan City",
    })
    await renderGoogleBarangayBorders()
    return true
  }

  await renderGoogleBarangayBorders()
  return true
}

async function initLeafletMap() {
  if (!mapContainer.value) return

  const L = await import("leaflet")

  leafletMap = L.map(mapContainer.value).setView([butuan.lat, butuan.lng], 14)

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(leafletMap)

  L.marker([butuan.lat, butuan.lng]).addTo(leafletMap).bindPopup("Butuan City")
  await renderLeafletBarangayBorders()
}

function destroyLeafletMap() {
  destroyLeafletBarangayLayer()

  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }
}

function destroyLeafletBarangayLayer() {
  if (leafletBarangayLayer) {
    leafletBarangayLayer.remove()
    leafletBarangayLayer = null
  }
}

function destroyGoogleBarangayPolygons() {
  googleBarangayPolygons.forEach((polygon) => polygon.setMap(null))
  googleBarangayPolygons = []

  if (googleBarangayInfoWindow) {
    googleBarangayInfoWindow.close()
  }
}

function getBorderColor(index: number): string {
  return BARANGAY_BORDER_COLORS[index % BARANGAY_BORDER_COLORS.length] ?? "#3b82f6"
}

function getFeaturePolygons(feature: BarangayFeature): BarangayLngLat[][][] {
  if (feature.geometry.type === "Polygon") {
    return [feature.geometry.coordinates]
  }

  return feature.geometry.coordinates
}

function toGooglePath(ring: BarangayLngLat[]): GooglePolygonPath[] {
  return ring.map(([lng, lat]) => ({ lat, lng }))
}

function openGoogleBarangayInfoWindow(label: string, latLng?: GoogleLatLng) {
  if (!googleMap || !googleBarangayInfoWindow) {
    return
  }

  if (latLng) {
    googleBarangayInfoWindow.setPosition({ lat: latLng.lat(), lng: latLng.lng() })
  }

  googleBarangayInfoWindow.setContent(label)
  googleBarangayInfoWindow.open({ map: googleMap })
}

async function renderLeafletBarangayBorders() {
  if (!leafletMap) {
    return
  }

  destroyLeafletBarangayLayer()

  if (!props.showBarangayBorders || !props.barangayBorders) {
    return
  }

  const L = await import("leaflet")
  const layerGroup = L.layerGroup()

  props.barangayBorders.features.forEach((feature, featureIndex) => {
    const borderColor = getBorderColor(featureIndex)
    const label = feature.properties?.brgy_name ?? `Barangay ${featureIndex + 1}`

    getFeaturePolygons(feature).forEach((polygonRings) => {
      const latLngRings = polygonRings.map((ring) =>
        ring.map(([lng, lat]) => [lat, lng] as [number, number]),
      )

      L.polygon(latLngRings, {
        color: borderColor,
        weight: 2,
        opacity: 0.95,
        fillColor: borderColor,
        fillOpacity: 0.1,
      })
        .bindTooltip(label)
        .addTo(layerGroup)
    })
  })

  layerGroup.addTo(leafletMap)
  leafletBarangayLayer = layerGroup
}

async function renderGoogleBarangayBorders() {
  destroyGoogleBarangayPolygons()

  if (!googleMap || !props.showBarangayBorders || !props.barangayBorders) {
    return
  }

  const googleMaps = (window as GoogleWindow).google?.maps
  if (!googleMaps?.Polygon) {
    return
  }

  const PolygonCtor = googleMaps.Polygon
  const activeGoogleMap = googleMap

  if (googleMaps.InfoWindow && !googleBarangayInfoWindow) {
    googleBarangayInfoWindow = new googleMaps.InfoWindow()
  }

  if (!activeGoogleMap) {
    return
  }

  props.barangayBorders.features.forEach((feature, featureIndex) => {
    const borderColor = getBorderColor(featureIndex)
    const label = feature.properties?.brgy_name ?? `Barangay ${featureIndex + 1}`

    getFeaturePolygons(feature).forEach((polygonRings) => {
      const paths = polygonRings.map((ring) => toGooglePath(ring))

      const polygon = new PolygonCtor({
        paths,
        strokeColor: borderColor,
        strokeOpacity: 0.95,
        strokeWeight: 2,
        fillColor: borderColor,
        fillOpacity: 0.1,
        map: activeGoogleMap,
      })

      if (polygon.addListener) {
        polygon.addListener("mouseover", (event) => {
          openGoogleBarangayInfoWindow(label, event.latLng)
        })

        polygon.addListener("click", (event) => {
          openGoogleBarangayInfoWindow(label, event.latLng)
        })

        polygon.addListener("mouseout", () => {
          if (googleBarangayInfoWindow) {
            googleBarangayInfoWindow.close()
          }
        })
      }

      googleBarangayPolygons.push(polygon)
    })
  })
}

async function renderBarangayBordersForActiveProvider() {
  if (props.provider === "leaflet") {
    await renderLeafletBarangayBorders()
    return
  }

  await renderGoogleBarangayBorders()
}

async function initProviderMap() {
  mapError.value = ""

  if (props.provider === "leaflet") {
    if (mapContainer.value) {
      mapContainer.value.innerHTML = ""
    }
    await initLeafletMap()
    return
  }

  try {
    await loadGoogleMaps()
    let initialized = false

    // On hard refresh, Google Maps may report loaded before constructors are ready.
    for (let attempt = 0; attempt < 6 && !initialized; attempt += 1) {
      initialized = await initGoogleMap()

      if (!initialized) {
        await delay(200)
      }
    }

    if (!initialized) {
      mapError.value = "Google Maps could not be initialized. Check API key and Google Cloud restrictions."
    }
  } catch (error) {
    console.warn("Google Maps unavailable", error)
    if (mapContainer.value) {
      mapContainer.value.innerHTML = ""
    }
    mapError.value = "Google Maps failed to load. Check API key, billing, and allowed referrers."
  }
}
</script>

<template>
  <div class="relative w-full h-full">
    <div
      v-if="mapError"
      class="absolute left-3 top-3 z-50 rounded-md bg-red-100 px-3 py-2 text-xs text-red-800 shadow"
    >
      {{ mapError }}
    </div>
    <div ref="mapContainer" class="h-full w-full"></div>
  </div>
</template>
