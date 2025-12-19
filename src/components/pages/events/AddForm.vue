<template>
  <v-form ref="submitFormRef" @submit.prevent="addFile">
    <v-card-item>
      <v-row>
        <v-col cols="12" md="3" v-if="isAbonentStructureShow">
          <v-select :label="t('subscriberType')" :items="structureList" :item-title="'name' + capitalize(locale)"
            item-value="value" density="comfortable" v-model="form.abonentStructureId" :rules="[rules.required]"
            :disabled="isView || userStore.user?.structureId === STRUCTURES.TEATR">
          </v-select>
        </v-col>
        <v-col cols="12" md="3" v-if="isView">
          <base-input :placeholder="t('user.organizer')" type="text" v-model="form.organizatorName" :disabled="true"
            density="comfortable"></base-input>
        </v-col>
        <v-col cols="12" md="3" v-if="isOrganizatorShow">
          <v-select :label="t('user.organizer')" :items="organizator" item-title="text" item-value="value"
            density="comfortable" v-model="form.eventOrgId" :disabled="isView"></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field :rules="[rules.required]" v-model="form.name" :label="t('tickets.eventName')"
            density="comfortable" :readonly="isView"></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field :rules="[rules.required]" v-model="form.shortName" :label="t('tickets.shortName')"
            density="comfortable" :readonly="isView"></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-select :label="t('sold_tickets.table.palace')" :items="palaceList" item-title="text" item-value="value"
            density="comfortable" v-model="form.palaceId" :rules="[rules.required]" :readonly="isView"></v-select>
        </v-col>
        <v-col cols="12" md="3"
          v-if="!(userStore.user?.structureId === STRUCTURES.MUZEY || form.abonentStructureId === STRUCTURES.MUZEY)">
          <v-select :label="t('establishmentHall')" :items="palaceHalls" item-title="name" item-value="id"
            density="comfortable" v-model="form.palaceHallId" :rules="[rules.required]" :readonly="isView"></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select :label="t('tickets.ageLimit')" :items="ageLimit" :item-title="'name' + capitalize(locale)"
            item-value="value" density="comfortable" :readonly="isView" v-model="form.ageLimitId"
            :rules="[rules.required]"></v-select>
        </v-col>
        <v-col cols="12" md="3"
          v-if="!(userStore.user?.structureId === STRUCTURES.MUZEY || form.abonentStructureId === STRUCTURES.MUZEY)">
          <base-input v-model="form.eventMinute" density="comfortable" :placeholder="t('events.duration')" type="number"
            :max="1440" :disabled="isView" />
        </v-col>
        <!--      </v-row>-->
        <!--      <v-row>-->
        <v-col cols="12" md="3">
          <base-date-input clearable hide-details v-model="form.beginDate" color="indigo" name="beginDate"
            density="comfortable" :placeholder="t('sold_tickets.table.startDateEvent')" :rules="[rules.required]"
            :disabled="isView" :allowed-dates="allowedDates" />
        </v-col>
        <v-col cols="12" md="3">
          <base-date-input clearable hide-details v-model="form.endDate" color="indigo" name="endDate"
            density="comfortable" :placeholder="t('sold_tickets.table.endDateEvent')" :rules="[rules.required]"
            :disabled="isView" :allowed-dates="allowedDates1" />
        </v-col>
        <v-col cols="12" md="3" v-if="isInvitationCountShow">
          <base-input v-model="form.invitationCount" density="comfortable" :placeholder="t('events.invitationCount')"
            type="number" :min="0" :max="10000" :disabled="isView"/>
        </v-col>
        <v-col cols="12" md="3"
          v-if="userStore.user?.structureId === STRUCTURES.MUZEY || form.abonentStructureId === STRUCTURES.MUZEY">
          <v-text-field v-model="form.ticketValidity" :label="t('tickets.ticketValidityPeriodDays')" type="number"
            density="comfortable" :readonly="isView"></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-textarea v-model="form.content" :label="t('tickets.aboutEvent')" auto-grow rows="2" max-rows="5"
            :readonly="isView"></v-textarea>
        </v-col>
        <!--      </v-row>-->
        <!--      <v-row>-->
        <v-col cols="12" md="6">
          <v-select :items="spicList" @update:modelValue="changeSpicList" :item-title="'name' + capitalize(locale)"
            item-value="spic" density="comfortable" v-model="form.spic" :readonly="isViewAndNotFond && isView"
            :label="t('events.mxik_code')"></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select :items="packageList" :item-title="locale === 'uz' ? 'nameLat' : 'nameRu'" item-value="code"
            density="comfortable" :readonly="isViewAndNotFond && isView" :label="t('events.mxik_package')"
            v-model="form.packageCode"></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <base-image-input accept="image/*" @clear-image="imageUrl = ''" @update:file="uploadImage" :readonly="isView"
            :label="t('events.image')" :image="imageUrl" />
        </v-col>
      </v-row>
      <v-row v-if="form.eventStatus === EVENT_STATUSES.REJECTED">
        <v-col cols="12" md="3">
          <base-input :label="t('events.reject_reason')" :model-value="form.rejectReason || t('notSpecified')"
            readonly></base-input>
        </v-col>
      </v-row>
      <v-row v-if="!isView && hasAccessToBook">
        <v-col cols="6" md="3">
          <base-input v-model="form.bookingCountEventOrg" :label="t('totalSeatsCanBeReserved')" type="number" />
        </v-col>
        <v-col cols="6" md="3">
          <base-input v-model="form.bookingTimeEventOrg" :label="t('bookingTimeInHours')" type="number" />
        </v-col>
      </v-row>
      <v-row>

         <v-col cols="12" md="3">
          <v-checkbox :readonly="isView" v-model="form.isRejectTicket" :label="t('can_return_ticket')"
            color="indigo"></v-checkbox>
        </v-col>
        
        <v-col class="d-flex align-center" cols="12" md="3">
          <a class="mb-5 text-purple-lighten-2 cursor-pointer" @click="isOpen = true">{{ t('fines') }}</a>
        </v-col>

        <v-col cols="12" md="3">
          <v-checkbox :readonly="isView" v-model="form.isEventPrivileges" @click="changeBenefit" :label="t('has_benefits')"
            color="indigo"></v-checkbox>
        </v-col>

        <v-col class="d-flex align-center" cols="12" md="3">
          <a class="mb-5 text-purple-lighten-2 cursor-pointer" @click="isBenefit = true">{{ t('cash.benefits') }}</a>
        </v-col>
      </v-row>

      <template v-if="isView">
        <v-row>
          <template v-if="hasAccessToBook">
            <v-col cols="6" md="3">
              <div class="px-3">
                <h4>{{ t('seatReservation') }}</h4>
                <v-switch :label="t('emitent')" color="indigo" v-model="form.isBookingEventOrg" hide-details></v-switch>
              </div>
            </v-col>
            <v-col cols="6" md="3" class="d-flex flex-column justify-end">
              <v-switch :label="t('agent')" color="red" v-model="form.isBookingAgent" hide-details></v-switch>
            </v-col>
          </template>

          <v-col cols="12" md="6" v-if="userStore.isFond">
            <div class="radio-btns">
              <h4>{{ t('selectVerificationLevel') }}</h4>
              <div class="d-flex flex-column">
                <label>
                  <input type="radio" name="radio" :checked="!form.isVerificationUser"
                    @change="onSelectVeification(false)" />
                  <span>{{ t('usual') }}</span>
                </label>
                <label>
                  <input type="radio" name="radio" :checked="form.isVerificationUser"
                    @change="onSelectVeification(true)" />
                  <span>{{ t('high') }}</span>
                </label>
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row v-if="hasAccessToBook">
          <v-col cols="6" md="3">
            <base-input v-model="form.bookingCountEventOrg" :label="t('totalNumberSeatsCanBeBooked')" type="number" />
          </v-col>
          <v-col cols="6" md="3">
            <base-input v-model="form.bookingTimeEventOrg" :label="t('bookingTimeInHoursIssuer')" type="number" />
          </v-col>
          <template v-if="form.isBookingAgent">
            <v-col cols="6" md="3">
              <base-input v-model="form.bookingCountAgent" :label="t('totalNumberOfSeatsCanBookedAgent')"
                type="number" />
            </v-col>
            <v-col cols="6" md="3">
              <base-input v-model="form.bookingTimeAgent" :label="t('bookingTimePerHour')" type="number" />
            </v-col>
          </template>
        </v-row>
      </template>
      <v-row>
        <v-col cols="12" class="d-flex align-center flex-wrap">
          <base-button color="red" class="mr-2" @click="router.go(-1)">{{ isView ? t('back') : t('contract.cancel') }}
          </base-button>
          <template v-if="isView && userStore.isFond">
            <template
              v-if="form.eventStatus !== EVENT_STATUSES.REJECTED && form.eventStatus !== EVENT_STATUSES.CANCELLED">
              <base-button @click="rejectByFond" class="mr-2" color="red"
                v-if="form.eventStatus !== EVENT_STATUSES.CANCEL_REQUEST">
                {{ t('refuse') }}
              </base-button>
              <base-button :loading="cancelLoading" @click="cancelByFond" color="red" class="mr-2"
                v-if="form.eventStatus === EVENT_STATUSES.CANCEL_REQUEST">
                {{ t('cancelEvent') }}
              </base-button>
              <base-button :loading="approveLoading" @click="handleApprove" class="mr-2" color="green"
                v-if="form.eventStatus === EVENT_STATUSES.SENT">
                {{ t('events.accept') }}
              </base-button>
            </template>
          </template>
          <base-button @click="openSchemeDialog" class="mr-2"
            v-if="!form.isWithoutSeats && form.abonentStructureId !== STRUCTURES.MUZEY && props.isView">
            {{ t('goToTheHallPlan') }}
          </base-button>
          <base-button :loading="submitLoading" type="submit" v-if="!isView" class="mr-2">
            {{ !updateId ? t('contract.add') : t('tariffs.menu.edit') }}
          </base-button>
          <base-button
            v-if="STRUCTURES.FOND === userStore.user?.structureId && STRUCTURES.MUZEY === form.abonentStructureId && updateId"
            @click="tariffDialogRef.open(updateId)">
            {{ t('events.menu.tariffs') }}
          </base-button>
        </v-col>
      </v-row>
    </v-card-item>
  </v-form>
  <teleport to="body">
    <add-form-dialog @update:open="isClose" v-model="isOpen" :updateId="updateId" :isView="isView" />
    <add-form-benifit-dialog @update:open="isBenefitClose" v-model="isBenefit" :updateId="updateId" :isView="isView" />
    <RejectEventFondDialog ref="rejectDialogRef" @update="fetchById" />
    <SchemeDialog ref="schemeDialogRef" :formValue="form" :sessionList="sessionList" :palaceHall="palaceHallById" />
    <TariffDialog ref="tariffDialogRef" />
  </teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

