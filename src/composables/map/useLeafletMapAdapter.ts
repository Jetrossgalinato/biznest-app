import type { Ref } from 'vue'
import type {
  LayerGroup as LeafletLayerGroup,
  LeafletMouseEvent,
  Map as LeafletMap,
} from 'leaflet'
import type { BarangayFeatureCollection } from '@/types/map.types'
import type { MapDrawPoint, MappedZone } from '@/types/zoning.types'
import {
  getBarangayLabel,
  getBorderColor,
  getFeaturePolygons,
  toLeafletLatLngRings,
} from '@/utils/map/barangayBorder.utils'

interface LeafletAdapterOptions {
  containerRef: Ref<HTMLDivElement | null>
  center: { lat: number; lng: number }
}

type MapClickHandler = (point: MapDrawPoint) => void

export function useLeafletMapAdapter(options: LeafletAdapterOptions) {
  let leafletMap: LeafletMap | null = null
  let leafletBarangayLayer: LeafletLayerGroup | null = null
  let leafletMappedZonesLayer: LeafletLayerGroup | null = null
  let leafletDrawPreviewLayer: LeafletLayerGroup | null = null
  let mapClickHandler: MapClickHandler | null = null
  let leafletClickListener: ((event: LeafletMouseEvent) => void) | null = null

  async function init(): Promise<void> {
    if (!options.containerRef.value) {
      return
    }

    const L = await import('leaflet')

    leafletMap = L.map(options.containerRef.value).setView(
      [options.center.lat, options.center.lng],
      14,
    )

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(leafletMap)

    L.marker([options.center.lat, options.center.lng]).addTo(leafletMap).bindPopup('Butuan City')
  }

  function destroyLeafletBarangayLayer(): void {
    if (leafletBarangayLayer) {
      leafletBarangayLayer.remove()
      leafletBarangayLayer = null
    }
  }

  function destroyLeafletMappedZonesLayer(): void {
    if (leafletMappedZonesLayer) {
      leafletMappedZonesLayer.remove()
      leafletMappedZonesLayer = null
    }
  }

  function destroyLeafletDrawPreviewLayer(): void {
    if (leafletDrawPreviewLayer) {
      leafletDrawPreviewLayer.remove()
      leafletDrawPreviewLayer = null
    }
  }

  function clearLeafletClickListener(): void {
    if (leafletMap && leafletClickListener) {
      leafletMap.off('click', leafletClickListener)
      leafletClickListener = null
    }
  }

  function destroy(): void {
    destroyLeafletBarangayLayer()
    destroyLeafletMappedZonesLayer()
    destroyLeafletDrawPreviewLayer()
    clearLeafletClickListener()

    if (leafletMap) {
      leafletMap.remove()
      leafletMap = null
    }
  }

  async function renderBarangayBorders(
    showBarangayBorders: boolean,
    barangayBorders: BarangayFeatureCollection | null,
  ): Promise<void> {
    if (!leafletMap) {
      return
    }

    destroyLeafletBarangayLayer()

    if (!showBarangayBorders || !barangayBorders) {
      return
    }

    const L = await import('leaflet')
    const layerGroup = L.layerGroup()

    barangayBorders.features.forEach((feature, featureIndex) => {
      const borderColor = getBorderColor(featureIndex)
      const label = getBarangayLabel(feature, featureIndex)

      getFeaturePolygons(feature).forEach((polygonRings) => {
        const latLngRings = toLeafletLatLngRings(polygonRings)

        L.polygon(latLngRings, {
          color: borderColor,
          weight: 2,
          opacity: 0.95,
          fillColor: borderColor,
          fillOpacity: 0.1,
        })
          .bindTooltip(label, {
            className: 'map-info-tooltip',
            sticky: true,
          })
          .addTo(layerGroup)
      })
    })

    layerGroup.addTo(leafletMap)
    leafletBarangayLayer = layerGroup
  }

  async function renderMappedZones(mappedZones: MappedZone[]): Promise<void> {
    if (!leafletMap) {
      return
    }

    destroyLeafletMappedZonesLayer()

    const L = await import('leaflet')
    const layerGroup = L.layerGroup()

    mappedZones.forEach((zone) => {
      if (zone.points.length < 3) {
        return
      }

      L.polygon(
        zone.points.map((point) => [point.lat, point.lng] as [number, number]),
        {
          color: zone.zoning_color,
          weight: 2,
          opacity: 0.95,
          fillColor: zone.zoning_color,
          fillOpacity: 0.22,
        },
      )
        .bindPopup(`<strong>${zone.name}</strong><br/>${zone.zoning_title}`)
        .addTo(layerGroup)
    })

    layerGroup.addTo(leafletMap)
    leafletMappedZonesLayer = layerGroup
  }

  async function renderDrawPreview(drawPoints: MapDrawPoint[]): Promise<void> {
    if (!leafletMap) {
      return
    }

    destroyLeafletDrawPreviewLayer()

    if (drawPoints.length === 0) {
      return
    }

    const L = await import('leaflet')
    const layerGroup = L.layerGroup()
    const positions = drawPoints.map((point) => [point.lat, point.lng] as [number, number])

    if (drawPoints.length >= 3) {
      L.polygon(positions, {
        color: '#2563eb',
        weight: 2,
        fillColor: '#2563eb',
        fillOpacity: 0.16,
        dashArray: '5, 5',
      }).addTo(layerGroup)
    } else if (drawPoints.length >= 2) {
      L.polyline(positions, {
        color: '#2563eb',
        weight: 2,
        dashArray: '5, 5',
      }).addTo(layerGroup)
    }

    positions.forEach((position) => {
      L.circleMarker(position, {
        radius: 5,
        color: '#1d4ed8',
        fillColor: '#3b82f6',
        fillOpacity: 1,
        weight: 1,
      }).addTo(layerGroup)
    })

    layerGroup.addTo(leafletMap)
    leafletDrawPreviewLayer = layerGroup
  }

  function setMapClickHandler(handler: MapClickHandler | null): void {
    mapClickHandler = handler
    clearLeafletClickListener()

    if (!leafletMap || !mapClickHandler) {
      return
    }

    leafletClickListener = (event) => {
      mapClickHandler?.({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      })
    }

    leafletMap.on('click', leafletClickListener)
  }

  return {
    init,
    destroy,
    renderBarangayBorders,
    renderMappedZones,
    renderDrawPreview,
    setMapClickHandler,
  }
}
