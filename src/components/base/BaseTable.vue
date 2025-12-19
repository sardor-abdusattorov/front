<template>
  <div class="base-table">
    <div class="table-container">
      <table>
        <thead>
          <tr class="table-header">
            <th :key="idx" v-for="(header, idx) in tableHeader" :class="header.role">{{ header.text }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in tableBody"
            :key="rowIndex"
            :class="activeTableId && activeTableId === row.id ? 'active' : ''"
          >
            <td v-for="header in tableHeader" :key="header.key" :class="header.role">
              <template v-if="header.role === 'text'"
                >{{ header.render ? header.render(row) : row[header.key] || '-' }}
              </template>
              <template v-if="header.role === 'langText'">
                {{ row[header.key + capitalize(locale)] }}
              </template>
              <template v-if="header.role === 'statusLangText'">
                <p :class="`contractStatus${row[header.id]}`">{{ t(row[header.key + capitalize(locale)]) }}</p>
              </template>
              <template v-if="header.role === 'orgStatus'">
                <p :class="`orgStatus${row[header.key]}`">
                  {{ orgStatusList[row[header.key] as '1' | '2' | '3' | '4'] }}
                </p>
              </template>
              <template v-if="header.role === 'invoiceStatus'">
                <p :class="`invoiceStatus${row[header.key]}`">
                  {{ invoiceStatusList[row[header.key] as '1' | '2' | '3' | '4'] }}
                </p>
              </template>
              <template v-if="header.role === 'action'">
                <v-menu
                  v-if="
                    (header.isVisible === undefined ||
                    (typeof header.isVisible === 'boolean' ? header.isVisible : header.isVisible(row))) && hasVisibleMenuItems(row)
                  "
                >
                  <template v-slot:activator="{ props }">
                    <v-btn class="move-btn" size="small" v-bind="props" icon="mdi-dots-vertical"></v-btn>
                  </template>
                  <v-list density="compact">
                    <template v-for="menu in menuList" :key="menu.id">
                      <v-list-item
                        value="settings"
                        class="cursor-pointer"
                        @click="
                          emit('clickMenuHandler', { id: row.id, nameId: menu.id, active: row.active, item: row })
                        "
                        v-if="
                          menu.isVisible === undefined ||
                          (typeof menu.isVisible === 'boolean' ? menu.isVisible : menu.isVisible(row))
                        "
                      >
                        <i class="mr-2 mdi" :class="menu.icon" v-if="menu.icon"></i>{{ menu.name }}
                      </v-list-item>
                    </template>
                  </v-list>
                </v-menu>
                <slot name="action" :row="row" :index="rowIndex"></slot>
              </template>
              <template v-if="header.role === 'index'">
                <div>{{ rowIndex + 1 + pagination?.page! * 10 }}</div>
              </template>
              <template v-if="header.role === 'btnAction'">
                <slot name="btnAction" :row="row" :index="rowIndex"></slot>
              </template>
              <template v-if="header.role === 'checkbox'">
                <v-checkbox disabled v-model="row[header.key]" hide-details />
              </template>
              <template v-if="header.role === 'image'"
                ><img class="table-image" :src="getFileUrl(row[header.key])"
              /></template>
              <template v-if="header.role === 'status'">
                <span>
                  {{ row[header.key] === true ? t('active') : t('inactive') }}
                </span>
              </template>
              <template v-if="header.role === 'scan'">
                <div v-if="row[header.key]" @click="emit('clickScan', row[header.key])" class="scan_link">
                  <i class="mdi mdi-tray-arrow-down"></i>
                </div>
              </template>
              <template v-if="header.role === 'sum'">{{ formatMoney(row[header.key]) }}</template>
              <template v-if="header.role === 'time'">{{ timeFormat(row[header.key]) }}</template>
              <template v-if="header.role === 'date'">{{ dateFormat(row[header.key]) }}</template>
              <template v-if="header.role === 'date-time'"
                >{{ dateFormat(row[header.key]) }} {{ timeFormat(row[header.key]) }}
              </template>
              <template v-if="header.role === 'dataTime'">{{
                row[header.key] ? dataTimeFormat(row[header.key]) : '-'
              }}</template>
              <template v-if="header.role === 'phone'">
                <a :href="`tel:${row[header.key]}`" class="phone" v-if="row[header.key]">{{
                  phoneFormat(row[header.key])
                }}</a>
                <template v-else> -</template>
              </template>
              <template v-if="header.role === 'preview'">
                <div class="preview" @click="emit('clickPreview', row, header.key)">
                  {{ row[header.key] ? row[header.key] : t('events.menu.view') }}
                </div>
              </template>
              <template v-if="header.role === 'color'">
                <div class="color" :style="{ backgroundColor: row[header.key] }"></div>
              </template>
              <template v-if="header.role === 'radio'">
                <input
                  v-if="
                    header.isVisible === undefined ||
                    (typeof header.isVisible === 'boolean' ? header.isVisible : header.isVisible(row))
                  "
                  class="input-radio"
                  type="radio"
                  color="primary"
                  name="radio"
                  :value="row.id"
                  :checked="radioValue === row.id"
                  @change="emit('radioChange', row)"
                />
              </template>
              <template v-if="header.role === 'fiscal'">
                <base-button :href="row[header.key]" target="_blank" v-if="row[header.key]">
                  <v-icon class="mdi mdi-eye"></v-icon>
                </base-button>
                <template v-else> -</template>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <v-pagination
      v-if="pagination && pagination.total > 1"
      class="base-pagination"
      :style="{ width: pagination.width }"
      :class="{ wide: !userStore.isSidebarOpen && lgAndUp, custom: pagination.setCustomClass }"
      rounded="circle"
      density="comfortable"
      active-color="#8e24aa"
      total-visible="5"
      :value:model-value="pagination.page"
      :length="pagination.total"
      @update:model-value="pagination.pageClickHandler($event)"
    ></v-pagination>
  </div>
  <base-empty class="empty" v-if="tableBody?.length === 0 && !isLoading" />
</template>

<script lang="ts" setup>
import type { TableHeaderTypes, TableActionListType, TablePaginationType } from '@/types/table.types'
import dayjs from 'dayjs'
import { capitalize, formatMoney } from '../../utils/functions'
import { useResource } from '@/composables/use-resource'
import { useUserStore } from '@/stores/user.store'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  tableHeader: TableHeaderTypes[]
  tableBody: any[]
  menuList?: TableActionListType[]
  pagination?: TablePaginationType
  radioValue?: any
  isLoading?: boolean
  activeTableId?: number
}>()

