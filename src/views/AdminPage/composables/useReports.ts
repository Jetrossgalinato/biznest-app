import { computed } from 'vue'
import { useReportsStore } from '@/stores/reportsStore'

export function useReports() {
  const store = useReportsStore()

  return {
    value: computed(() => store.selectedTabIndex),
    tabs: computed(() => store.tabs),
    loading: computed(() => store.loading),
    error: computed(() => store.error),
    handleChange: store.setSelectedTabIndex,
    fetchReports: store.fetchReports,    
  }
}
