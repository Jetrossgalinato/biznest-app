<script lang="ts" setup>
defineOptions({
  name: 'HeroSection',
})

import Badge from '@/components/ui/badge/Badge.vue'
import Button from '@/components/ui/button/Button.vue'
</script>

<template>
  <section class="relative overflow-hidden text-white py-20">
    <div class="container mx-auto px-6 md:px-12 lg:px-20 flex flex-col items-center text-center">
      <Badge variant="outline" class="mb-4">Start Here</Badge>
      <h1 class="text-4xl md:text-5xl font-semibold text-foreground mb-6">
        CHOOSE IDEAL LOCATION <span class="text-accent">INSTANTLY</span>
      </h1>
      <p class="text-lg text-muted-foreground md:text-xl mb-8 max-w-2xl">
        An AI-powered system that helps choose business locations and connects local businesses in
        your city
      </p>
      <div class="flex gap-4">
        <Button as-child size="sm">
          <RouterLink to="/">Get Started</RouterLink>
        </Button>
        <Button as-child variant="ghost" size="sm">
          <RouterLink to="/learn-more">Learn More</RouterLink>
        </Button>
      </div>
    </div>
  </section>
</template>