import { useRules } from '@/utils/rules'
import { useEventsStore } from '@/stores/events.store'
import { capitalize, formatToBackend, getErrorMessage, sleep } from '@/utils/functions'

import {
  addEventPrivileges,
  createAddImage,
  createEventsAdd,
  getAgeLimitList,
  getEventById,
  getPalaceList,
  getReferencesData,
  updateEventsEdit,
  createTicketReject,
  updateEventRoundPrivileges,
  getStatusIsBooking,
  confirmEventByFond,
  cancelEventByFond
} from '@/services/events/events.service'

import { GetReferencesPackagesDto } from '@/services/events/dto/events.dto'
import { GetReferencesDto } from '@/services/events/dto/events.dto'
import { useUserStore } from '@/stores/user.store'
import { EVENT_STATUSES } from '@/constants/event-statuses'
import { STRUCTURES } from '@/constants/structures'
import { getSessionsByEvent } from '@/services/tarif/tarif.service'
import RejectEventFondDialog from '@/components/pages/events/RejectEventFondDialog.vue'
import { getPalaceHallById } from '@/services/palace/palace.service'
import SchemeDialog from '@/components/pages/events/SchemeDialog.vue'
import { getCompanyListByStructureId, getStructureList } from '@/services/organization/organization.service'
import { getPalaceHallGetAll } from '@/services/administration/admin.service'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrAfter);

