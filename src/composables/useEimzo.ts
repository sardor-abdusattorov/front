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

interface UsbDevice {
  id: string
  name: string
}

export const useEimzo = () => {
  const eKeys: Ref<ESignKey[]> = ref([])
  const isLoading: Ref<boolean> = ref(true)
  const error: Ref<string | null> = ref(null)
  const usbDevices: Ref<UsbDevice[]> = ref([])
  const versionInfo: Ref<{ version: string; isOldVersion: boolean } | null> = ref(null)
  let eimzo: EsignModule | null = null

  const initEimzo = async (): Promise<void> => {
    try {
      eimzo = await initModuleEimzo()

      API_KEYS.forEach((key) => {
        eimzo?.addKey(key.domain, key.key)
      })
      await eimzo.installApiKeys()

      // Проверяем версию E-IMZO
      await checkEimzoVersion()

      const rawKeys = await eimzo.listAllUserKeys()

      // Парсим TIN из alias если его нет
      rawKeys.forEach((key: any) => {
        if (!key.TIN && key.alias) {
          const tinMatch = key.alias.match(/1\.2\.860\.3\.16\.1\.1=(\d+)/)
          if (tinMatch) {
            key.TIN = tinMatch[1]
          }
        }
      })

      eKeys.value = rawKeys

      // Загружаем список USB устройств
      await loadUsbDevices()
    } catch (err: any) {
      error.value = err.message || 'An error occurred during initialization'
    } finally {
      isLoading.value = false
    }
  }

  // Проверка версии E-IMZO
  const checkEimzoVersion = async (): Promise<void> => {
    try {
      const version = await eimzo?.checkVersion()
      if (version) {
        // Извлекаем основную версию (например, "5.2.1" -> 5)
        const majorVersion = parseInt(version.split('.')[0])
        const isOldVersion = majorVersion < 5

        versionInfo.value = {
          version: version,
          isOldVersion: isOldVersion
        }
      }
    } catch (err: any) {
      // Игнорируем ошибку проверки версии
    }
  }

  // Загрузка списка USB устройств (ID-Card readers)
  const loadUsbDevices = async (): Promise<void> => {
    try {
      return new Promise((resolve) => {
        window.CAPIWS.callFunction(
          {
            plugin: 'idcard',
            name: 'list_readers'
          },
          (event: any, responseData: any) => {
            if (responseData.success && responseData.readers) {
              usbDevices.value = responseData.readers.map((reader: string, index: number) => ({
                id: `reader_${index}`,
                name: reader
              }))
            }
            resolve()
          },
          () => {
            // Если не удалось получить список - не проблема, просто оставим пустой массив
            resolve()
          }
        )
      })
    } catch (err: any) {
      // Не критичная ошибка, можно продолжать работу
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

  // Подписание через USB токен (без загрузки ключа)
  const signWithToken = async (
    tokenType: 'idcard' | 'baikey' | 'ckc',
    data: string
  ): Promise<{ hash: string; token: string; id: string } | null> => {
    try {
      return new Promise((resolve, reject) => {
        window.CAPIWS.callFunction(
          {
            plugin: 'pkcs7',
            name: 'create_pkcs7',
            arguments: [window.Base64.encode(data), tokenType, 'no']
          },
          (event: any, responseData: any) => {
            if (responseData.success) {
              resolve({
                hash: responseData.pkcs7_64,
                token: '',
                id: tokenType
              })
            } else {
              // Статус -5000 = отмена пользователем (или текст reason содержит "отмен")
              if (responseData.status == -5000 || responseData.reason?.toLowerCase().includes('отмен')) {
                // Пользователь отменил операцию - возвращаем null без ошибки
                resolve(null as any)
                return
              }

              // Сохраняем status и reason для обработки в UI
              const error: any = new Error(responseData.reason || 'Failed to create PKCS7 signature')
              error.status = responseData.status
              error.reason = responseData.reason
              reject(error)
            }
          },
          (err: any) => {
            // Не устанавливаем error.value - он только для ошибок инициализации
            reject(err)
          }
        )
      })
    } catch (err: any) {
      // Не устанавливаем error.value - он только для ошибок инициализации
      throw err
    }
  }

  // Подписание через файл ключа (.p12)
  const getHashESign = async (
    key: ESignKey,
    data: string,
  ): Promise<{ hash: string; token: string; id: string } | null> => {
    if (!eimzo || eKeys.value.length === 0) {
      throw new Error('E-Imzo is not initialized or no keys available')
    }

    try {
      // Load key first
      let loadedKey
      try {
        loadedKey = await eimzo.loadKey(key)
      } catch (loadErr: any) {
        // Проверка на отмену пользователем (status -5000 или текст reason содержит "отмен")
        if (loadErr.status == -5000 || loadErr.reason?.toLowerCase().includes('отмен')) {
          // Пользователь отменил операцию - возвращаем null без ошибки
          return null
        }

        // Сохраняем status и reason для обработки в UI
        const error: any = new Error(loadErr.reason || loadErr.message || 'Ошибка при загрузке ключа')
        error.status = loadErr.status
        error.reason = loadErr.reason
        throw error
      }

      if (!loadedKey?.id) {
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
              // Статус -5000 = отмена пользователем (или текст reason содержит "отмен")
              if (responseData.status == -5000 || responseData.reason?.toLowerCase().includes('отмен')) {
                // Пользователь отменил операцию - возвращаем null без ошибки
                resolve(null as any)
                return
              }

              // Сохраняем status и reason для обработки в UI
              const error: any = new Error(responseData.reason || 'Failed to create PKCS7 signature')
              error.status = responseData.status
              error.reason = responseData.reason
              reject(error)
            }
          },
          (err: any) => {
            // Не устанавливаем error.value - он только для ошибок инициализации
            reject(err)
          }
        )
      })
    } catch (err: any) {
      // Не устанавливаем error.value - он только для ошибок инициализации
      throw err
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

  // Сброс ошибки
  const clearError = () => {
    error.value = null
  }

  initEimzo()

  return {
    eKeys,
    isLoading,
    error,
    usbDevices,
    versionInfo,
    getHashESign,
    signWithToken,
    sign,
    loadKey,
    getAliasOfKey,
    clearError
  }
}