const userStore = useUserStore()
const { lgAndUp } = useDisplay()
const { getFileUrl } = useResource()
const { t, locale } = useI18n()
const emit = defineEmits(['clickMenuHandler', 'update:currentPage', 'clickScan', 'clickPreview', 'radioChange'])

const orgStatusList = ref({
  '1': t('new'),
  '2': t('approved'),
  '3': t('rejected'),
  '4': t('edited')
})

const invoiceStatusList = ref({
  '1': t('new'),
  '2': t('sended'),
  '3': t('approved'),
  '4': t('rejected')
})

const hasVisibleMenuItems = (row: any) => {
      return props.menuList?.some((menu) => {
        if (menu.isVisible === undefined) return true;
        if (typeof menu.isVisible === 'boolean') return menu.isVisible;
        return menu.isVisible(row);
      });
    };

const timeFormat = (row: string) => {
  return dayjs(row).format('HH:mm')
}
const dateFormat = (row: string) => {
  return dayjs(row).format('DD.MM.YYYY')
}

const dataTimeFormat = (row: string) => {
  return dayjs(row).format('DD.MM.YYYY | HH:mm')
}

const phoneFormat = (row: string) => {
  return row
}
</script>

<style scoped lang="scss">
@import '@/styles/mixins.scss';

body.dark-theme .base-pagination {
  background: rgba(33, 33, 33);
}
body.dark-theme .scan_link {
  color: #fff;
}

