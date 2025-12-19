<template>
  <div class="login-page__form" style="width: 100%">
    <img src="@/assets/images/new-logo.png" alt="logo" class="login-page__logo" />
    <!-- <img src="@/assets/images/logo.png" alt="logo" class="login-page__logo" /> -->
    <v-card class="form--card" width="400px">
      <div class="form-top">{{ t('register.title') }}</div>
      <BaseDropDown>
        <template #activator>
          <div class="key-list-trigger">
            <p v-if="!selectedKey">
              {{ $t('chooseAKey') }}
            </p>
            <p v-else class="selectedKey-style">
              {{
                selectedKey?.O
                  ? selectedKey?.O.toUpperCase() !== 'НЕ УКАЗАНО' &&
                    selectedKey?.O.toUpperCase() !== 'ЯККА ТАРТИБДАГИ ТАДБИРКОР'
                    ? selectedKey.O
                    : selectedKey?.CN
                  : selectedKey.CN
              }}
            </p>
          </div>
        </template>

        <template #list>
          <UserKey :item @select="selectKey(item)" v-for="(item, index) in filteredEKeys" :key="index" />
        </template>
      </BaseDropDown>
      <div class="d-flex align-center">
        <v-checkbox v-model="isAgree" :hide-details="true" v-on:click.stop="openOfferModal" color="deep-purple-darken-1"
          class="mx-auto d-block flex-grow-1">
          <template v-slot:label>
            <p class="text-[#13C8C9] underline">{{ t('IAgreeWithOffer') }}</p>
          </template>
        </v-checkbox>
      </div>
      <div>
        <v-btn @click="submitHandler" width="200px" height="40px" color="deep-purple-darken-1" rounded="xl"
          class="mx-auto d-block" :disabled="!selectedKey || !isAgree">
          {{ t('next') }}
        </v-btn>

        <div class="d-flex justify-center mt-3">
          <a href="/login" class="register-link">{{ t('login.title') }}</a>
        </div>
      </div>
    </v-card>
    <v-dialog v-model="offerModal" width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ t('publicOffer') }}</span>
        </v-card-title>
        <v-card-text>
          <iframe :src="pdfUrl" width="100%" height="500px" frameborder="0"></iframe>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="downloadOffer">{{ t('tickets.download') }}</v-btn>
          <v-btn @click="closeModal">{{ t('close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useEimzo } from '@/composables/useEimzo'
import { ESignKey } from '@shohrux_saidov/eimzo-client'
import { useRegisterOrganizationStore } from '@/stores/register-organization.store'
import { useI18n } from 'vue-i18n'
import { getActiveContractTemplateFile } from '@/services/contracts/contracts.service'
import { downloadBlobAsFile } from '@/utils/functions'

const { eKeys, getHashESign, loadKey, getAliasOfKey } = useEimzo()
const organizationStore = useRegisterOrganizationStore()
const emit = defineEmits(['changeStep'])
const { t } = useI18n()

const selectedKey = ref<ESignKey>()
const isAgree = ref(false)
const offerModal = ref(false)
const offerBlob = ref()
const pdfUrl = ref('')
const filteredEKeys = computed(() => {
  return eKeys.value.filter((key: ESignKey) => key.O && key.O !== 'НЕ УКАЗАНО')
})

const selectKey = (key: ESignKey) => {
  console.log(key)
  selectedKey.value = key
}

const submitHandler = async () => {
  if (!selectedKey.value) return
  const hashAlias = getAliasOfKey(selectedKey.value)
  console.log('hashAlias', hashAlias)
  organizationStore.organizationData.directorTin = hashAlias.uid
  organizationStore.organizationData.orgTin = hashAlias['1.2.860.3.16.1.1']
  organizationStore.organizationData.organizationName = hashAlias.o.toUpperCase()
  organizationStore.organizationData.address = hashAlias?.st?.charAt(0).toUpperCase() + hashAlias?.st?.substring(1)
  organizationStore.organizationData.director = hashAlias.cn.toUpperCase()
  organizationStore.organizationData.businesscategory = hashAlias?.businesscategory?.toUpperCase()
  organizationStore.organizationData.pinfl = selectedKey.value.PINFL
  organizationStore.organizationData.surname = hashAlias.surname.toUpperCase()
  organizationStore.organizationData.name = hashAlias.name.toUpperCase()

  organizationStore.selectedKey = selectedKey.value

  emit('changeStep', 1)
}

const openOfferModal = async () => {
  if (isAgree.value) return
  try {
    const response = await getActiveContractTemplateFile({
      type: 1
    })
    offerBlob.value = response.data
    const blob = response.data
    pdfUrl.value = URL.createObjectURL(blob)
    offerModal.value = true
  } catch (error) {
    console.error('Error fetching the PDF:', error)
  }
}

const downloadOffer = () => {
  downloadBlobAsFile(offerBlob.value, 'offer.pdf')
}

const closeModal = () => {
  offerModal.value = false
  pdfUrl.value = ''
}
</script>

<style scoped lang="scss">
.form--card {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.underline {
  text-decoration: underline;

  &:hover {
    cursor: pointer;
    color: blueviolet;
  }
}
</style>
