<script setup lang="ts">
import { onMounted, ref } from "vue"

const mapContainer = ref<HTMLDivElement | null>(null)

onMounted(() => {
  loadGoogleMaps()
})

function loadGoogleMaps() {
  if ((window as any).google?.maps) {
    initMap()
    return
  }

  const script = document.createElement("script")
  script.src =
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyDpLxIO_oOEQMupaVPvV5D8w3hTe3C12iw"
  script.async = true
  script.defer = true
  script.onload = initMap
  document.head.appendChild(script)
}

function initMap() {
  if (!mapContainer.value) return

  const butuan = { lat: 8.9475, lng: 125.5406 }

  const map = new (window as any).google.maps.Map(mapContainer.value, {
    center: butuan,
    zoom: 14,
  })

  new (window as any).google.maps.Marker({
    position: butuan,
    map,
    title: "Butuan City",
  })
}
</script>

<template>
  <div class="w-full h-full">
    <div ref="mapContainer" class="w-full h-full"></div>
  </div>
</template>
