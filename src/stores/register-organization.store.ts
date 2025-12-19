import { ESignKey } from '@shohrux_saidov/eimzo-client'
import { defineStore } from 'pinia'

export const useRegisterOrganizationStore = defineStore('register-organization', () => {
  const organizationData = ref({
    organizationName: '',
    address: '',
    orgTin: '',
    director: '',
    directorTin: '',
    email: '',
    website: '',
    phone_number: '',
    password: '',
    oked: '',
    username: '',
    id: '',
    businesscategory: '',
    pinfl: '',
    name: '',
    surname: ''
  })

  const selectedKey = ref<ESignKey | null>(null)

  return { organizationData, selectedKey }
})
