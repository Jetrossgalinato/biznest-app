<script setup lang="ts">
import { RouterView } from 'vue-router'
import InnerNavbar from '@/components/InnerNavbar.vue'
</script>

<template>
  <InnerNavbar />
  <main class="mx-auto w-full max-w-6xl px-4 py-6">
    <RouterView />
  </main>
</template>
