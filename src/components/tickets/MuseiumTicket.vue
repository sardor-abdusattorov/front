<template>
  <div class="container" v-for="ticket in tickets" :key="ticket.receipId" :style="size === 'lg' && 'width: 700px'">
    <div class="header" style="border-bottom: 1px solid #333">
      <p class="theatre_name" style="border-bottom: 1px solid #333; padding: 10px 0 5px; margin-bottom: 5px">
        {{ ticket.systemOwnerName || '-' }}
      </p>
      <p class="theatre_name">{{ ticket.eventOrgName || '-' }}</p>
      <p class="theatre_name">{{ ticket.palaceName || '-' }}</p>
      <p class="theatre_address">{{ ticket.palaceAddressName || '-' }}</p>
      <p class="theatre_cashier">Кассир: {{ ticket.cashierFullName || '-' }}</p>
      <div class="stir">
        <p>ИНН: {{ ticket.cashierTin || '-' }}</p>
        <p>Тел.: {{ ticket.palacePhone || '-' }}</p>
      </div>
    </div>
    <div class="ticket_info" style="border-bottom: 1px solid #333">
      <div class="ticket_info_item">
        <h2>Номер заказа</h2>
        <p>{{ ticket.orderId || '-' }}</p>
      </div>
      <div class="ticket_info_item">
        <h2>Тип билета</h2>
        <p>{{ ticket.ticketType || '-' }}</p>
      </div>
      <div class="ticket_info_item">
        <h2>Количество билетов</h2>
        <p>{{ ticket.ticketCount || '-' }}</p>
      </div>
      <div class="ticket_info_item">
        <h2>Покупатель</h2>
        <p>{{ ticket.fullName || '-' }}</p>
      </div>
      <div class="ticket_info_item">
        <h2>Время покупки</h2>
        <p>{{ ticket.payDate || '-' }}</p>
      </div>
    </div>
    <div class="ofd_info" style="border-bottom: 1px dashed #333" v-for="ticketItem in ticket.ticketItems"
      :key="ticketItem.name">
      <div class="ticket_info_item" style="flex-direction: column">
        <p style="font-weight: bold">
          {{ ticketItem.name }} <span v-if="ticketItem.packageName">{{ ticketItem.packageName }}</span>
        </p>
        <p style="text-align: end" v-if="showPrice">
          {{ ticketItem.amount }}шт*{{ formatMoney(ticketItem.ticketPrice) }} = {{ formatMoney(ticketItem.price) }}
        </p>
      </div>
      <div class="ticket_info_item" v-if="showPrice">
        <p>НДС/Процент НДС</p>
        <p>{{ ticketItem.vat.toFixed(2) }} / {{ ticketItem.vatPercent }}%</p>
      </div>
      <div class="ticket_info_item">
        <p>Штрих код</p>
        <p>{{ ticketItem.packageCode || '-' }}</p>
      </div>
      <div class="ticket_info_item">
        <p>ИКПУ</p>
        <p>{{ ticketItem.spic || '-' }}</p>
      </div>
      <div class="ticket_info_item" v-if="showPrice">
        <p>Скидка</p>
        <p>{{ formatMoney(ticketItem.discount) }}</p>
      </div>
      <div class="ticket_info_item">
        <p>Комитент ИНН</p>
        <p>{{ ticketItem.tin || '-' }}</p>
      </div>
    </div>
    <div class="ticket_info_item" v-if="showPrice">
      <p>Наличные</p>
      <p>{{ formatMoney(ticket.receivedCash) }}</p>
    </div>
    <div class="ticket_info_item" v-if="showPrice">
      <p>Безналичные</p>
      <p>{{ formatMoney(ticket.receivedCard) }}</p>
    </div>
    <div class="ticket_info_item" v-if="showPrice">
      <h2>Всего получено</h2>
      <p style="font-weight: bold">{{ formatMoney(ticket.ticketSum) }} {{ ticket.currency }}</p>
    </div>
    <div class="ticket_info_item" style="border-bottom: 1px dashed #333" v-if="showPrice">
      <p>Общий НДС/Процент НДС</p>
      <p>{{ ticket.totalVAT.toFixed(2) }} / {{ ticket.totalVATPercent || 0 }}%</p>
    </div>
    <div class="ticket_info_item">
      <h2>Номер чека</h2>
      <p>{{ ticket.receipId || '-' }}</p>
    </div>
    <div class="ticket_info_item">
      <h2>ФМ</h2>
      <p>{{ ticket.terminalId || '-' }}</p>
    </div>
    <div class="ticket_info_item" style="border-bottom: 1px solid #333">
      <h2>ФП</h2>
      <p>{{ ticket.fiscalSign || '-' }}</p>
    </div>
    <div class="ticket_info_item" v-if="ticket.note">
      <h2 class="ticket_duplicate--text">{{ ticket.note }}</h2>
    </div>
    <div class="qr-code" style="text-align: center; padding-top: 5px">
      <p style="font-size: 12px; margin-bottom: 10px" v-if="ticket.receipId">
        Вы имеете право на кэшбэк в размере 1% от суммы покупки. Держите билет при себе, пока не покинете здание.
      </p>
      <qrcode-vue :value="ticket.generateCode" :size="125" level="L" />
    </div>
    <div v-if="ticket.note" class="ticket_duplicate">{{ ticket.note }}</div>
  </div>
