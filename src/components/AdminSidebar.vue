<script setup lang="ts">
import {
  BarChart3,
  Bell,
  FileText,
  LayoutDashboard,
  Map,
  Settings,
  Shield,
  Users,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { AdminSidebarIconName } from '@/types/admin-sidebar.types'
import { managementAdminNavItems, primaryAdminNavItems } from '@/utils/admin-sidebar-nav'

const route = useRoute()

const iconMap: Record<AdminSidebarIconName, Component> = {
  dashboard: LayoutDashboard,
  map: Map,
  report: FileText,
  analytics: BarChart3,
  users: Users,
  roles: Shield,
  notifications: Bell,
  settings: Settings,
}

const isActive = (itemPath: string): boolean => {
  if (itemPath === '/admin') {
    return route.path === '/admin'
  }

  return route.path.startsWith(itemPath)
}
</script>

<template>
  <aside class="hidden w-72 shrink-0 border-r bg-card md:block">
    <div class="flex h-full flex-col">
      <div class="border-b px-6 py-5">
        <h2 class="text-base font-semibold tracking-wide">Admin Panel</h2>
        <p class="mt-1 text-xs text-muted-foreground">Manage your operations</p>
      </div>

      <nav class="flex-1 space-y-6 px-4 py-5">
        <section>
          <p class="px-2 pb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Overview
          </p>
          <ul class="space-y-1">
            <li v-for="item in primaryAdminNavItems" :key="item.to">
              <RouterLink
                :to="item.to"
                class="hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
                :class="
                  isActive(item.to)
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                    : 'text-muted-foreground'
                "
              >
                <component :is="iconMap[item.icon]" class="h-4 w-4" />
                <span>{{ item.label }}</span>
              </RouterLink>
            </li>
          </ul>
        </section>

        <section>
          <p class="px-2 pb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Administration
          </p>
          <ul class="space-y-1">
            <li v-for="item in managementAdminNavItems" :key="item.to">
              <RouterLink
                :to="item.to"
                class="hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
                :class="
                  isActive(item.to)
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                    : 'text-muted-foreground'
                "
              >
                <component :is="iconMap[item.icon]" class="h-4 w-4" />
                <span>{{ item.label }}</span>
              </RouterLink>
            </li>
          </ul>
        </section>
      </nav>
    </div>
  </aside>
</template>
