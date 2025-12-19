import { ESignKey, EsignModule, initModuleEimzo } from '@shohrux_saidov/eimzo-client'
import { ref, Ref } from 'vue'

// Extend Window interface to include CAPIWS and Base64
declare global {
  interface Window {
    CAPIWS: any
    Base64: any
  }
}

interface ESignAlias {
  '1.2.860.3.16.1.1': string // org tin
  cn: string // Director name
  o: string // Organization name
  st: string // Address
  uid: string // Director tin
  pinfl: string // pinfl
  name: string
  surname: string
  businesscategory: string
}

const API_KEYS = [
  {
    domain: 'dls.yt.uz',
    key: 'EDC1D4AB5B02066FB3FEB9382DE6A7F8CBD095E46474B07568BC44C8DAE27B3893E75B79280EA82A38AD42D10EA0D600E6CE7E89D1629221E4363E2D78650516'
  },
  {
    domain: 'cabinet.cultureticket.uz',
    key: '9604834CDE5ECF91050D3D3A136AEA29E0EF46D42DCE658419912724754648C5AAC3FEF83DB17685362C73E908B7C9C32D8AE776C19D3BDAF5BCAF82440D2158'
  }
]

export const useEimzo = () => {
  const eKeys: Ref<ESignKey[]> = ref([])
  const isLoading: Ref<boolean> = ref(true)
  const error: Ref<string | null> = ref(null)
  let eimzo: EsignModule | null = null

  const initEimzo = async (): Promise<void> => {
    try {
      eimzo = await initModuleEimzo()

      API_KEYS.forEach((key) => {
        eimzo?.addKey(key.domain, key.key)
      })
      await eimzo.installApiKeys()
      await eimzo.checkVersion()
      eKeys.value = await eimzo.listAllUserKeys()
    } catch (err: any) {
      error.value = err.message || 'An error occurred during initialization'
    } finally {
      isLoading.value = false
    }
  }

  const getAliasOfKey = (key: ESignKey) => {
    const alias = key.alias.split(',')
    const hashAlias: Record<keyof ESignAlias, string> = {
      '1.2.860.3.16.1.1': '',
      cn: '',
      o: '',
      st: '',
      uid: '',
      pinfl: '',
      name: '',
      surname: '',
      businesscategory: ''
    }

    alias.forEach((item) => {
      const [key, value] = item.split('=')
      hashAlias[key as keyof ESignAlias] = value
    })

    return hashAlias
  }

  const getHashESign = async (
    key: ESignKey,
    data: string,
  ): Promise<{ hash: string; token: string; id: string } | null> => {
    if (!eimzo || eKeys.value.length === 0) {
      error.value = 'E-Imzo is not initialized or no keys available'
      return null
    }

    try {
      // Load key first
      const loadedKey = await eimzo.loadKey(key)
      if (!loadedKey || !loadedKey.id) {
        error.value = 'Failed to load key'
        return null
      }

      const keyId = loadedKey.id

      // Create PKCS7 signature directly using CAPIWS
      // This avoids using the deprecated get_timestamp_token_request_for_signature function
      return new Promise((resolve, reject) => {
        window.CAPIWS.callFunction(
          {
            plugin: 'pkcs7',
            name: 'create_pkcs7',
            arguments: [window.Base64.encode(data), keyId, 'no']
          },
          (event: any, responseData: any) => {
            if (responseData.success) {
              resolve({
                hash: responseData.pkcs7_64,
                token: '', // Token is no longer required with new E-IMZO API
                id: keyId
              })
            } else {
              error.value = responseData.reason || 'Failed to create PKCS7 signature'
              reject(new Error(responseData.reason || 'Failed to create PKCS7 signature'))
            }
          },
          (err: any) => {
            error.value = err.message || 'An error occurred while creating PKCS7 signature'
            reject(err)
          }
        )
      })
    } catch (err: any) {
      error.value = err.message || 'An error occurred while getting the hash e-signature'
      return null
    }
  }

  const sign = async (
    key: ESignKey,
    data: string // challange
  ): Promise<{ signature: string; token: string; id: string } | null> => {
    if (!eimzo || eKeys.value.length === 0) {
      error.value = 'E-Imzo is not initialized or no keys available'
      return null
    }

    try {
      return await eimzo.signPkcs7(key, data)
    } catch (err: any) {
      error.value = err.message || 'An error occurred while signing'
      return null
    }
  }

  const loadKey = async (key: ESignKey) => {
    if (!eimzo) {
      error.value = 'E-Imzo is not initialized'
      return
    }

    const lKey = await eimzo.loadKey(key)
    return lKey
  }

  initEimzo()

  return {
    eKeys,
    isLoading,
    error,
    getHashESign,
    sign,
    loadKey,
    getAliasOfKey
  }
}