const props = defineProps<{
  updateId?: string
  isView?: boolean
}>()

interface ChildComponentExposed {
  openModal: (id: number) => void
}

const { t, locale } = useI18n()
const apiUrl = import.meta.env.VITE_API_URL

const router = useRouter()
const route = useRouter()
const userStore = useUserStore()
const hasAccessToBook = ref(false)
const verificationStatus = ref(false)
const isViewAndNotFond = ref(false)
const tariffDialogRef = ref()
const orgSpicData = ref({
  spic: '',
  packageCode: ''
})

const form = ref<any>({
  ageLimitId: null,
  beginDate: null,
  bookingCountEventOrg: 0,
  bookingTimeEventOrg: 0,
  bookingCountAgent: 0,
  bookingTimeAgent: 0,
  content: '',
  endDate: null,
  eventOrgId: undefined,
  isEventPrivileges: undefined,
  isRejectTicket: undefined,
  name: '',
  packageCode: null,
  palaceId: null,
  pictureBanner: null,
  shortName: '',
  spic: null,
  ticketValidity: null,
  id: undefined,
  abonentStructureId: userStore.user?.structureId,
  eventMinute: null,
  invitationCount: 0,
  palaceHallId: null
})

const store = useEventsStore()
const spicList = ref<GetReferencesDto[]>([])
const loading = ref<boolean>(false)
const submitLoading = ref<boolean>(false)
const approveLoading = ref(false)
const cancelLoading = ref(false)
const submitFormRef = ref()
const rejectDialogRef = ref<(InstanceType<typeof RejectEventFondDialog> & ChildComponentExposed) | null>(null)
const schemeDialogRef = ref<(InstanceType<typeof SchemeDialog> & ChildComponentExposed) | null>(null)
const ageLimit = ref()
const sessionList = ref()
const isBenefit = ref<boolean>(false)
const palaceList = ref()
const palaceHalls = ref()
const organizator = ref()
const isOrganizatorShow = ref(true)
const structureList = ref()
const palaceHallById = ref()
const packageList = ref<GetReferencesPackagesDto[]>()
const imgData = ref<any>({})
const uploadedImage = ref<File | null>(null)
const isOpen = ref(false)

