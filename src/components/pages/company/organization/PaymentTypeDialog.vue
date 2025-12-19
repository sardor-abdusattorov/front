<template>
  <div class="text-center">
    <v-dialog v-model="dialog" max-width="400" height="auto">
      <v-form>
        <v-card>
          <v-card-title>
            <span class="text-h6">{{ t('selectPaymentTypes') }}</span>
            <v-spacer></v-spacer>
            <v-btn @click="dialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text>
            <div>
              <div
                v-for="(item, index) in paymentTypes"
                :key="index"
                class="d-flex align-center justify-lg-space-between"
              >
                <p>{{ item[('name' + capitalize(locale)) as keyof CompanyPaymentType] }}</p>
                <v-list-item-action>
                  <v-checkbox class="paymentCheckbox" v-model="item.isSelected" color="deep-purple"></v-checkbox>
                </v-list-item-action>
              </div>
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" @click="dialog = false">Отмена</v-btn>
            <v-btn color="teal" @click="save">Сохранить</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { CompanyPaymentTypeUpdate, getCompanyPaymentTypeList } from '@/services/organization/organization.service'
import { CompanyPaymentType } from '@/services/organization/model/organization.model'
import { toast } from 'vue3-toastify'
import { capitalize, getErrorMessage } from '@/utils/functions'

const { t, locale } = useI18n()
const dialog = ref(false)
const organizationId = ref()
const paymentTypes = ref<CompanyPaymentType[]>()

const save = async () => {
  try {
    if (!paymentTypes.value || !organizationId.value) return
    const selectedPaymentTypeIds = paymentTypes.value.filter((item) => item.isSelected).map((item) => item.id)
    if (!selectedPaymentTypeIds.length) {
      toast.warning(t('selectPaymentTypes'))
      return
    }
    await CompanyPaymentTypeUpdate({ companyId: organizationId.value, paymentTypeIds: selectedPaymentTypeIds })
  } catch (error) {
    console.error(error)
    toast.error(getErrorMessage(error))
  } finally {
    organizationId.value = undefined
    dialog.value = false
  }
}

const openDialog = async (orgId: number) => {
  dialog.value = true
  organizationId.value = orgId
  const {
    data: { result }
  } = await getCompanyPaymentTypeList({ companyId: orgId })

  paymentTypes.value = result
}

defineExpose({
  openDialog
})
</script>

<style>
.v-card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.v-input.v-input--horizontal.paymentCheckbox div.v-input__details {
  display: none !important;
}
</style>
