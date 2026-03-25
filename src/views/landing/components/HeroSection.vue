<script lang="ts" setup>
defineOptions({
  name: 'HeroSection',
})

import Badge from '@/components/ui/badge/Badge.vue'
</script>

<template>
  <section
    class="relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20"
  >
    <div class="container mx-auto px-6 md:px-12 lg:px-20 flex flex-col items-center text-center">
      <Badge variant="outline" class="mb-4">Welcome to BizNest</Badge>
      <h1 class="text-4xl md:text-5xl font-bold mb-6">Your Ultimate Business Companion</h1>
      <p class="text-lg md:text-xl mb-8 max-w-2xl">
        Streamline your operations, boost productivity, and grow your business with our all-in-one
        platform.
      </p>
      <div class="flex gap-4">
        <a
          href="/signup"
          class="px-6 py-3 bg-white text-blue-600 rounded-md font-semibold hover:bg-gray-100 transition"
          >Get Started</a
        >
        <a
          href="/learn-more"
          class="px-6 py-3 bg-transparent text-white border border-white rounded-md font-semibold hover:bg-white/10 transition"
          >Learn More</a
        >
      </div>
    </div>
  </section>
</template>