const rules = useRules()
const imageUrl = ref('')
const today = dayjs().startOf('day');
const allowedDates = (date: any) => dayjs(date).isSameOrAfter(today, 'day')
const allowedDates1 = (date: any) => dayjs(date).isSameOrAfter(form.value.beginDate, 'day')
watch(() => form.value.beginDate, () => {
  if (form.value.beginDate > form.value.endDate) {
    form.value.endDate = null
  }
})

const changeBenefit = () => {
  if (form.value.isEventPrivileges) {
    isBenefit.value = true
  }
}
// watch(() => form.value.isRejectTicket, () => {
//   isBenefit.value = form.value.isRejectTicket
// })

const isAbonentStructureShow = computed(() => {
  if (props.isView) {
    return true
  } else {
    return userStore.user?.structureId !== STRUCTURES.MUZEY
  }
})

const isInvitationCountShow = computed(() => {
  const isMuzey =
    userStore.user?.structureId === STRUCTURES.MUZEY ||
    form.value.abonentStructureId === STRUCTURES.MUZEY

  return !isMuzey
})

const isSpicChanged = () => {
  return form.value.spic !== orgSpicData.value.spic || form.value.packageCode !== orgSpicData.value.packageCode
}

const isClose = (val: boolean) => {
  isOpen.value = val
}

const isBenefitClose = (val: boolean) => {
  isBenefit.value = val
}

const onSelectVeification = (val: boolean) => {
  if (val) {
    verificationStatus.value = val
  } else {
    verificationStatus.value = form.value.isVerificationUser
  }
}

const uploadImage = async (e: any) => {
  try {
    const image = e.target.files[0];
    if (image) {

      // console.log(image.type)

      // Validate file type
      if (!image.type.startsWith("image/") || image.type.startsWith("image/svg")) {
        toast.warning(t("select_valid_image"))
        return;
      }

      // Process valid image
      uploadedImage.value = image;
      form.value.pictureBanner = image;
      imageUrl.value = URL.createObjectURL(image);
    } else {
      toast.warning(t("select_file"));
    }
  } catch (error) {
    toast.error(getErrorMessage(error));
  }
};


