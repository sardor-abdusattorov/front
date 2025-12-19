<template>
  <div class="text-center pa-4">
    <v-dialog v-model="props.modelValue" persistent width="800">
      <v-card :title="t('has_benefits')">
        <v-card-text class="pb-0">
          <div class="wrapper" v-for="(benefit, index) in benefits" :key="index">
            <base-input density="comfortable" v-model="benefit.name" :rules="[rules.required]"
              :placeholder="t('name_benefits')" :readonly="!benefit.isUpdated" :disabled="isView" />
            <v-number-input density="comfortable" v-model="benefit.rate" type="number" :min="0" :max="100"
              :rules="[rules.required]" :placeholder="t('percent')" :readonly="!benefit.isUpdated" :disabled="isView"
              @input="inputHandler" />
            <div class="actions" v-if="!isView">
              <v-btn :color="benefit.isUpdated ? 'green' : 'primary'" icon
                @click="updateBenefitField({ index, isUpdated: !benefit.isUpdated, id: benefit.id })">
                <v-icon color="white">{{ benefit.isUpdated ? ' mdi-check' : 'mdi-pencil' }}</v-icon>
              </v-btn>
              <v-btn color="red" icon @click="removeBenefitField({ index, id: benefit.id })">
                <v-icon color="white">mdi-delete</v-icon>
              </v-btn>
            </div>
          </div>
          <div v-if="isView && !benefits.length" class="pb-4">{{ t('no_benefits') }}</div>
          <v-form ref="submitFormRef" @submit.prevent="addFields" v-if="!isView">
            <div class="wrapper">
              <base-input density="comfortable" v-model="form.name" :rules="[rules.required]"
                :placeholder="t('name_benefits')"></base-input>
              <v-number-input density="comfortable" type="number" :min="0" :max="100" v-model="form.rate"
                :rules="[rules.required]" :placeholder="t('percent')" @input="inputHandler" />
              <div class="status">{{ t('new') }}</div>
            </div>

            <v-divider></v-divider>
            <div class="d-flex my-4 justify-end mr-2 ga-3">
              <v-spacer></v-spacer>
              <base-button :loading="submitLoading" type="submit">{{ t('add') }}</base-button>
            </div>
          </v-form>
        </v-card-text>
        <v-card-text class="pt-0">
          <template v-if="!isView">
            <v-radio-group inline hide-details :label="t('benefits.title')"
              v-model="benefitsCheckboxQuery.privilegesRound">
              <v-radio color="primary" :label="t('benefits.100')" value="100"></v-radio>
              <v-radio color="primary" :label="t('benefits.500')" value="500"></v-radio>
              <v-radio color="primary" :label="t('benefits.1000')" value="1000"></v-radio>
              <v-radio color="primary" :label="t('benefits.5000')" value="5000"></v-radio>
              <v-radio color="primary" :label="t('benefits.10000')" value="10000"></v-radio>
            </v-radio-group>
            <v-checkbox v-model="benefitsCheckboxQuery.isUseDiscountToPrivileges" color="primary" hide-details
              :label="t('benefits.checkbox')"></v-checkbox>
          </template>
          <template v-else>
            <v-radio-group inline hide-details :label="t('benefits.title')"
              v-model="benefitsCheckboxQuery.privilegesRound" :disabled="true"
              v-if="benefitsCheckboxQuery.privilegesRound !== '0'">
              <v-radio color="primary" :label="t('benefits.100')" value="100"></v-radio>
              <v-radio color="primary" :label="t('benefits.500')" value="500"></v-radio>
              <v-radio color="primary" :label="t('benefits.1000')" value="1000"></v-radio>
              <v-radio color="primary" :label="t('benefits.5000')" value="5000"></v-radio>
              <v-radio color="primary" :label="t('benefits.10000')" value="10000"></v-radio>
            </v-radio-group>
            <v-checkbox v-model="benefitsCheckboxQuery.isUseDiscountToPrivileges" color="primary" hide-details
              :disabled="true" v-if="benefitsCheckboxQuery.isUseDiscountToPrivileges"
              :label="t('benefits.checkbox')"></v-checkbox>
          </template>

          <v-divider></v-divider>
          <div class="d-flex my-4 justify-end mr-2 ga-3">
            <base-button color="#999" @click="isClose">{{ t('close') }}</base-button>
            <base-button :loading="saveLoading" @click="saveBenefits" v-if="!isView">{{
              t('actions.save')
            }}</base-button>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRules } from '@/utils/rules'

import { useEventsStore, BenefitsType } from '@/stores/events.store'
import { addEventPrivileges, getAllEventById, updateEventRoundPrivileges } from '@/services/events/events.service'
import { toast } from 'vue3-toastify'
import { getErrorMessage } from '@/utils/functions'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ modelValue: boolean; updateId?: string; isView?: boolean }>()
const emit = defineEmits(['update:modelValue'])

const rules = useRules()
const store = useEventsStore()

const { benefits, benefitsCheckboxQuery } = storeToRefs(store)
const { updateBenefitField, removeBenefitField } = store

const submitFormRef = ref()
const submitLoading = ref(false)
const saveLoading = ref(false)

const { t } = useI18n()

const form = ref<BenefitsType>({
  name: '',
  rate: null,
  isUpdated: false
})

const inputHandler = (e: any) => {
  if (e.target.value > 100) {
    e.target.value = 100
  }
}

const addFields = async () => {
  const validate = await submitFormRef.value.validate()
  if (validate && validate.valid) {
    if (props.updateId) {
      try {
        submitLoading.value = true
        const { data } = await addEventPrivileges([
          { eventId: +props.updateId!, name: form.value.name, rate: form.value.rate, submit: true }
        ])

        if (data.result.success) {
          const { data } = await getAllEventById(+props.updateId!)
          store.benefits = data.result.data.map((item: any) => ({
            name: item.name,
            rate: item.rate,
            isUpdated: false,
            id: item.id
          }))
        }
      } catch (err) {
        toast.error(getErrorMessage(err))
      } finally {
        submitLoading.value = false
      }
    } else {
      benefits.value.push({
        name: form.value.name,
        rate: form.value.rate,
        isUpdated: false
      })
    }

    submitFormRef.value.reset()
  }
}

const saveBenefits = async () => {
  if (props.updateId) {
    try {
      saveLoading.value = true
      const { data } = await updateEventRoundPrivileges({
        eventId: +props.updateId!,
        isUseDiscountToPrivileges: store.benefitsCheckboxQuery.isUseDiscountToPrivileges,
        privilegesRound: store.benefitsCheckboxQuery.privilegesRound
      })
      if (data.result.success) {
        toast.success(t('contract.successfully'))
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      saveLoading.value = false
    }
  }
  isClose()
}

const isClose = () => {
  emit('update:modelValue', false)
}

</script>

<style scoped lang="scss">
.wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr 0.5fr;
  gap: 20px;

  &-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: flex-start;
    gap: 20px;
  }

  .status {
    margin-top: 12px;
    text-align: center;
    font-size: 16px;
    color: #ff9800;
  }

  .actions {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
