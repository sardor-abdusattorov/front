<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:model-value', $event)" width="600">
    <v-card max-width="100%" :title="t('events.agents')">
      <template #text>
        <table class="vs-table">
          <thead>
            <tr>
              <th>{{ t('events.agent_modal.agent') }}</th>
              <th>{{ t('events.agent_modal.procent_ticket') }}</th>
              <th>{{ t('events.agent_modal.percent_up_ticket') }}</th>
              <th v-if="!isApproveFond">{{ t('events.agent_modal.status') }}</th>
              <th v-else>{{ t('contract.action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(list, index) in agentsList" :key="`${list.agentName}_${index}`">
              <td>{{ list.agentName }}</td>
              <td>{{ list.percentInBilet }}</td>
              <td>{{ list.percentOutBilet }}</td>
              <td v-if="!isApproveFond">{{ list.name }}</td>
              <td v-else>
                <v-checkbox-btn
                  v-model="list.isSelected"
                  :disabled="list.requestSended"
                  class="justify-center"
                  hide-details
                  color="primary"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div class="no-agent" v-if="agentsList.length === 0">{{ t('events.agent_modal.no_agents') }}</div>
      </template>
      <div class="px-4 pb-4 d-flex justify-end ga-3">
        <base-button color="default" @click="closeModelHandler">{{ t('close') }}</base-button>
        <base-button v-if="isApproveFond" :disabled="selectedAgents.length === 0" @click="onClickInvite">{{
          t('invite_agents')
        }}</base-button>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { AgentList } from '@/services/events/dto/events.dto'
import { getListAgentByEvent, getEventAgentsForRequest, sendRequestToAgents } from '@/services/events/events.service'
import { getErrorMessage } from '@/utils/functions'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

const props = defineProps<{ modelValue: boolean; eventId: number; isApproveFond?: boolean }>()
const emit = defineEmits(['update:model-value', 'triggerLoadData'])
const agentsList = ref<AgentList[]>([])
const selectedAgents = computed<number[]>(() => {
  return agentsList.value
    .filter((item: AgentList) => item.isSelected && !item.requestSended)
    .map((item: AgentList) => item.agentId) as number[]
})
const { t } = useI18n()

const closeModelHandler = () => {
  emit('update:model-value', false)
}

const fetchAgentListView = async () => {
  try {
    if (!props.isApproveFond) {
      const { data } = await getListAgentByEvent(props.eventId)
      agentsList.value = data.result
    } else {
      const { data } = await getEventAgentsForRequest(props.eventId)
      agentsList.value = data.result.map((item: AgentList) => ({
        ...item,
        isSelected: item.requestSended
      }))
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const onClickInvite = async () => {
  try {
    const { data } = await sendRequestToAgents({ eventId: props.eventId, agentList: selectedAgents.value })
    if (data.result.success) {
      toast.success(t('contract.successfully'))
      emit('update:model-value', false)
      emit('triggerLoadData')
    }
  } catch (err) {
    toast.error(getErrorMessage(err))
  }
}

onMounted(fetchAgentListView)

onUnmounted(() => {
  agentsList.value = []
})
</script>

<style lang="scss" scoped>
.vs-table {
  width: 100%;
  font-family: inherit;
  border-collapse: collapse;
  thead th {
    font-size: 14px;
    font-weight: 600;
    padding: 6px 16px;
    border: 1px solid #ececec;
  }
  tbody td {
    font-size: 14px;
    padding: 16px;
    text-align: center;
    border: 1px solid #ececec;
  }
}

.no-agent {
  text-align: center;
  font-size: 14px;
  padding: 20px 0;
}
</style>
