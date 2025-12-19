<template>
  <v-dialog max-width="800" :model-value="modelValue" @update:model-value="emit('update:model-value', $event)">
    <v-card :title="t('user.title')">
      <v-card-item>
        <v-row no-gutters>
          <v-col cols="2" sm="1">
            <v-img
              :src="userStore.user?.photo ? userStore.user?.photo : '/no-photo.jpg'"
              alt="no-photo"
              width="40"
              class="rounded mx-auto mr-3"
            ></v-img>
          </v-col>
          <v-col cols="10" sm="11">
            <v-text-field
              density="comfortable"
              color="indigo"
              :label="t('user.organizationName')"
              :model-value="userStore.user?.organizationName"
              :readonly="true"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              density="comfortable"
              class="mr-sm-3"
              color="indigo"
              :label="t('user.firstName')"
              :model-value="userStore.user?.firstName"
              :readonly="true"
            ></v-text-field>
          </v-col>

          <v-col cols="12" sm="4">
            <v-text-field
              density="comfortable"
              class="mr-sm-3"
              color="indigo"
              :label="t('user.middleName')"
              :model-value="userStore.user?.middleName"
              :readonly="true"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              density="comfortable"
              color="indigo"
              :label="t('user.lastName')"
              :model-value="userStore.user?.lastName"
              :readonly="true"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              density="comfortable"
              class="mr-sm-3"
              color="indigo"
              :label="t('user.phone')"
              :model-value="userStore.user?.telefon"
              :readonly="true"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              density="comfortable"
              class="mr-sm-3"
              color="indigo"
              :label="t('user.email')"
              :model-value="userStore.user?.email"
              :readonly="true"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              density="comfortable"
              color="indigo"
              :label="t('user.inn')"
              :model-value="userStore.user?.inn"
              :readonly="true"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-item>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn variant="tonal" color="indigo" @click="closeModelHandler">{{ t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/user.store'
import { useI18n } from 'vue-i18n'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:model-value'])

const userStore = useUserStore()
const { t } = useI18n()
const closeModelHandler = () => {
  emit('update:model-value', false)
}
</script>
