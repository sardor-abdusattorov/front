<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:model-value', $event)" @after-leave="resetForm"
    width="600">
    <v-card :title="isEdit ? t('tariffs.edit_tarif') : t('tariffs.add_tarif')">
      <template #text>
        <v-form @submit.prevent="handleSubmit" v-model="isValid">
          <div class="colors-wrapper">
            <div class="color" v-for="color in colors" :key="color" :style="{ backgroundColor: color }"
              @click="form.color = color">
              <v-icon v-if="form.color === color" color="white" icon="mdi-check"></v-icon>
            </div>
          </div>

          <div class="inputs">
            <base-input :rules="[rules.required]" v-model="form.name" :label="t('tariffs.table.name')" />
            <base-input :rules="[rules.required]" v-model="form.price" :label="t('tariffs.table.sum')" type="number" />
          </div>
          <div class="d-flex justify-end">
            <v-checkbox
              v-if="store.user?.structureId !== STRUCTURES.TEATR && store.user?.structureId !== STRUCTURES.AGENT"
              color="primary" hide-details v-model="form.forAgent" :label="t('forTourAgent')" />
          </div>
          <v-divider class="my-4"></v-divider>
          <div class="additional-actions">
            <div class="additional-colors">
              <span>{{ t('tariffs.choose_more_colors') }}</span>
              <div class="d-flex ga-2">
                <div class="color-btn" @click="isColorsOpen = !isColorsOpen">
                  <v-icon icon="mdi-eyedropper"></v-icon>
                </div>
                <label class="color-btn">
                  <v-icon icon="mdi-palette"></v-icon>
                  <input type="color" v-model="form.color" />
                </label>
                <div class="color" :style="{ backgroundColor: form.color, width: '50px' }"></div>
                <div class="colors-modal" v-if="isColorsOpen" v-click-outside="() => (isColorsOpen = false)">
                  <div class="color" v-for="color in additionalColors" :key="color" :style="{ backgroundColor: color }"
                    @click="form.color = color">
                    <v-icon v-if="form.color === color" color="white" icon="mdi-check"></v-icon>
                  </div>
                </div>
              </div>
            </div>
            <div class="d-flex ga-2 buttons">
              <base-button type="button" color="default" @click="emit('update:model-value', false)">
                {{ t('actions.cancel') }}
              </base-button>
              <base-button :loading="submitLoading" type="submit">{{
                isEdit ? t('actions.edit') : t('actions.add')
              }}</base-button>
            </div>
          </div>
        </v-form>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

import { getErrorMessage } from '@/utils/functions'
import { useRules } from '@/utils/rules'
import { colors, additionalColors } from '@/constants/tarif.colors'

import { createTarif, updatedTarif } from '@/services/tarif/tarif.service'
import { CreateUpdatedTarifDto } from '@/services/tarif/dto/tarif.dto'
import { TarifsModel } from '@/services/cash/model'
import { useUserStore } from '@/stores/user.store'
import { STRUCTURES } from '@/constants/structures'

const store = useUserStore()


const props = defineProps<{
  modelValue: boolean
  eventId: number
  eventSessionId: number | null
  isEdit: boolean
  selectedTarif?: TarifsModel
}>()

const emit = defineEmits(['update:model-value', 'triggerLoadData', 'resetForm'])

const rules = useRules()
const { t } = useI18n()
const isValid = ref(false)
const isColorsOpen = ref(false)
const submitLoading = ref(false)

const form = ref<CreateUpdatedTarifDto>({
  color: colors[0],
  eventId: props.eventId,
  name: '',
  price: null,
  eventSessionId: 0,
  forAgent: false
})

const handleSubmit = async () => {
  if (!isValid.value) return

  try {
    submitLoading.value = true
    if (props.isEdit) {
      const { data } = await updatedTarif({ ...form.value, id: props.selectedTarif?.id })
      handleClose(data.result.success)
    } else {
      form.value.eventSessionId = props.eventSessionId
      const { data } = await createTarif(form.value)
      handleClose(data.result.success)
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    submitLoading.value = false
  }
}

const handleClose = (success: boolean) => {
  if (!success) return
  toast.success(t('contract.successfully'))
  emit('update:model-value', false)
  emit('triggerLoadData')
}

const resetForm = () => {
  form.value = {
    color: colors[0],
    eventId: props.eventId,
    name: '',
    price: null,
    eventSessionId: 0,
    forAgent: false
  }
  emit('resetForm')
}

watch(
  () => props.isEdit,
  () => {
    if (props.isEdit && props.selectedTarif) {
      form.value = {
        color: props.selectedTarif?.color,
        eventId: props.selectedTarif?.eventId,
        name: props.selectedTarif?.name,
        price: props.selectedTarif?.price,
        eventSessionId: props.selectedTarif?.eventSessionId,
        forAgent: props.selectedTarif?.forAgent
      }
    }
  }
)
</script>

<style lang="scss" scoped>
@import '@/styles/mixins.scss';

.colors-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
  width: 100%;
  margin-bottom: 15px;
  gap: 12px;
}

.inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @include _575-block {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

.color {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 50px;
  border-radius: 10px;
  cursor: pointer;
}

.additional-colors {
  display: flex;
  flex-direction: column;
  gap: 6px;

  span {
    font-size: 14px;
  }

  @include _575-block {
    align-items: center;
  }
}

.color-btn {
  position: relative;
  display: absolute;
  align-items: center;
  color: #757575;
  cursor: pointer;
  border-radius: 10px;
  border: 1px solid #ccc;
  padding: 12px;

  input {
    width: 0;
    height: 0;
    opacity: 0;
    position: absolute;
  }
}

.colors-modal {
  position: fixed;
  bottom: -160px;
  left: 24px;

  @include _575-block {
    bottom: 50px;
    z-index: 20;
  }

  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;

  width: 250px;
  height: 178px;

  background-color: #fff;
  border: 1px solid #ccc;

  margin-top: 5px;
  padding: 5px;

  overflow-y: auto;
}

.additional-actions {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  justify-content: space-between;
  width: 100%;

  @include _575-block {
    flex-direction: column;
    align-items: center;

    .buttons {
      justify-content: flex-end;
      width: 100%;
    }
  }
}
</style>
