<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { updateMXIK } from '@/services/directory/directory.service'

const { t } = useI18n()

const item = ref()
const lang = ref('ru')
const isOpen = ref(false)
const isUpdated = ref(false)
const select = ref('selected')

const tableHeader = computed(() => {
  let data = [
    {
      text: t('halls.name'),
      role: 'text',
      key: lang.value == 'ru' ? 'nameRu' : 'nameUz',
      id: ''
    },
    {
      text: t('directory.ikpu'),
      role: 'text',
      key: select.value == 'selected' ? 'spic' : 'mxikCode',
      id: ''
    },
    {
      text: t('directory.barcode'),
      role: 'text',
      key: 'code',
      id: ''
    }
  ]
  if (select.value == 'selected') {
    data.push({
      text: t('directory.selectedByDefault'),
      role: 'status',
      key: 'isMain',
      id: ''
    })
  }
  return data
})

const open = (data: any, language: string, selection: string) => {
  select.value = selection
  lang.value = language
  item.value = data.item
  isOpen.value = true
}


const updateRow = async (rowIndex:number) => {
  isUpdated.value = true
  item.value.packages.forEach((row:any, index:number) => {
    if (index !== rowIndex) {
      row.isMain = false
    }
  })
}

watch(isOpen, async (val) => {
  if (val == false && isUpdated.value) {
    await updateMXIK(item.value)
    isUpdated.value = false
  }
})

defineExpose({ open })
</script>

<template>
  <v-dialog v-model="isOpen" max-width="650">
    <v-card>
      <v-card-item>
        <v-card-title>
          {{ t('directory.packages') }}
        </v-card-title>
        <v-table>
          <thead>
          <tr>
            <th v-for="header in tableHeader" :key="header.id">{{ header.text }}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(row, rowIndex) in item.packages" :key="row.id">
            <td v-for="column in tableHeader" :key="column.id">
              <template v-if="typeof row[column.key]=='boolean'">
                <v-checkbox-btn
                  v-model="row[column.key]"
                  @change="updateRow(rowIndex)"
                />
              </template>
              <template v-else>
                {{ row[column.key] }}
              </template>
            </td>
          </tr>
          </tbody>
        </v-table>
        <v-divider />
        <div class="d-flex flex-column align-end mt-2">
          <BaseButton @click="isOpen=false" color="primary">{{ t('actions.close') }}</BaseButton>
        </div>
      </v-card-item>
    </v-card>
  </v-dialog>
</template>


