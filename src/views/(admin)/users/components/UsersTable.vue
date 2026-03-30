<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { UserRow } from '@/views/(admin)/users/types/users-table.types'
import { USER_ROWS, USER_STATUS_CLASS } from '@/views/(admin)/users/utils/users-table.utils'
import { Pencil, Trash2 } from 'lucide-vue-next'

const rows: UserRow[] = USER_ROWS

const pageSize = 5
const currentPage = ref(1)

const totalPages = computed(() => Math.max(1, Math.ceil(rows.length / pageSize)))

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return rows.slice(start, start + pageSize)
})

const setPage = (page: number): void => {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
}

const previousPage = (): void => setPage(currentPage.value - 1)
const nextPage = (): void => setPage(currentPage.value + 1)
</script>

<template>
  <div class="space-y-4">
    <div class="overflow-hidden rounded-xl border bg-background">
      <Table class="min-w-[780px] text-left text-sm">
        <TableHeader>
          <TableRow
            class="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground hover:bg-muted/40"
          >
            <TableHead class="px-4 py-3 font-medium">ID</TableHead>
            <TableHead class="px-4 py-3 font-medium">Name</TableHead>
            <TableHead class="px-4 py-3 font-medium">Email</TableHead>
            <TableHead class="px-4 py-3 font-medium">Role</TableHead>
            <TableHead class="px-4 py-3 font-medium">Status</TableHead>
            <TableHead class="px-4 py-3 text-right font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="row in paginatedRows" :key="row.id">
            <TableCell class="px-4 py-3 font-medium">{{ row.id }}</TableCell>
            <TableCell class="px-4 py-3">{{ row.fullName }}</TableCell>
            <TableCell class="px-4 py-3 text-muted-foreground">{{ row.email }}</TableCell>
            <TableCell class="px-4 py-3">{{ row.role }}</TableCell>
            <TableCell class="px-4 py-3">
              <span
                class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                :class="USER_STATUS_CLASS[row.status]"
              >
                {{ row.status }}
              </span>
            </TableCell>
            <TableCell class="px-4 py-3">
              <div class="flex items-center justify-end gap-2">
                <Button size="sm" variant="outline">
                  <Pencil class="size-4" />
                  Edit
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 class="size-4" />
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Pagination class="justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            :class="currentPage === 1 ? 'pointer-events-none opacity-50' : ''"
            @click.prevent="previousPage"
          />
        </PaginationItem>

        <PaginationItem v-for="page in totalPages" :key="page">
          <PaginationLink href="#" :is-active="currentPage === page" @click.prevent="setPage(page)">
            {{ page }}
          </PaginationLink>
        </PaginationItem>

        <PaginationItem v-if="totalPages > 5">
          <PaginationEllipsis />
        </PaginationItem>

        <PaginationItem>
          <PaginationNext
            href="#"
            :class="currentPage === totalPages ? 'pointer-events-none opacity-50' : ''"
            @click.prevent="nextPage"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
</template>

<style scoped></style>
