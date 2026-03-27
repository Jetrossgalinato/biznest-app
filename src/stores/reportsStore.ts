import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Tab } from '@/types/reports.types'
import axios from 'axios'


export const useReportsStore = defineStore('reports', () => {
  const tabs = ref<Tab[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedTabIndex = ref(0)

  const selectedTab = computed(() => tabs.value[selectedTabIndex.value] || null)

  async function fetchReports() {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/data/reports.json')
      tabs.value = response.data.tabs || response.data
      console.log('Fetched reports:', tabs.value)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch reports'
      console.error('Error fetching reports:', err)
    } finally {
      loading.value = false
    }
  }

  function setSelectedTabIndex(index: number) {
    if (index >= 0 && index < tabs.value.length) {
      selectedTabIndex.value = index
    }
  }

  return {
    tabs,
    loading,
    error,
    selectedTabIndex,
    selectedTab,
    fetchReports,
    setSelectedTabIndex,
  }
})
