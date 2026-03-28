import type { Ref } from 'vue'
import type { BarangayFeatureCollection, GooglePolygonPath } from '@/types/map.types'
import type { MapDrawPoint, MappedZone } from '@/types/zoning.types'
import type {
  GoogleInfoWindowInstance,
  GoogleLatLng,
  GoogleMapInstance,
  GoogleMapsEventListener,
  GooglePolygonInstance,
  GooglePolylineInstance,
  GoogleWindow,
} from '@/composables/map/googleMapAdapter.types'
import {
  delay,
  initializeGoogleMapInstance,
  loadGoogleMapsScript,
} from '@/composables/map/googleMapAdapter.init'
import {
  buildMapInfoWindowHtml,
  getBarangayLabel,
  getBorderColor,
  getFeaturePolygons,
  toGooglePath,
} from '@/utils/map/barangayBorder.utils'

interface GoogleAdapterOptions {
  containerRef: Ref<HTMLDivElement | null>
  center: { lat: number; lng: number }
  mapId?: string
  getApiKey: () => string
}

type MapClickHandler = (point: MapDrawPoint) => void

export function useGoogleMapAdapter(options: GoogleAdapterOptions) {
  let googleMapsLoader: Promise<void> | null = null
  let googleMap: GoogleMapInstance | null = null
  let googleBarangayPolygons: GooglePolygonInstance[] = []
  let googleMappedZonePolygons: GooglePolygonInstance[] = []
  let googleBarangayInfoWindow: GoogleInfoWindowInstance | null = null
  let googleDrawPreviewPolygon: GooglePolygonInstance | null = null
  let googleDrawPreviewPolyline: GooglePolylineInstance | null = null
  let googleMapClickListener: GoogleMapsEventListener | null = null
  let mapClickHandler: MapClickHandler | null = null

  function destroyGoogleBarangayPolygons(): void {
    googleBarangayPolygons.forEach((polygon) => polygon.setMap(null))
    googleBarangayPolygons = []

    if (googleBarangayInfoWindow) {
      googleBarangayInfoWindow.close()
    }
  }

  function destroyGoogleMappedZonePolygons(): void {
    googleMappedZonePolygons.forEach((polygon) => polygon.setMap(null))
    googleMappedZonePolygons = []
  }

  function destroyGoogleDrawPreview(): void {
    googleDrawPreviewPolygon?.setMap(null)
    googleDrawPreviewPolygon = null
    googleDrawPreviewPolyline?.setMap(null)
    googleDrawPreviewPolyline = null
  }

  function clearGoogleMapClickListener(): void {
    googleMapClickListener?.remove()
    googleMapClickListener = null
  }

  function syncGoogleMapClickListener(): void {
    clearGoogleMapClickListener()

    if (!googleMap || !googleMap.addListener || !mapClickHandler) {
      return
    }

    googleMapClickListener = googleMap.addListener('click', (event) => {
      if (!event.latLng) {
        return
      }

      mapClickHandler?.({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      })
    })
  }

  function destroy(): void {
    destroyGoogleBarangayPolygons()
    destroyGoogleMappedZonePolygons()
    destroyGoogleDrawPreview()
    clearGoogleMapClickListener()
    googleMap = null
  }

  function openGoogleBarangayInfoWindow(label: string, latLng?: GoogleLatLng): void {
    if (!googleMap || !googleBarangayInfoWindow) {
      return
    }

    if (latLng) {
      googleBarangayInfoWindow.setPosition({ lat: latLng.lat(), lng: latLng.lng() })
    }

    googleBarangayInfoWindow.setContent(buildMapInfoWindowHtml(label))
    googleBarangayInfoWindow.open({ map: googleMap })
  }

  async function renderBarangayBorders(
    showBarangayBorders: boolean,
    barangayBorders: BarangayFeatureCollection | null,
  ): Promise<void> {
    destroyGoogleBarangayPolygons()

    if (!googleMap || !showBarangayBorders || !barangayBorders) {
      return
    }

    const googleMaps = (window as GoogleWindow).google?.maps
    if (!googleMaps?.Polygon) {
      return
    }

    const PolygonCtor = googleMaps.Polygon

    if (googleMaps.InfoWindow && !googleBarangayInfoWindow) {
      googleBarangayInfoWindow = new googleMaps.InfoWindow()
    }

    barangayBorders.features.forEach((feature, featureIndex) => {
      const borderColor = getBorderColor(featureIndex)
      const label = getBarangayLabel(feature, featureIndex)

      getFeaturePolygons(feature).forEach((polygonRings) => {
        const paths = polygonRings.map((ring) => toGooglePath(ring))

        const polygon = new PolygonCtor({
          paths,
          strokeColor: borderColor,
          strokeOpacity: 0.95,
          strokeWeight: 2,
          fillColor: borderColor,
          fillOpacity: 0.1,
          map: googleMap as GoogleMapInstance,
        })

        if (polygon.addListener) {
          polygon.addListener('mouseover', (event) => {
            openGoogleBarangayInfoWindow(label, event.latLng)
          })

          polygon.addListener('click', (event) => {
            openGoogleBarangayInfoWindow(label, event.latLng)
          })

          polygon.addListener('mouseout', () => {
            if (googleBarangayInfoWindow) {
              googleBarangayInfoWindow.close()
            }
          })
        }

        googleBarangayPolygons.push(polygon)
      })
    })
  }

  async function renderMappedZones(mappedZones: MappedZone[]): Promise<void> {
    destroyGoogleMappedZonePolygons()

    if (!googleMap || mappedZones.length === 0) {
      return
    }

    const googleMaps = (window as GoogleWindow).google?.maps
    if (!googleMaps?.Polygon) {
      return
    }

    const PolygonCtor = googleMaps.Polygon

    mappedZones.forEach((zone) => {
      if (zone.points.length < 3) {
        return
      }

      const polygon = new PolygonCtor({
        paths: [zone.points.map((point) => ({ lat: point.lat, lng: point.lng }))],
        strokeColor: zone.zoning_color,
        strokeOpacity: 0.95,
        strokeWeight: 2,
        fillColor: zone.zoning_color,
        fillOpacity: 0.22,
        map: googleMap as GoogleMapInstance,
      })

      googleMappedZonePolygons.push(polygon)
    })
  }

  async function renderDrawPreview(drawPoints: MapDrawPoint[]): Promise<void> {
    destroyGoogleDrawPreview()

    if (!googleMap || drawPoints.length < 2) {
      return
    }

    const googleMaps = (window as GoogleWindow).google?.maps
    if (!googleMaps) {
      return
    }

    if (drawPoints.length >= 3 && googleMaps.Polygon) {
      googleDrawPreviewPolygon = new googleMaps.Polygon({
        paths: [drawPoints.map((point) => ({ lat: point.lat, lng: point.lng }))],
        strokeColor: '#2563eb',
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: '#2563eb',
        fillOpacity: 0.16,
        map: googleMap as GoogleMapInstance,
      })
      return
    }

    if (googleMaps.Polyline) {
      googleDrawPreviewPolyline = new googleMaps.Polyline({
        path: drawPoints.map((point) => ({ lat: point.lat, lng: point.lng })),
        strokeColor: '#2563eb',
        strokeOpacity: 1,
        strokeWeight: 2,
        map: googleMap as GoogleMapInstance,
      })
    }
  }

  function setMapClickHandler(handler: MapClickHandler | null): void {
    mapClickHandler = handler
    syncGoogleMapClickListener()
  }

  async function focusOnZone(points: MapDrawPoint[]): Promise<void> {
    if (!googleMap || points.length === 0) {
      return
    }

    const center = points.reduce(
      (accumulator, point) => {
        return {
          lat: accumulator.lat + point.lat,
          lng: accumulator.lng + point.lng,
        }
      },
      { lat: 0, lng: 0 },
    )

    const lat = center.lat / points.length
    const lng = center.lng / points.length

    googleMap.setCenter({ lat, lng })
    googleMap.setZoom?.(16)
  }

  function loadGoogleMaps(): Promise<void> {
    const resolvedGoogleMapsApiKey = options.getApiKey()

    googleMapsLoader = loadGoogleMapsScript(resolvedGoogleMapsApiKey, googleMapsLoader)

    return googleMapsLoader
  }

  async function initializeMapInstance(): Promise<boolean> {
    return initializeGoogleMapInstance({
      container: options.containerRef.value,
      center: options.center,
      mapId: options.mapId,
      onMapReady: (map) => {
        googleMap = map
        syncGoogleMapClickListener()
      },
    })
  }

  async function init(): Promise<void> {
    await loadGoogleMaps()

    let initialized = false

    for (let attempt = 0; attempt < 6 && !initialized; attempt += 1) {
      initialized = await initializeMapInstance()

      if (!initialized) {
        await delay(200)
      }
    }

    if (!initialized) {
      throw new Error(
        'Google Maps could not be initialized. Check API key and Google Cloud restrictions.',
      )
    }
  }

  return {
    init,
    destroy,
    renderBarangayBorders,
    renderMappedZones,
    renderDrawPreview,
    setMapClickHandler,
    focusOnZone,
  }
}