body.dark-theme thead {
  background: rgba(33, 33, 33);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
}

body.dark-theme tbody tr {
  background: rgba(33, 33, 33);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
}

body.dark-theme .move-btn {
  background: rgba(66, 66, 66);
}

.base-table {
  position: relative;
  display: inline-flex;
  flex-direction: column;

  & .base-pagination {
    position: sticky;
    bottom: 0;
    left: 0;
    width: calc(100vw - 296px);
    background: white;

    &.custom {
      margin-top: 0 !important;
      width: 100% !important;
    }

    &.wide {
      width: 100vw;
    }

    @media (max-width: 1280px) {
      width: 100vw;
    }
    @include _575-block {
      position: fixed;
      left: 0;
      width: 100%;
    }
  }
}

.table-container {
  width: 100%;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  display: flex;
  flex-wrap: wrap;
  background: #fff;
  padding: 0 15px;
  border-radius: 0.25rem;
  box-shadow: 0 6px 10px rgba(212, 194, 240, 0.2);
}

thead {
  position: sticky;
  top: 0;
  z-index: 1;
}

thead tr {
  text-align: left;
  font-size: 0.85rem;
  font-weight: bold;
}

tbody tr {
  display: flex;
  flex-wrap: wrap;
  margin: 10px 0;
  background: #fff;
  padding: 0 15px;
  border-radius: 0.25rem;
  box-shadow: 0 6px 10px rgba(212, 194, 240, 0.2);
  position: relative;
}

th,
td {
  padding: 12px 12px;
  text-align: left;
  font-size: 0.85rem;
}

th:not(.action),
td:not(.action) {
  width: 200px;
}

th.action,
td.action {
  width: 100px;
  text-align: center;
}

th:not(:last-child) {
  border-right: 1px solid #eee;
}

tbody {
  display: block;
}

thead,
tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.move-btn {
  background-color: #eee;
  box-shadow: none;
}

td.preview {
  color: #9c27b0;
  cursor: pointer;
}

.color {
  width: 56px;
  height: 28px;
  border-radius: 4px;
}

.table-image {
  width: 100px;
  height: 75px;
  object-fit: cover;
  object-position: center;
  display: block;
}

.table-status-colot.status-default {
  color: #000;
}

.table-status-color.status-new {
  color: #007bff;
}

.table-status-color.status-sent {
  color: #ffc107;
}

.table-status-color.status-confirmed {
  color: #28a745;
}

.table-status-color.status-canceled {
  color: #dc3545;
}

.input-radio {
  display: block;
  width: 18px;
  height: 18px;
  cursor: pointer;
  margin-left: 12px;
}

.scan_link {
  font-size: 25px;
  color: #000;
  text-align: center;
  margin-left: 20px;
  cursor: pointer;
}

tr.active {
  background: rgba(0, 206, 201, 0.2);
}

.invoiceStatus1 {
  color: #007bff !important;
}

.invoiceStatus2 {
  color: #ffc107 !important;
}

.invoiceStatus3 {
  color: #28a745 !important;
}

.invoiceStatus4 {
  color: #dc3545 !important;
}

.orgStatus1 {
  color: #007bff !important;
}

.orgStatus2 {
  color: #28a745 !important;
}

.orgStatus3 {
  color: #dc3545 !important;
}

.orgStatus4 {
  color: #ffc107 !important;
}

.contractStatus1 {
  color: #007bff !important;
}

.contractStatus2 {
  color: #ffc107 !important;
}

.contractStatus3 {
  color: #28a745 !important;
}

.contractStatus4 {
  color: #dc3545 !important;
}

.contractStatus5 {
  color: #dc3545 !important;
}
</style>
