<template>
  <div class="custom-collapse">
    <v-expansion-panels class="mb-4 mx-2 mt-1 custom-pannels" style="width: calc(100% - 12px)" v-model="panells">
      <v-expansion-panel class="custom-collapse__panel">
        <v-expansion-panel-title>
          <div class="custom-collapse__header">
            <div>
              <h2 class="pb-2">{{ t('tickets.orderNumber') }}</h2>
              <p>{{ list.orderId }}</p>
            </div>
            <div>
              <h2 class="pb-2">{{ t('tickets.dateOfPayment') }}</h2>
              <p>{{ dayjs(list.payDate).format(DATE_TIME_FORMAT) }}</p>
            </div>
            <div v-if="!isBooking">
              <h2 class="pb-2">{{ t('cash.paymentMethod') }}</h2>
              <p>{{ list[('paymentTypeName' + capitalize(locale)) as keyof CashSoldDto] }}</p>
            </div>
            <div v-if="!isBooking">
              <h2>{{ t('tickets.multiUseTicket') }}</h2>
              <v-checkbox-btn color="primary" class="w-25" readonly v-model="list.isMultiple"
                @click.stop></v-checkbox-btn>
            </div>
            <div v-if="!isBooking">
              <h2 class="pb-2">{{ t('tickets.printToOrder') }}</h2>
              <div class="d-flex ga-2">
                <base-button @click.stop="printTicket({ orderId: list.orderId, isMultiple: list.isMultiple })"
                  class="d-flex align-center justify-center"><i class="text-h6 mdi mdi-printer"></i></base-button>
                <v-dialog max-width="500px" v-if="!userStore.isTheatre">
                  <template v-slot:activator="{ props: activatorProps }">
                    <base-button v-if="listTicketsWithCheckbox.length > 1" v-bind="activatorProps"
                      @click="removeRejectTicketInfo(list.orderId)" class="d-flex align-center justify-center"><i
                        class="text-h6 mdi mdi-close"></i></base-button>
                  </template>
                  <template v-slot:default="{ isActive }">
                    <reject-ticket-dialog :rejectTicketInfo="rejectTicketInfo" @close="isActive.value = false" @reject="() => {
                      removeRejectTicket(list.orderId)
                      isActive.value = false
                    }
                      " />
                  </template>
                </v-dialog>
              </div>
            </div>
            <div v-if="isBooking">
              <h2 class="pb-2">{{ t('tickets.pay_for_tickets') }}</h2>
              <div class="d-flex ga-2">
                <base-button @click.stop="emit('payForTickets', list)" class="d-flex align-center justify-center"><i
                    class="text-h6 mdi mdi-shopping"></i></base-button>
              </div>
            </div>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="collapsed-table">
            <table>
              <thead>
                <tr>
                  <template v-for="header in tableHeaders" :key="header.key">
                    <template v-if="header.isVisible">
                      <th v-if="!list.isMultiple && header.key === 'checkbox'">
                        {{ header.title }}
                      </th>
                      <th v-else-if="header.key !== 'checkbox'" :style="{ minWidth: header.width + 'px' }">
                        {{ header.title }}
                      </th>
                    </template>
                  </template>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in listTicketsWithCheckbox" :key="item.eventTicketId">
                  <td v-if="!list.isMultiple">
                    <v-checkbox-btn v-model="item.checkbox" color="primary"
                      @update:modelValue="updateCheck(item, $event)" />
                  </td>
                  <td>
                    <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-btn class="move-btn" size="small" v-bind="props" icon="mdi-dots-vertical"></v-btn>
                      </template>
                      <v-list density="compact">
                        <template v-for="menu in isBooking ? bookingMenuList : menuList" :key="menu.key">
                          <v-list-item value="settings" class="cursor-pointer" v-if="menu.isMultiple"
                            @click="menuItemClick(item?.orderTicketId, menu?.key)">
                            <i class="mr-2 mdi" :class="menu.icon" v-if="menu.icon"></i>{{ menu.name }}
                          </v-list-item>
                          <v-list-item value="settings" class="cursor-pointer"
                            v-else-if="menu.key === 'swap' && item.isExchange && item.isRejectTicket"
                            @click="menuItemClick(item?.orderTicketId, menu?.key)">
                            <i class="mr-2 mdi" :class="menu.icon" v-if="menu.icon"></i>{{ menu.name }}
                          </v-list-item>
                        </template>
                      </v-list>
                    </v-menu>
                  </td>
                  <td>{{ item.ticketSerial || '-' }}</td>
                  <td v-if="userStore.isTheatre || userStore.isAgent">
                    {{ item.rowNumber || '-' }}/{{ item.seatNumber || '-' }}
                  </td>
                  <td>{{ item.palaceName || '-' }}</td>
                  <td>{{ item.eventName || '-' }}</td>
                  <td v-if="!isBooking">{{ item.tarifName || '-' }}</td>
                  <td class="no-wrap">{{ formatMoney(item.ticketSum) }}</td>
                  <td>{{ dayjs(item.eventBegin).format(DATE_TIME_FORMAT) }}</td>
                  <td>{{ item.fio || '-' }}</td>
                  <td>{{ item.phone || '-' }}</td>
                  <td>{{ item.pnfl || '-' }}</td>
                  <td v-if="!isBooking">
                    {{ list[('paymentTypeName' + capitalize(locale)) as keyof CashSoldDto] || '-' }}
                  </td>
                  <td>{{ dayjs(list.payDate).format(DATE_TIME_FORMAT) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    <div class="ticket">
      <div ref="ticketComponentRef">
        <theatre-ticket size="lg" v-if="userStore.isTheatre" />
        <museium-ticket size="lg" v-else />
      </div>
    </div>
  </div>
  <v-dialog v-model="dialog" width="auto">
    <reject-ticket-dialog :rejectTicketInfo="rejectTicketInfo" @close="dialog = false"
      @reject="makeTicketsRejected(ticketId)" />
  </v-dialog>
  <v-dialog v-model="dialogEmail" width="auto">
    <send-to-email-dialog @close="dialogEmail = false" :ticket-id="ticketId" />
  </v-dialog>
  <v-dialog v-model="swapDialogOpen" width="95vw" height="95vh">
    <swap-ticket-dialog :ticket-id="ticketId" @close="swapDialogOpen = false"
      @closeAndTriggerLoadData="(swapDialogOpen = false), emit('fetchData')" />
  </v-dialog>
</template>

<script lang="ts" setup>
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

import { capitalize, formatMoney, getErrorMessage, sleep } from '@/utils/functions'
import { DATE_TIME_FORMAT } from '@/constants/formats'
import { CashSoldDto, CashSoldTicketDto } from '@/services/cash/dto'
import {
  getMultipleTicketsRejectInfo,
  getTicketsByList,
  getTicketsByOrder,
  multipleTicketsReject,
  getTicketById,
  ticketsRejectInfo,
  ticketsReject,
  getTicketListPrinted,
  getTicketOrderPrinted
} from '@/services/ticket/ticket.service'
import { TicketParamsDto } from '@/services/ticket/dto/ticket.dto'
import { useCashierStore } from '@/stores/cashier.store'
import { useUserStore } from '@/stores/user.store'
import { STRUCTURES } from '@/constants/structures'

const panells = ref([0])
const { t, locale } = useI18n()
const props = defineProps<{ list: CashSoldDto; clearList: boolean; isBooking?: boolean }>()
const emit = defineEmits(['getTickets', 'fetchData', 'payForTickets', 'payOrder', 'deleteTicket'])
const rejectTicketInfo = ref<{ rejectSum: number; fineSum: number }>({ rejectSum: 0, fineSum: 0 })
const dialog = ref(false)

const ticketComponentRef = ref()
const ticketId = ref<number>(0)
const dialogEmail = ref(false)
const swapDialogOpen = ref(false)

const store = useCashierStore()
const userStore = useUserStore()

const listTicketsWithCheckbox = ref(
  props.list.ticketList.map((item) => ({
    ...item,
    checkbox: false
  }))
)

const menuList = ref([
  { name: t('tickets.print'), icon: 'mdi-printer', isMultiple: !props.list.isMultiple, key: 'print' },
  { name: t('tickets.download'), icon: 'mdi-download', isMultiple: !props.list.isMultiple, key: 'download' },
  ...(userStore.user?.structureId !== STRUCTURES.AGENT
    ? [
      { name: t('tickets.swap_ticket'), icon: 'mdi-swap-horizontal', isMultiple: false, key: 'swap' }
    ]
    : []),
  { name: t('tickets.reject'), icon: 'mdi-close-circle', isMultiple: !props.list.isMultiple, key: 'reject' },
  { name: t('tickets.send_email'), icon: 'mdi-email', isMultiple: true, key: 'email' }
])
const bookingMenuList = ref([
  { name: t('tickets.pay_for_order'), icon: 'mdi-shopping', isMultiple: !props.list.isMultiple, key: 'pay_order' },
  { name: t('tickets.delete_ticket'), icon: 'mdi-trash-can', isMultiple: !props.list.isMultiple, key: 'delete' }
])

const tableHeaders = ref([
  { title: t('sold_tickets.table.choose'), key: 'checkbox', width: null, isVisible: true },
  { title: t('sold_tickets.table.action'), key: 'action', width: null, isVisible: true },
  { title: t('sold_tickets.table.ticketSerialNumber'), key: 'ticketSerial', width: 200, isVisible: true },
  {
    title: t('sold_tickets.table.seat'),
    key: 'ticketSerial',
    width: 70,
    isVisible: userStore.isTheatre || userStore.isAgent
  },
  { title: t('sold_tickets.table.palace'), key: 'palaceName', width: 200, isVisible: true },
  { title: t('sold_tickets.table.event'), key: 'eventName', width: 200, isVisible: true },
  { title: t('sold_tickets.table.tarifName'), key: 'tarifName', width: 200, isVisible: !props.isBooking },
  { title: t('sold_tickets.table.price'), key: 'ticketSum', width: 150, isVisible: true },
  { title: t('sold_tickets.table.startDateEvent'), key: 'seatRow', width: 70, isVisible: true },
  { title: t('sold_tickets.table.fio'), key: 'fio', width: 250, isVisible: true },
  { title: t('sold_tickets.table.phone'), key: 'phone', width: 150, isVisible: true },
  { title: t('sold_tickets.table.pinfl'), key: 'pnfl', width: 150, isVisible: true },
  { title: t('sold_tickets.table.typePayment'), key: 'typePayment', width: 200, isVisible: !props.isBooking },
  { title: t('sold_tickets.table.datePayment'), key: 'datePayment', width: 150, isVisible: true }
])

const downloadTickets = async (id: number) => {
  await printTicketById(id, 'download')
  await downloadPDF()
  await sleep(200)
  store.tickets = []
}

const downloadPDF = async (): Promise<void> => {
  const ticketElement = ticketComponentRef.value as HTMLElement // Reference to your ticket component

  try {
    const canvas = await html2canvas(ticketElement)
    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)

    pdf.save('ticket.pdf')
  } catch (error) {
    toast.error('Error generating PDF:' + error)
  }
}

const menuItemClick = async (id: number, menu: string) => {
  switch (menu) {
    case 'print':
      printTicketById(id)
      break
    case 'download':
      downloadTickets(id)
      break
    case 'swap':
      swapDialogOpen.value = true
      ticketId.value = id
      break
    case 'reject':
      dialog.value = true
      await getSingleTicketRejectInfo(id)
      ticketId.value = id
      break
    case 'email':
      // TODO: add email dialog
      break
    case 'pay_order':
      emit('payOrder', id)
      break
    case 'delete':
      emit('deleteTicket', id)
      break
  }
}

const makeTicketsRejected = async (id: number) => {
  dialog.value = false
  try {
    const { data } = await ticketsReject(id)
    if (data.result.success) {
      toast.success(t('contract.successfully'))
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    emit('fetchData', id)
  }
}

const getSingleTicketRejectInfo = async (id: number) => {
  try {
    const { data } = await ticketsRejectInfo(id)
    rejectTicketInfo.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const printTicketById = async (id: number, action?: string) => {
  try {
    const { data } = await getTicketById(id)
    await getTicketListPrinted([id])
    if (action === 'download') {
      store.tickets?.push(data.result)
    } else {
      emit('getTickets', [data.result])
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const printTicket = async (dto: TicketParamsDto) => {
  try {
    if (dto.isMultiple) {
      const { data } = await getTicketsByOrder(dto)
      await getTicketOrderPrinted(dto.orderId)
      emit('getTickets', data.result)
    } else {
      if (store.selectedTicketIds.length === 0) {
        let ids = props.list.ticketList.map((ticket) => {
          return ticket.orderTicketId
        })
        const { data } = await getTicketsByList(ids)
        await getTicketListPrinted(ids)
        emit('getTickets', data.result)
      } else {
        const { data } = await getTicketsByList(store.selectedTicketIds)
        await getTicketListPrinted(store.selectedTicketIds)
        emit('getTickets', data.result)
        store.selectedTicketIds = []
        clearListCheckboxes()
      }
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const removeRejectTicketInfo = async (id: number) => {
  try {
    const {
      data: { result }
    } = await getMultipleTicketsRejectInfo(id)
    rejectTicketInfo.value = result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const removeRejectTicket = async (id: number) => {
  try {
    const {
      data: { result }
    } = await multipleTicketsReject(id)
    if (result.success) {
      toast.success(t('contract.successfully'))
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    emit('fetchData')
  }
}
const clearListCheckboxes = () => {
  listTicketsWithCheckbox.value = listTicketsWithCheckbox.value.map((item) => ({
    ...item,
    checkbox: false
  }))
}

const updateCheck = (item: CashSoldTicketDto, event: boolean) => {
  const orderTicketId = item.orderTicketId
  if (event) {
    store.selectedTicketIds.push(orderTicketId)
  } else {
    store.selectedTicketIds = store.selectedTicketIds.filter((id) => id !== orderTicketId)
  }
}

watch(
  () => props.clearList,
  () => {
    if (props.clearList) clearListCheckboxes()
  }
)
watch([dialog], () => {
  if (!dialog.value) rejectTicketInfo.value = { rejectSum: 0, fineSum: 0 }
})
</script>

<style>
body.dark-theme .custom-collapse {
  .v-expansion-panel-title:not(.v-expansion-panel-title--static) {
    background-color: rgba(33, 33, 33);
    box-shadow: 0 0 6px 2px rgba(0, 0, 0, 0.2);
  }
}

body.dark-theme .custom-collapse__header {
  background-color: rgba(33, 33, 33);
}

body.dark-theme table {
  background: rgba(33, 33, 33);
  box-shadow: 0 0 6px 2px rgba(0, 0, 0, 0.2);
}

body.dark-theme .move-btn {
  background: rgba(66, 66, 66);
}

.custom-collapse__header {
  background-color: #f7f7f9;
}

.custom-collapse {
  .v-expansion-panel-title:not(.v-expansion-panel-title--static) {
    background-color: #f7f7f9;
  }
}
</style>
