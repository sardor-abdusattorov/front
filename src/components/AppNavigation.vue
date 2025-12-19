<template>
  <v-navigation-drawer :model-value="open" @update:model-value="emit('update:open', $event)" class="app-navigation">
    <div class="app-navigation--inner">
      <router-link class="app-navigation--logo" to="/"><img src="@/assets/images/new-logo.png" alt="logo" /></router-link>
      <div class="app-navigation--user" @click="isUserDialogOpen = true">
        <img
          class="app-navigation--user__img"
          :src="userStore.user?.photo ? `${API_URL}/${userStore.user?.photo}` : '/no-photo.jpg'"
          alt="no-photo"
        />
        <div class="app-navigation--user__name">{{ userStore.user?.firstName }} {{ userStore.user?.lastName }}</div>
      </div>
      <v-list v-model:opened="defaultNavigator">
        <template v-for="navigator in navigators">
          <v-list-item
            v-if="!navigator.isGroup && navigator.isPermitted"
            density="compact"
            :prepend-icon="navigator.icon"
            :title="navigator.title"
            :to="navigator.to"
          >
            <template v-if="navigator?.notification && navigator.notification > 0" v-slot:append>
              <v-badge color="purple" :content="navigator.notification" inline></v-badge>
            </template>
          </v-list-item>

          <v-list-group :value="navigator.title" v-else>
            <template v-slot:activator="{ props }" v-if="navigator.isPermitted">
              <v-list-item
                density="compact"
                v-bind="props"
                :prepend-icon="navigator.icon"
                :title="navigator.title"
              ></v-list-item>
            </template>
            <template v-for="child in navigator.children">
              <v-list-item
                density="compact"
                v-if="child.isPermitted && !child.subChildren"
                :title="child.title"
                :value="child.title"
                :prepend-icon="child.icon"
                :to="child.to"
              ></v-list-item>
              <v-list-group v-else>
                <template v-slot:activator="{ props }" v-if="child.isPermitted">
                  <v-list-item
                    style="padding-inline-start: 18px !important"
                    density="compact"
                    v-bind="props"
                    :prepend-icon="child.icon"
                    :title="child.title"
                  ></v-list-item>
                </template>
                <template v-for="subChild in child.subChildren">
                  <v-list-item
                    density="compact"
                    v-if="subChild.isPermitted"
                    :title="subChild.title"
                    :value="subChild.title"
                    :prepend-icon="subChild.icon"
                    :to="subChild.to"
                  />
                </template>
              </v-list-group>
            </template>
          </v-list-group>
        </template>
      </v-list>
    </div>
    <img
      src="@/assets/images/top-pattern.png"
      alt="top-pattern"
      class="app-navigation--bg"
      :style="{ opacity: isDark ? 0.3 : 1 }"
    />

    <user-dialog :model-value="isUserDialogOpen" @update:model-value="isUserDialogOpen = $event" />
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import { useTheme } from 'vuetify'
import { useNavigators } from '@/composables/useNavigators'

defineProps({ open: Boolean })
const emit = defineEmits(['update:open'])

import { useUserStore } from '@/stores/user.store'
import { API_URL } from '@/utils/config'

const userStore = useUserStore()
const isUserDialogOpen = ref(false)
const theme = useTheme()
const isDark = computed(() => theme.global.name.value === 'dark')

const { navigators } = useNavigators()

const defaultNavigator = ref(null)
</script>
