<template>
  <base-title :title="isEdit ? t('sessions.edit_session') : t('sessions.add_session')" :back="true" />
  <v-card class="pa-4">
    <v-form v-model="isValid" @submit.prevent="handleSubmit">
      <v-row>
        <v-col cols="12">
          <base-input v-model="form.name" :placeholder="t('halls.name')" :rules="[rules.required]" />
        </v-col>

        <v-col cols="12" md="4">
          <base-date-input name="eventBegin" v-model="form.eventBegin" :rules="[rules.required]"
            :placeholder="t('sessions.sessionBeginDate')" @update:model-value="updateEventBegin" />
        </v-col>
        <v-col cols="12" md="4">
          <base-time-input :label="t('sessions.from')" v-model="eventStartTime" :rules="[rules.required]" />
        </v-col>
        <v-col cols="12" md="4">
          <base-time-input :label="t('sessions.to')" v-model="eventEndTime" :rules="[rules.required]" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="4">
          <base-date-input name="beginSale" v-model="form.beginSale" :rules="[rules.required]"
            :placeholder="t('sessions.sessionBeginSaleDate')" />
        </v-col>
        <v-col cols="12" md="4">
          <base-time-input v-model="saleStartTime" :label="t('sessions.from')" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="4">
          <base-date-input name="endSale" v-model="form.endSale" :rules="[rules.required]"
            :placeholder="t('sessions.sessionEndSaleDate')" />
        </v-col>
        <v-col cols="12" md="4">
          <base-time-input :label="t('sessions.to')" v-model="saleEndTime" />
        </v-col>
      </v-row>
      <v-row class="mt-0 mb-2">
        <v-col cols="12" md="2">
          <v-checkbox color="primary" v-model="form.active" hide-details :label="t('active')" />
        </v-col>
      </v-row>
      <div class="d-flex align-center ga-3">
        <base-button :loading="submitLoading" type="submit" color="primary">{{
          isEdit ? t('actions.edit') : t('actions.add')
          }}</base-button>
        <base-button type="button" color="red" @click="router.go(-1)">{{ t('cancel') }}</base-button>
      </div>
    </v-form>
  </v-card>
</template>

<script lang="ts" setup>
import { SessionModel } from '@/services/cash/model'
import { SessionFormDto } from '@/services/events/dto/events.dto'
import { createEventSession, getEventId, updateEventSession } from '@/services/tarif/tarif.service'
import { add5MoreHours, getErrorMessage, sleep } from '@/utils/functions'
import { useRules } from '@/utils/rules'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import dayjs from 'dayjs'

const props = defineProps<{ isEdit?: boolean }>()
const isValid = ref(false)

const { t } = useI18n()
const route: any = useRoute()
const router = useRouter()
const rules = useRules()
const sessionId = ref<number | null>(null)
const session = ref<SessionModel | null>(null)

const submitLoading = ref(false)

const eventStartTime = ref({ minutes: '', hours: '' })
const eventEndTime = ref({ minutes: '', hours: '' })
const now = new Date();
const saleStartTime = ref({
  hours: now.getHours().toString().padStart(2, '0'),
  minutes: now.getMinutes().toString().padStart(2, '0'),
});
const saleEndTime = ref({ minutes: '', hours: '' })

const form = ref<SessionFormDto>({
  name: '',
  eventBegin: null,
  beginSale: new Date(),
  endSale: null,
  eventEnd: null,
  active: false,
  eventId: +route.params.id
})

const updateEventBegin = (date: Date) => {
  form.value.eventEnd = date
  form.value.endSale = date
}

const setHoursAndMinutes = (time: { minutes: string; hours: string }, date: Date) => {
  const updatedDate = new Date(date.getTime())

  if (time.hours && time.minutes) {
    updatedDate.setHours(+time.hours)
    updatedDate.setMinutes(+time.minutes)
  }

  return add5MoreHours(updatedDate)
}

const addHalfHour = ([value]: [{ minutes: string | null; hours: string | null }]) => {
  if (value.hours !== null && value.minutes !== null) {
    let hours = +value.hours
    let minutes = +value.minutes

    minutes += 30

    if (minutes >= 60) {
      minutes -= 60
      hours += 1
    }

    if (hours >= 24) {
      hours = 0
    }

    saleEndTime.value.hours = hours < 10 ? `0${hours}` : `${hours}`
    saleEndTime.value.minutes = minutes < 10 ? `0${minutes}` : `${minutes}`
  }
}

const getHoursAndMinutes = (date: Date) => {
  const updatedDate = new Date(date.getTime())

  const hours = updatedDate.getHours()
  const minutes = updatedDate.getMinutes()
  return {
    hours: hours < 10 ? `0${hours}` : `${hours}`,
    minutes: minutes < 10 ? `0${minutes}` : `${minutes}`
  }
}

const handleSubmit = async () => {
  if (!isValid.value) return
  try {
    submitLoading.value = true
    const payload = {
      ...form.value,
      eventBegin: setHoursAndMinutes(eventStartTime.value, form.value.eventBegin!),
      eventEnd: setHoursAndMinutes(eventEndTime.value, form.value.eventEnd!),
      beginSale: setHoursAndMinutes(saleStartTime.value, form.value.beginSale!),
      endSale: setHoursAndMinutes(saleEndTime.value, form.value.endSale!)
    }

    const { data } = props.isEdit
      ? await updateEventSession({ ...payload, id: sessionId.value! })
      : await createEventSession(payload)

    if (data.result.success) {
      toast.success(t('contract.successfully'))
      await sleep(1500)
      router.push({ name: '/events/sessions/[id]/', params: { id: route.params.id } })
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    submitLoading.value = false
  }
}

const getEventById = async () => {
  try {
    const { data } = await getEventId(sessionId.value!)
    session.value = data.result
    form.value = {
      name: session.value?.name,
      eventBegin: new Date(session.value?.eventBegin),
      beginSale: new Date(session.value?.beginSale),
      endSale: new Date(session.value?.endSale),
      eventEnd: new Date(session.value?.eventEnd),
      active: session.value?.active,
      eventId: +route.params.id
    }

    eventStartTime.value = getHoursAndMinutes(new Date(session.value?.eventBegin!))
    eventEndTime.value = getHoursAndMinutes(new Date(session.value?.eventEnd!))
    saleStartTime.value = getHoursAndMinutes(new Date(session.value?.beginSale!))
    saleEndTime.value = getHoursAndMinutes(new Date(session.value?.endSale!))
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

watch([eventStartTime], addHalfHour)

onMounted(() => {
  if (props.isEdit) {
    sessionId.value = +route.query.sessionId
    getEventById()
  }
})

onUnmounted(() => {
  form.value = {
    name: '',
    eventBegin: null,
    beginSale: null,
    endSale: null,
    eventEnd: null,
    active: false,
    eventId: +route.params.id
  }
  sessionId.value = null
})
</script>
