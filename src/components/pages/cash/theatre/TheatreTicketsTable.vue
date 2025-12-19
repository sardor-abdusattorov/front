<template>
  <div class="overflow-auto mt-3">
    <table class="table table-report table-bordered">
      <thead>
        <tr>
          <th v-for="th in tableHeader" :key="th.id" :style="{ minWidth: `${th.width}px` }">{{ th.text }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ticket in store.theatreTickets" :key="ticket.eventTicketId">
          <td class="pt-3">
            <v-btn icon="mdi-trash-can" @click="removeTicketHandler(ticket.orderTicketId)" color="red"
              class="text-white" size="small"></v-btn>
          </td>
          <td>{{ ticket.ticketSerial }}</td>

          <td>{{ ticket.rowNumber }}/{{ ticket.seatNumber }}</td>
          <td>{{ ticket.eventName }}</td>
          <td>{{ ticket['verificationStatusName' + capitalize(locale)] }}</td>
          <td>
            <base-input v-model="ticket.fullName" :placeholder="t('sold_tickets.table.fio')"></base-input>
          </td>
          <td>
            <base-mask-input v-model="ticket.phone" :placeholder="t('sold_tickets.table.phone')" />
          </td>
          <td>
            <base-mask-input v-model="ticket.passportPnfl" :placeholder="t('sold_tickets.table.pinfl')"
              :options="{ mask: '#-######-###-###-#' }" />
          </td>
          <td>
            <base-mask-input v-model="ticket.passportSerial" :placeholder="t('sold_tickets.table.passport_serial')"
              :options="{ mask: '@@' }" :is-string="true" />
          </td>
          <td>
            <base-mask-input v-model="ticket.passportNumber"
              :placeholder="t('sold_tickets.table.passport_serial_number')" :options="{ mask: '#######' }" />
          </td>
          <td>
            <base-select v-model="ticket.eventPrivilegesId" @update:model-value="handleBenefitChange(ticket)"
              item-title="name" item-value="id" :items="ticket.eventPrivilegesList" :placeholder="t('benefit')" />
          </td>
          <td class="text-subtitle-1">{{ formatMoney(ticket.ticketSum) }} UZS</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td class="text-subtitle-2">{{ t('cash.total') }}: {{ store.theatreTickets.length }}</td>
          <td class="text-right text-subtitle-1 font-weight-bold" colspan="10">{{ formatMoney(totalSum) }} UZS</td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { getTicketPrivRound, removeTicket } from '@/services/cash/cash.service'
import { TheatreTicketModel } from '@/services/cash/model'
import { useCashierStore } from '@/stores/cashier.store'
import { useCountDown } from '@/stores/countdown.store'
import { capitalize, formatMoney, getErrorMessage } from '@/utils/functions'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

const { t, locale } = useI18n()


const handleChange = (e: any) => {
  console.log('Event:', e)
}

const tableHeader = ref([
  { text: t('sold_tickets.table.action'), width: 100, id: 1 },
  { text: t('sold_tickets.table.ticketSerialNumber'), width: 130, id: 2 },
  { text: t('sold_tickets.table.seat'), width: 70, id: 3 },
  { text: t('sold_tickets.table.event'), width: 250, id: 11 },
  { text: t('events.status'), width: 130, id: 4 },
  { text: t('sold_tickets.table.fio'), width: 250, id: 5 },
  { text: t('sold_tickets.table.phone'), width: 250, id: 12 },
  { text: t('sold_tickets.table.pinfl'), width: 250, id: 6 },
  { text: t('sold_tickets.table.passport_serial'), width: 250, id: 7 },
  { text: t('sold_tickets.table.passport_serial_number'), width: 250, id: 8 },
  { text: t('benefit'), width: 250, id: 9 },
  { text: t('sold_tickets.table.price'), width: 130, id: 10 }
])

const store = useCashierStore()
const cdStore = useCountDown()

import { computed } from 'vue';

const totalSum = computed(() => {
  return store.theatreTickets.reduce((acc, ticket) => acc + ticket.ticketSum, 0);
});

const calculateDiscountedTicketSum = async (ticket: TheatreTicketModel) => {
  if (ticket.eventPrivilegesId === -1) return ticket.ticketSum;

  const selectedPrivilege = ticket.eventPrivilegesList.find(
    (privilege) => privilege.id === ticket.eventPrivilegesId
  );

  if (!selectedPrivilege || !selectedPrivilege.rate) {
    return ticket.ticketSum;
  }

  console.log('Selected privilege:', ticket);

  const { data: { result: discount } } = await getTicketPrivRound(ticket.realTicketSum, selectedPrivilege.rate, ticket.privilegesRound);
  return discount.ticketSum;
};

const handleBenefitChange = async (ticket: TheatreTicketModel) => {
  let ticketSum;

  if (ticket.eventPrivilegesId) {
    ticketSum = await calculateDiscountedTicketSum(ticket);
  } else {
    ticketSum = ticket.realTicketSum;
  }

  const index = store.theatreTickets.findIndex(t => t.eventTicketId === ticket.eventTicketId);

  if (index !== -1) {
    store.theatreTickets[index].ticketSum = ticketSum;
  } else {
    console.warn('Ticket not found in store.theatreTickets:', ticket);
  }
};


const removeTicketHandler = async (orderTicketId: number) => {
  try {
    const { data } = await removeTicket(orderTicketId)
    if (data.result.success) {
      const removedTicket = store.theatreTickets.find(
        (item) => item.orderTicketId === orderTicketId
      );
      if (removedTicket) {
        store.deletedTickets = [...store.deletedTickets, removedTicket];
      }
      store.theatreTickets = store.theatreTickets.filter((item) => item.orderTicketId !== orderTicketId)

      toast.warning(t('messages.deleted_success'))
      if (store.theatreTickets.length === 0) {
        cdStore.countdown.isVisible = false
        clearInterval(cdStore.countdownInterval)
      }
    }
  } catch (err) {
    toast.error(getErrorMessage(err))
  }
}
</script>

<style lang="scss" scoped>
.table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  border: 1px solid #ddd;
}

td,
th {
  border: 1px solid #ddd;
  padding: 16px;
  font-size: 14px;
  text-align: center;
}

th {
  font-size: 12px;
  letter-spacing: 0.2px;
  white-space: nowrap;
}
</style>
