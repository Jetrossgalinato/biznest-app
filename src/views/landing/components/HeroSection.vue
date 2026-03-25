<script lang="ts" setup>
defineOptions({
  name: 'HeroSection',
})

import Badge from '@/components/ui/badge/Badge.vue'
import Button from '@/components/ui/button/Button.vue'
import TypographyH1 from '@/components/typography/TypographyH1.vue'
import TypographyMuted from '@/components/typography/TypographyMuted.vue'
</script>

<template>
  <section class="relative overflow-hidden text-white py-20">
    <div
      class="container mx-auto px-6 md:px-12 lg:px-20 mt-18 flex flex-col items-center text-center"
    >
      <Badge variant="outline" class="mb-4">Start Here</Badge>
      <TypographyH1 class="mb-2">
        CHOOSE IDEAL LOCATION <span class="text-accent">INSTANTLY</span>
      </TypographyH1>
      <TypographyMuted class="text-lg md:text-xl mb-4 max-w-2xl">
        An AI-powered system that helps choose business locations and connects local businesses in
        your city
      </TypographyMuted>
      <div class="flex gap-4">
        <Button as-child size="sm">
          <RouterLink to="/">Join Us</RouterLink>
        </Button>
        <Button as-child variant="ghost" size="sm">
          <RouterLink to="/learn-more">Learn More</RouterLink>
        </Button>
      </div>
    </div>
  </section>
</template>
