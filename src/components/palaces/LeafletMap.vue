<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import IconMyLocation from '@/assets/icons/location-pin-svgrepo-com.svg'
import { mapTail } from '@/utils/mapTail'
import { useI18n } from 'vue-i18n'

const LocationImage = new URL('@/assets/icons/location-pin-svgrepo-com.svg', import.meta.url).href

const props = defineProps<{ latitude: number; longitude: number }>()

const emit = defineEmits(['updateLocation'])
const { t } = useI18n()

const isLoading = ref(false)
const map = ref()
const mapRef = ref()
const isEditableMenus = ref(false)

const icon = L.icon({
  iconUrl: LocationImage,
  iconSize: [25, 25],
  iconAnchor: [15, 45]
})

const currentLat = ref(props.latitude)
const currentLng = ref(props.longitude)
const oldLat = ref(props.latitude)
const oldLng = ref(props.longitude)

const clearMarkers = () => {
  map.value?.eachLayer((layer: any) => {
    if (layer instanceof L.Marker) {
      map.value?.removeLayer(layer)
    }
  })
}

const getLocation = () => {
  isLoading.value = true
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords
      map.value?.setView([latitude, longitude], 15)
      clearMarkers()

      L.marker([latitude, longitude], {
        draggable: true,
        icon
      })
        .addTo(map.value!)
        .openPopup()
    })
  }
  isLoading.value = false
}

const mountedCurrentPosition = (L: typeof import('leaflet')) => {
  map.value = L.map(mapRef.value!)
  L.tileLayer(mapTail, {}).addTo(map.value)
  L.marker([props.latitude, props.longitude], { icon }).addTo(map.value)
  map.value.options.crs = L.CRS.EPSG3395
  map.value.setView([props.latitude, props.longitude], 15)
}

const changeLocation = () => {
  map.value?.on('click', (e: any) => {
    if (isEditableMenus.value) {
      clearMarkers()
      const { lat, lng } = e.latlng

      currentLat.value = lat
      currentLng.value = lng

      L.marker([lat, lng], {
        draggable: true,
        icon
      })
        .addTo(map.value!)
        .openPopup()
    }
  })
}

const save = () => {
  emit('updateLocation', { lat: currentLat.value, lng: currentLng.value })
}

onMounted(async () => {
  import('leaflet').then((res) => {
    mountedCurrentPosition(res)
  })
})

const toggleEditable = () => {
  isEditableMenus.value = !isEditableMenus.value
  if (!isEditableMenus.value) {
    clearMarkers()
    L.marker([oldLat.value, oldLng.value], {
      draggable: false,
      icon
    }).addTo(map.value!)
  } else {
    changeLocation()
  }
}

const clear = () => {
  clearMarkers()
  console.log(currentLat.value, oldLat.value)
  currentLng.value = oldLng.value
  currentLat.value = oldLat.value

  emit('updateLocation', { lat: oldLat.value, lng: oldLng.value })
  isEditableMenus.value = false
  L.marker([currentLat.value, currentLng.value], {
    draggable: false,
    icon
  }).addTo(map.value)
}

defineExpose({
  clear
})
</script>

<template>
  <div class="global-map">
    <div style="height: 100%">
      <div ref="mapRef" class="global-map-map" />
    </div>
    <div class="global-map-buttons">
      <base-button :loading="isLoading" type="primary" style="padding: 0 6px" class="submit-btn" @click="getLocation">
        <p>{{ t('whereAmI') }}</p>
        <IconMyLocation width="30px" />
      </base-button>
      <div>
        <VLabel :name="t('edit')" />
        <base-button @click="toggleEditable">
          {{ isEditableMenus ? t('clear') : t('selectLocation') }}
        </base-button>
        <base-button class="ml-4" v-if="isEditableMenus" @click="save">
          {{ t('actions.save') }}
        </base-button>
      </div>
    </div>
  </div>
</template>

<style>
.leaflet-marker-icon {
  width: auto !important;
  height: auto !important;
}

.leaflet-control-attribution {
  display: none;
}
</style>

<style scoped lang="scss">
.global-map {
  position: relative;
  height: 500px;

  &__no-active {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    font-weight: 500;
  }

  &-map {
    width: 100%;
    height: 100%;
    overflow: hidden;
    object-fit: cover;
    z-index: 0;
    border-radius: 6px;
  }

  &-buttons {
    display: flex;
    align-items: flex-end;
    position: absolute;
    bottom: 0;
    right: 0;
    justify-content: flex-end;
    gap: 16px;
    background: #fff;
    border-radius: 6px 0 0 0;
    border: 1px solid #dfe2e9;
    border-right: 0;
    border-bottom: 0;
    padding: 12px;
  }

  &-header {
    position: absolute;
    padding: 12px;
    top: 0;
    right: 0;
    width: fit-content;
    height: fit-content;
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    align-items: center;
    background: #fff;
    border-left: 1px solid #dfe2e9;
    border-bottom: 1px solid var(--border-color);
    border-radius: 0 0 0 6px;
    z-index: 10;
  }
}
</style>