</template>

<script lang="ts" setup>
import QrcodeVue from 'qrcode.vue'
import { useCashierStore } from '@/stores/cashier.store'
import { storeToRefs } from 'pinia'
import { formatMoney } from '@/utils/functions'

withDefaults(defineProps<{ size?: string; showPrice?: boolean }>(), {
  showPrice: true
})

const store = useCashierStore()

const { tickets } = storeToRefs(store)
</script>

<style scoped lang="css">
@font-face {
  font-family: 'Ticket-font';
  src: url('@/assets/fonts/Ticketing-font.ttf');
  font-display: fallback;
}

@font-face {
  font-family: 'Century-Gothic';
  src: url('@/assets/fonts/Century-Gothic.ttf');
  font-display: fallback;
}

@font-face {
  font-family: 'Odudo-Regular';
  src: url('@/assets/fonts/Odudo-Regular.otf');
  font-display: fallback;
}

@font-face {
  font-family: 'NunitoSans-Regular';
  src: url('@/assets/fonts/NunitoSans-Regular.ttf');
  font-display: fallback;
}

*,
*::after,
*::before {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'NunitoSans-Regular';
  padding-top: 100px;
  color: #000 !important;
}

.container {
  width: 303px;
  margin-left: auto;
  margin-right: auto;
  padding: 10px 20px 10px 5px;
  position: relative;
  color: #000 !important;
}

.logo_container img {
  width: 100%;
}

.header {
  text-align: center;
  margin-bottom: 4px;
}

.stir {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 12px;
}

.event_name {
  font-size: 20px;
  font-weight: bold;
  /* margin-bottom: 10px; */
}

.theatre_name,
.theatre_address {
  font-weight: bold;
}

.theatre_cashier {
  text-align: start;
}

.theatre_name,
.theatre_address,
.theatre_cashier {
  font-size: 12px;
}

.ticket_info_item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 3px 0;
}

.ticket_info_item h2,
.ticket_info_item p {
  font-size: 14px;
}

.ticket_duplicate {
  font-size: 40px;
  font-weight: 900;
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -30%) rotate(-90deg);
  text-transform: uppercase;
  opacity: 0.3;
  letter-spacing: 8px;
}

.ticket_duplicate--text {
  font-weight: bold;
  width: 100%;
  text-align: center;
  font-size: 22px !important;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: 6px 0 0;
}
</style>
