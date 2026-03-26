<script setup lang="ts">
import { onMounted } from 'vue';
import { FileText } from 'lucide-vue-next';
import { useReports } from '../composables/useReports';
import { TypographyH3, TypographyP } from '@/components/typography';

const { value, tabs, loading, error, handleChange, fetchReports } = useReports();

onMounted(() => {
  fetchReports();
});
</script>

<template>
  <div class="tabs-container">
    <div class="reports-header my-4 mx-4">
      <div class="reports-header-content">
        <FileText class="reports-icon" :size="24" />
        <TypographyH3>Saved Reports</TypographyH3>
      </div>
      <TypographyP class="reports-description">Analysis reports saved from the Map page.</TypographyP>
    </div>

    <div v-if="loading" class="loading-state">
      <TypographyP>Loading reports...</TypographyP>
    </div>

    <div v-else-if="error" class="error-state">
      <TypographyP>Error loading reports: {{ error }}</TypographyP>
    </div>

    <div v-else>
      <div class="tabs-header">
        <div class="tabs" role="tablist" aria-label="basic tabs example">
          <button
            v-for="(tab, index) in tabs"
            :key="index"
            role="tab"
            :id="`simple-tab-${index}`"
            :aria-controls="`simple-tabpanel-${index}`"
            :aria-selected="value === index"
            :class="['tab', { active: value === index }]"
            @click="handleChange(index)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div
        v-for="(tab, index) in tabs"
        :key="index"
        role="tabpanel"
        :hidden="value !== index"
        :id="`simple-tabpanel-${index}`"
        :aria-labelledby="`simple-tab-${index}`"
        class="tab-panel"
      >
        <div v-if="value === index" class="tab-content">
          <table v-if="tab.tableData" class="data-table">
            <thead>
              <tr>
                <th>Business Owner</th>
                <th>Owner Number</th>
                <th>Owner Address</th>
                <th>Zoning Location</th>
                <th>GeoTag</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in tab.tableData" :key="rowIndex">
                <td>{{ row.businessOwner }}</td>
                <td>{{ row.ownerNumber }}</td>
                <td>{{ row.ownerAddress }}</td>
                <td>{{ row.zoningClassification }}</td>
                <td>{{ row.geotag }}</td>
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


<style scoped>
.tabs-container {
  width: 100%;
}

.reports-header {
  margin-bottom: 12px;
}

.reports-header-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}

.reports-icon {
  color: #1976d2;
  flex-shrink: 0;
}

.reports-header h2,
.reports-description {
  margin: 0;
}

.reports-description {
  margin-top: 6px;
}

.loading-state,
.error-state {
  padding: 24px;
  text-align: center;
}

.loading-state {
  color: #666;
}

.error-state {
  color: #d32f2f;
}

.tabs-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.tabs {
  display: flex;
  gap: 0;
}

.tab {
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.6);
  transition: color 0.2s;
  position: relative;
}

.tab:hover {
  color: rgba(0, 0, 0, 0.8);
}

.tab.active {
  color: #1976d2;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #1976d2;
}

.tab-panel {
  display: block;
}

.tab-panel[hidden] {
  display: none;
}

.tab-content {
  padding: 24px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background-color: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
}

.data-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  color: #333;
  text-transform: uppercase;
}

.data-table tr {
  border-bottom: 1px solid #e0e0e0;
}

.data-table tr:last-child {
  border-bottom: none;
}

.data-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
}
</style>