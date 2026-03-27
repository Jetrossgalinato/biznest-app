<script setup lang="ts">
import { RouterView } from 'vue-router'
import AdminSidebar from '@/components/AdminSidebar.vue'
import InnerNavbar from '@/components/InnerNavbar.vue'
</script>

<template>
  <div class="flex min-h-screen bg-far text-foreground">
    <AdminSidebar />
    <div class="flex min-h-screen flex-1 flex-col">
      <InnerNavbar />
      <main class="flex-1 p-4 md:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