const addFile = async () => {
  if (uploadedImage.value) {
    const formData = new FormData()
    formData.append('field', 'eventbannerfiles')
    formData.append('files', uploadedImage.value)
    try {
      const {
        data: { result }
      } = await createAddImage(formData)
      imgData.value = result
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }
  handleSubmit()
}

const handleSubmit = async () => {
  try {
    const validate = await submitFormRef.value.validate()
    if (validate && validate.valid) {
      submitLoading.value = true
      form.value.pictureBanner = imgData.value.path || null
      form.value.beginDate = formatToBackend(new Date(form.value.beginDate))
      form.value.endDate = formatToBackend(new Date(form.value.endDate))
      try {
        if (props.updateId) {
          form.value.id = +props.updateId
          await updateEventsEdit({ ...form.value })
        } else {
          const {
            data: { result }
          } = await createEventsAdd(form.value)

          const rejects = {
            eventId: result.eventId,
            list: store.fines.map(({ hour, percent }) => ({
              hour,
              percent,
              submitTicketReject: true,
              eventId: null,
              helperId: 1
            }))
          }

          const privilages = store.benefits.map(({ name, rate }) => ({
            eventId: result.eventId,
            name,
            rate,
            helperId: 1,
            submit: true
          }))

          if (rejects.list.length > 0) {
            await createTicketReject(rejects)
          }

          if (privilages.length > 0) {
            await addEventPrivileges(privilages)
          }

          if (store.benefitsCheckboxQuery.isUseDiscountToPrivileges || store.benefitsCheckboxQuery.privilegesRound) {
            await updateEventRoundPrivileges({
              eventId: result.eventId,
              isUseDiscountToPrivileges: store.benefitsCheckboxQuery.isUseDiscountToPrivileges,
              privilegesRound: store.benefitsCheckboxQuery.privilegesRound
            })
          }

          store.fines = []
          store.benefits = []
          store.benefitsCheckboxQuery = { isUseDiscountToPrivileges: false, privilegesRound: '' }
          // if (userStore.user?.structureId === STRUCTURES.MUZEY || form.value.abonentStructureId === STRUCTURES.MUZEY || form.value.abonentStructureId === STRUCTURES.TEATR || userStore.user?.structureId === STRUCTURES.AGENT) {
          //   route.push(`/events/sessions/${result.eventId}`)
          // }
          toast.success(t('contract.successfully'))
          await sleep(2000)
          if (userStore.user?.structureId === STRUCTURES.TEATR || (userStore.user?.structureId === STRUCTURES.AGENT && (form.value.abonentStructureId === 6 || form.value.abonentStructureId === 3))) {
            route.push(`/events/sessions/${result.eventId}`)
          }
          else if (userStore.user?.structureId === STRUCTURES.MUZEY || (userStore.user?.structureId === STRUCTURES.AGENT && form.value.abonentStructureId === 5)) {
            route.push(`/events/tariffs/${result.eventId}`)
          }
          submitFormRef.value.reset()
        }
        toast.success(t('contract.successfully'))
        await sleep(2000)
        // if (userStore.user?.structureId === STRUCTURES.MUZEY || form.value.abonentStructureId === STRUCTURES.MUZEY || form.value.abonentStructureId === STRUCTURES.TEATR || userStore.user?.structureId === STRUCTURES.AGENT) {
        //   route.push('/events/event')
        // } else {
        if (props.updateId) {
          if (userStore.user?.structureId === STRUCTURES.TEATR || (userStore.user?.structureId === STRUCTURES.AGENT && (form.value.abonentStructureId === 6 || form.value.abonentStructureId === 3))) {
            route.push(`/events/sessions/${props.updateId}`);
          }
          else if (userStore.user?.structureId === STRUCTURES.MUZEY || (userStore.user?.structureId === STRUCTURES.AGENT && form.value.abonentStructureId === 5)) {
            route.push(`/events/tariffs/${props.updateId}`)
          }
          submitFormRef.value.reset()
        }
        // }
      } catch (error: any) {
        toast.error(getErrorMessage(error))
        form.value.beginDate = new Date(form.value.beginDate)
        form.value.endDate = new Date(form.value.endDate)
      } finally {
        submitLoading.value = false
      }
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const handleApprove = async () => {
  try {
    approveLoading.value = true
    form.value.beginDate = formatToBackend(new Date(form.value.beginDate))
    form.value.endDate = formatToBackend(new Date(form.value.endDate))
    if (isSpicChanged()) {
      await updateEventsEdit({ ...form.value })
    }
    await confirmEventByFond({
      id: form.value.id,
      EventId: form.value.id,
      isVerificationUser: form.value.isVerificationUser,
      IsBookingEventOrg: form.value.isBookingEventOrg,
      BookingCountEventOrg: form.value.bookingCountEventOrg,
      BookingTimeEventOrg: form.value.bookingTimeEventOrg,
      IsBookingAgent: form.value.isBookingAgent,
      BookingCountAgent: form.value.bookingCountAgent,
      BookingTimeAgent: form.value.bookingTimeAgent
    })
    toast.success(t('contract.successfully'))
    router.push('/events/view/list')
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    approveLoading.value = false
  }
}

const openSchemeDialog = () => {
  schemeDialogRef.value?.openModal()
}

const cancelByFond = async () => {
  try {
    cancelLoading.value = true
    await cancelEventByFond(form.value.id)
    toast.success(t('contract.successfully'))
    router.push('/events/view/list')
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    cancelLoading.value = false
  }
}

const rejectByFond = async () => {
  rejectDialogRef.value?.openModal(form.value.id)
}

const fetchById = async () => {
  try {
    const { data } = await getEventById(props.updateId)

    store.event = {
      name: data.result.name,
      id: data.result.id
    }

    form.value = data.result
    form.value.beginDate = new Date(data.result.beginDate)
    form.value.endDate = new Date(data.result.endDate)
    verificationStatus.value = data.result.isVerificationUser
    imageUrl.value = data.result.pictureBanner ? ` ${apiUrl}/${data.result.pictureBanner}` : ''
    const mainSpicIndex = spicList.value.findIndex((item) => item.spic === form.value.spic)
    packageList.value = spicList.value[mainSpicIndex]?.packages ?? []

    orgSpicData.value.spic = { ...form.value }.spic
    orgSpicData.value.packageCode = { ...form.value }.packageCode

    if (userStore.user) {
      isViewAndNotFond.value = !(userStore.isFond && form.value.eventStatus === EVENT_STATUSES.SENT)
    }

    if (!form.value.isWithoutSeats && form.value.abonentStructureId !== STRUCTURES.MUZEY && props.isView) {
      await getPalaceHall()
    }
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const getPalaceHall = async () => {
  try {
    const {
      data: { result }
    } = await getPalaceHallById(form.value.palaceHallId)
    palaceHallById.value = result
  } catch (e) {
    toast(getErrorMessage(e))
  }
}

const getCompanyListBYSTRUCTURE = async (structureId: number) => {
  try {
    const {
      data: { result }
    } = await getCompanyListByStructureId({ structureId })
    organizator.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const {
      data: { result }
    } = await getReferencesData(form.value.abonentStructureId)
    spicList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

const palaceListData = async () => {
  loading.value = true
  try {
    const {
      data: { result }
    } = await getPalaceList(form.value.abonentStructureId)
    palaceList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

const getStructureListAbonent = async () => {
  try {
    const {
      data: { result }
    } = await getStructureList()
    structureList.value = result
    checkForAddStructure()
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const checkForAddStructure = () => {
  if (!props.updateId && !props.isView) {
    const findUserStructureInsideStructureList = structureList.value.find((item: any) => item.value === form.value.abonentStructureId)

    if (!findUserStructureInsideStructureList) {
      form.value.abonentStructureId = undefined
    }
  }
}

const getPalaceHalls = async () => {
  try {
    const {
      data: { result }
    } = await getPalaceHallGetAll(form.value.palaceId)
    palaceHalls.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const loadData = async () => {
  try {
    const {
      data: { result }
    } = await getAgeLimitList()
    ageLimit.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const checkIsBooking = async () => {
  try {
    const { data } = await getStatusIsBooking()
    hasAccessToBook.value = data.result.isBooking
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const getSessionByEvent = async () => {
  try {
    const {
      data: { result }
    } = await getSessionsByEvent(Number(props.updateId))
    sessionList.value = result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const setSpics = () => {
  if (props.updateId) {
    const mainSpicIndex = spicList.value.findIndex((item) => item.spic === form.value.spic)
    packageList.value = spicList.value[mainSpicIndex]?.packages ?? []
  } else {
    const mainSpicIndex = spicList.value.findIndex((item) => item.isMain)
    form.value.spic = spicList.value[mainSpicIndex]?.spic ?? null
    packageList.value = spicList.value[mainSpicIndex]?.packages ?? []

    const packageIndex = packageList.value.findIndex((item) => item.isMain)
    form.value.packageCode = packageList.value[packageIndex]?.code ?? null
  }
}

const changeSpicList = (spic: string) => {
  const spicIndex = spicList.value.findIndex((item) => item.spic === spic)
  packageList.value = spicList.value[spicIndex]?.packages ?? []
  form.value.packageCode = null
}

const abonentStructureSelect = async (value: number) => {
  const abonentStructureId = value
  await fetchData()

  if (userStore.user?.structureId === STRUCTURES.ORGANIZER && abonentStructureId === STRUCTURES.ORGANIZER) {
    await getCompanyListBYSTRUCTURE(abonentStructureId)
    isOrganizatorShow.value = true
  } else if (userStore.user?.structureId === STRUCTURES.ORGANIZER && abonentStructureId === STRUCTURES.TEATR) {
    await getCompanyListBYSTRUCTURE(STRUCTURES.ORGANIZER)
    isOrganizatorShow.value = true
  } else if (userStore.user?.structureId === STRUCTURES.ORGANIZER && abonentStructureId === STRUCTURES.MUZEY) {
    await getCompanyListBYSTRUCTURE(STRUCTURES.ORGANIZER)
    isOrganizatorShow.value = true
  } else if (userStore.user?.structureId === STRUCTURES.TEATR && abonentStructureId === STRUCTURES.TEATR) {
    await getCompanyListBYSTRUCTURE(STRUCTURES.ORGANIZER)
  } else if (userStore.user?.structureId === STRUCTURES.AGENT && abonentStructureId === STRUCTURES.TEATR) {
    await getCompanyListBYSTRUCTURE(STRUCTURES.ORGANIZER)
    isOrganizatorShow.value = true
  } else if (userStore.user?.structureId === STRUCTURES.AGENT && abonentStructureId === STRUCTURES.MUZEY) {
    await getCompanyListBYSTRUCTURE(STRUCTURES.ORGANIZER)
    isOrganizatorShow.value = true
  } else if (userStore.user?.structureId === STRUCTURES.AGENT) {
    await getCompanyListBYSTRUCTURE(abonentStructureId)
    isOrganizatorShow.value = true
  } else {
    organizator.value = []
    isOrganizatorShow.value = false
  }

  await palaceListData()
}

const dateRule = (v: string) => {
  const startDate = new Date(form.value.beginDate)
  const endDate = new Date(v)

  const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  const oneDayInMillis = 24 * 60 * 60 * 1000;
  if (normalizedEndDate.getTime() - normalizedStartDate.getTime() >= oneDayInMillis) {
    return true;
  } else {
    return t('date_error');
  }
};



watch(
  () => form.value.abonentStructureId,
  () => {
    if (form.value.abonentStructureId && !props.isView) {
      abonentStructureSelect(form.value.abonentStructureId)
    }
  }
)

watch(
  () => form.value.palaceId,
  () => {
    if (form.value.palaceId) {
      getPalaceHalls()
    }
  }
)

onMounted(async () => {
  props.updateId &&
    (await Promise.all([
      fetchById(),
      store.fetchRejectedTicketsById(+props.updateId!),
      store.getEventPrivalilages(+props.updateId!),
      getSessionByEvent()
    ]))

  await Promise.all([fetchData(), palaceListData(), getStructureListAbonent(), loadData(), checkIsBooking()])
  setSpics()


  if (userStore.user?.structureId === STRUCTURES.TEATR && !props.isView) {
    await abonentStructureSelect(STRUCTURES.TEATR)
    form.value.abonentStructureId = STRUCTURES.TEATR
  } else if (userStore.user?.structureId === STRUCTURES.MUZEY && !props.isView) {
    await abonentStructureSelect(STRUCTURES.MUZEY)
  }

  if (props.isView) {
    await getCompanyListBYSTRUCTURE(form.value.abonentStructureId)

    isOrganizatorShow.value = !(
      form.value.abonentStructureId === STRUCTURES.MUZEY || form.value.abonentStructureId === STRUCTURES.TEATR
    )
  }
})

onUnmounted(() => {
  store.fines = []
  store.benefits = []
  store.event = { name: '', id: undefined }
  store.benefitsCheckboxQuery = { isUseDiscountToPrivileges: false, privilegesRound: '' }
})
</script>

<style scoped lang="css">
.form-group label {
  font-size: 14px;
  line-height: 1.42857;
  color: #aaa;
  font-weight: 400;
}

.form-group select input {
  border-radius: 50px;
}

.radio-btns {
  display: flex;
  flex-direction: column;
  gap: 12px;

  label {
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 12px;
    width: fit-content;
  }

  input {
    cursor: pointer;
  }
}

h4 {
  font-size: 14px;
}
</style>
