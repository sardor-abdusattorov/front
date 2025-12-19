<template>
  <div class="wrapper">
    <div>
      <div class="d-flex justify-space-between ga-2 align-center">
        <h2>
          {{ event?.name }}
        </h2>
        <span style="white-space: nowrap"
          >{{ dayjs(event?.beginDate).format('DD.MM.YYYY') }} - {{ dayjs(event?.endDate).format('DD.MM.YYYY') }}</span
        >
      </div>
      <router-view />
    </div>

    <session-instruction />
  </div>
</template>

<script lang="ts" setup>
import { CreateEventModel } from '@/services/events/dto/events.dto'
import { getEventById } from '@/services/events/events.service'
import { getErrorMessage } from '@/utils/functions'
import { toast } from 'vue3-toastify'
import { PERMISSIONS } from '@/constants/permissions'
import dayjs from 'dayjs'
import { useEventsStore } from '@/stores/events.store'

const event = ref<CreateEventModel>()
const route: any = useRoute()

const store = useEventsStore()

definePage({
  meta: {
    permission: PERMISSIONS.EVENTS
  }
})

const fetchEventById = async () => {
  try {
    const { data } = await getEventById(+route.params.id)
    event.value = data.result
    store.storedEvent = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}
fetchEventById()
</script>

<style lang="scss" scoped>
@import '@/styles/mixins.scss';
.wrapper {
  display: grid;
  grid-template-columns: 70% 28%;
  gap: 24px;
  @include _1199-block {
    display: flex;

    flex-direction: column-reverse;
  }
}
h2 {
  min-height: 36px;
}
</style>
