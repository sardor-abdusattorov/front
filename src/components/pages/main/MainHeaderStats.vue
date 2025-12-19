<script setup lang="ts">
import dayjs from 'dayjs'
import { getDashboardCounts } from '@/services/main/main.service'
import { MainDto } from '@/services/main/dto/main.dto'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import { formatMoney, getErrorMessage } from '@/utils/functions'

const { t } = useI18n()
const cardData = ref<MainDto>()
const CalendarDay = markRaw(defineAsyncComponent(() => import('@/assets/icons/calendar-days.svg')))
const Stories = markRaw(defineAsyncComponent(() => import('@/assets/icons/stories.svg')))
const Alert = markRaw(defineAsyncComponent(() => import('@/assets/icons/alert-triangle-svgrepo-com.svg')))
const User = markRaw(defineAsyncComponent(() => import('@/assets/icons/user-hand-up-svgrepo-com.svg')))
const Refresh = markRaw(defineAsyncComponent(() => import('@/assets/icons/restart-svgrepo-com.svg')))
const Dollar = markRaw(defineAsyncComponent(() => import('@/assets/icons/dollar-sign-svgrepo-com.svg')))
const CurrentDate = markRaw(defineAsyncComponent(() => import('@/assets/icons/time-update-svgrepo-com.svg')))
const isLoading = ref(false)
const cardList = ref([
  {
    title: t('sold_tickets.table.event'),
    icon: CalendarDay,
    value: cardData.value?.event_count,
    subIcon: CalendarDay
  },
  {
    title: t('ticketsForSal'),
    icon: Stories,
    value: cardData.value?.ticket_count,
    subIcon: CalendarDay
  },
  {
    title: t('tickets.soldTickets'),
    icon: Dollar,
    value: cardData.value?.ticket_pay_count,
    subIcon: CurrentDate
  },
  {
    title: t('halls.returnedTickets'),
    icon: Refresh,
    value: cardData.value?.ticket_return_count,
    subIcon: CurrentDate
  },
  {
    title: t('usedTickets'),
    icon: User,
    value: cardData.value?.ticket_done_count,
    subIcon: CurrentDate
  },
  {
    title: t('serviceFee'),
    icon: Alert,
    value: cardData.value?.fond_percent,
    subIcon: CurrentDate
  }
])

watch(cardData, (newVal: any) => {
  cardList.value = cardList.value.map((item, idx) => {
    return {
      ...item,
      value: newVal?.[Object.keys(newVal)[idx]]
    }
  })
})

const fetchData = async () => {
  try {
    isLoading.value = true
    const {
      data: { result }
    } = await getDashboardCounts()
    cardData.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    isLoading.value = false
  }
}

fetchData()
</script>

<template>
  <div class="main-cards">
    <h3 class="main-cards__title">{{ t('today') }}: {{ dayjs().format('DD.MM.YYYY') }}</h3>
    <v-row>
      <v-col v-for="(item, idx) in cardList" :key="idx" class="main-cards__header" cols="12" lg="2" md="4" sm="6">
        <v-card-item class="main-cards__card-icon">
          <component :is="item.icon" />
        </v-card-item>
        <v-card class="main-cards__card">
          <v-card-text class="main-cards__card-text">{{ item.title }}</v-card-text>
          <v-card-title class="main-cards__card-title">
            <v-skeleton-loader type="list-item-two-line" width="100%" v-if="isLoading"></v-skeleton-loader>

            <span v-else>{{ formatMoney(Number(item.value)) }}</span>
          </v-card-title>
          <v-card-text class="main-cards__card-calendar">
            <component :is="item.subIcon" />
            <span>{{ t('InTheLastDay') }}</span>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.main-cards__title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 400;
}
.main-cards__card-title {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
}
.main-cards__card-text {
  font-size: 12px;
  color: #999;
  font-weight: 400;
}

.main-cards__card-calendar {
  color: #999;
  font-size: 12px;
  line-height: 22px;
  border-top: 1px solid rgba(153, 153, 153, 0.22);
  width: 100%;
  padding-top: 10px;
  gap: 10px;
  display: flex;
  align-items: center;
}

.main-cards__card-calendar svg {
  height: 15px;
  width: 15px;
}

.main-cards__header {
  position: relative;
  margin-top: 10px;
}

.main-cards__card {
  display: flex;
  align-items: end;
  flex-direction: column;
}

.main-cards__card-icon {
  position: absolute;
  top: 5px;
  left: 25px;
  border-radius: 3px;
  background-color: #999;
  padding: 15px;
  z-index: 22;
  margin-top: -20px;
  margin-right: 15px;
  float: left;
  box-shadow:
    0 4px 20px 0 rgba(0, 0, 0, 0.14),
    0 7px 10px -5px rgba(156, 39, 176, 0.4);
  background-image: linear-gradient(to left, #0dcec9 0, #7e54c2 100%);
}

.main-cards__card-icon svg {
  height: 20px;
  width: 20px;
  color: #ffffff;
}
</style>
