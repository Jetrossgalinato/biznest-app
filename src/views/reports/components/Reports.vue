<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { FileText, Download } from 'lucide-vue-next';
import { useReports } from '../composables/useReports';
import { usePdfExport } from '../composables/usePdfExport';
import { TypographyH3, TypographyP } from '@/components/typography';

const { value, tabs, loading, error, handleChange, fetchReports } = useReports();
const { exportToPdf } = usePdfExport();

const currentTab = computed(() => tabs.value[value.value]);
const canExport = computed(() => currentTab.value?.tableData && currentTab.value.tableData.length > 0);

const handleExport = () => {
  if (canExport.value && currentTab.value) {
    exportToPdf(currentTab.value, currentTab.value.label);
  }
};

onMounted(() => {
  fetchReports();
});
</script>

<template>
  <div class="w-full">
    <div class="my-4 mx-4 mb-3">
      <div class="flex items-center justify-start gap-2">
        <FileText class="text-primary shrink-0" :size="24" />
        <TypographyH3>Saved Reports</TypographyH3>
      </div>
      <TypographyP class="mt-1.5">Analysis reports saved from the Map page.</TypographyP>
    </div>

    <div v-if="loading" class="p-6 text-center">
      <TypographyP class="text-muted-foreground">Loading reports...</TypographyP>
    </div>

    <div v-else-if="error" class="p-6 text-center">
      <TypographyP class="text-destructive">Error loading reports: {{ error }}</TypographyP>
    </div>

    <div v-else>
      <div class="border-b border-border flex items-center justify-between">
        <div class="flex gap-0" role="tablist" aria-label="basic tabs example">
          <button
            v-for="(tab, index) in tabs"
            :key="index"
            role="tab"
            :id="`simple-tab-${index}`"
            :aria-controls="`simple-tabpanel-${index}`"
            :aria-selected="value === index"
            :class="[
              'px-4 py-3 bg-transparent border-none cursor-pointer text-sm font-medium uppercase transition-colors relative',
              value === index
                ? 'text-primary after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                : 'text-muted-foreground hover:text-foreground/80'
            ]"
            @click="handleChange(index)"
          >
            {{ tab.label }}
          </button>
        </div>
        <button
          v-if="canExport"
          @click="handleExport"
          class="flex items-center gap-1.5 px-4 py-1.5 mr-7 my-auto bg-primary text-primary-foreground border-none rounded font-medium text-sm cursor-pointer transition-colors hover:bg-primary/90 active:bg-primary/80"
          title="Export to PDF"
        >
          <Download :size="18" />
          <span>Export PDF</span>
        </button>
      </div>

      <div
        v-for="(tab, index) in tabs"
        :key="index"
        role="tabpanel"
        :hidden="value !== index"
        :id="`simple-tabpanel-${index}`"
        :aria-labelledby="`simple-tab-${index}`"
        class="block [[hidden]]:hidden"
      >
        <div v-if="value === index" class="p-6">
          <table v-if="tab.tableData" class="w-full border-collapse">
            <thead>
              <tr class="bg-muted border-b-2 border-border">
                <th class="px-4 py-3 text-left font-semibold text-xs text-foreground uppercase">Business Owner</th>
                <th class="px-4 py-3 text-left font-semibold text-xs text-foreground uppercase">Contact Number</th>
                <th class="px-4 py-3 text-left font-semibold text-xs text-foreground uppercase">Business Location</th>
                <th class="px-4 py-3 text-left font-semibold text-xs text-foreground uppercase">Zoning Classification</th>
                <th class="px-4 py-3 text-left font-semibold text-xs text-foreground uppercase">GeoTag</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in tab.tableData" :key="rowIndex" class="border-b border-border last:border-b-0">
                <td class="px-4 py-3 text-sm text-foreground">{{ row.businessOwner }}</td>
                <td class="px-4 py-3 text-sm text-foreground">{{ row.contactNumber }}</td>
                <td class="px-4 py-3 text-sm text-foreground">{{ row.businessLocation }}</td>
                <td class="px-4 py-3 text-sm text-foreground">{{ row.zoningClassification }}</td>
                <td class="px-4 py-3 text-sm text-foreground">{{ row.geotag }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else>
            {{ tab.content }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>