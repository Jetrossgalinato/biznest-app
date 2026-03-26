<script setup lang="ts">
import { Clock3, Mail, MapPin } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import logoImage from '@/assets/images/logo.png'

defineOptions({
  name: 'AppFooter',
})

const currentYear = new Date().getFullYear()

interface FooterQuickLink {
  label: string
  to: string
}

interface FooterLegalLink {
  label: string
  href: string
}

const quickLinks: FooterQuickLink[] = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Get Started', to: '/login' },
]

const legalLinks: FooterLegalLink[] = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Cookie Preferences', href: '#' },
]
</script>

<template>
  <footer class="mt-16 border-t border-border/80 bg-background/95">
    <div class="mx-auto w-full max-w-screen-2xl px-4 py-10">
      <div class="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div class="space-y-4">
          <RouterLink to="/" class="inline-flex items-center gap-3 text-foreground">
            <span
              class="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ring-1 ring-border"
            >
              <img :src="logoImage" alt="BizNest logo" class="h-full w-full object-contain" />
            </span>
            <span class="text-xl font-semibold tracking-wide">BizNest</span>
          </RouterLink>
          <p class="max-w-sm text-sm leading-relaxed text-muted-foreground">
            A location intelligence platform that helps founders pick the right place, launch with
            confidence, and grow with local insights.
          </p>
        </div>

        <div>
          <h3 class="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
            Quick Links
          </h3>
          <ul class="mt-4 space-y-2 text-sm text-muted-foreground">
            <li v-for="link in quickLinks" :key="link.label">
              <RouterLink
                :to="link.to"
                class="transition-colors duration-200 hover:text-foreground"
              >
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">Contact</h3>
          <ul class="mt-4 space-y-3 text-sm text-muted-foreground">
            <li class="flex items-start gap-2">
              <Mail class="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <a
                href="mailto:hello@biznest.app"
                class="transition-colors duration-200 hover:text-foreground"
              >
                hello@biznest.app
              </a>
            </li>
            <li class="flex items-start gap-2">
              <MapPin class="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span>Remote-first team, serving local entrepreneurs globally</span>
            </li>
            <li class="flex items-start gap-2">
              <Clock3 class="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span>Mon to Fri, 9:00 AM to 6:00 PM</span>
            </li>
          </ul>
        </div>
      </div>

      <div
        class="mt-8 flex flex-col gap-3 border-t border-border/70 pt-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
      >
        <p>Copyright {{ currentYear }} BizNest. All rights reserved.</p>
        <div class="flex flex-wrap items-center gap-4">
          <a
            v-for="link in legalLinks"
            :key="link.label"
            :href="link.href"
            class="transition-colors duration-200 hover:text-foreground"
          >
            {{ link.label }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
