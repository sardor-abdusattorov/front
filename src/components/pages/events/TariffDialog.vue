<template>
    <v-dialog v-model="isModalOpen" transition="dialog-bottom-transition" width="750" v-if="tariffsList">
        <v-card>
            <base-table :tableHeader="tableHeader" :tableBody="tariffsList" :is-loading="isLoading" :pagination="{
                setCustomClass: true,
                page: 0,
                total: Math.ceil(totalNumber ? totalNumber / 10 : 0),
                pageClickHandler: (page: number) => {
                    currentPage = page - 1
                    fetTariffs()
                }
            }">
            </base-table>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { getAllEventId, getEventSessionTarifs } from '@/services/tarif/tarif.service';
import { TableHeaderTypes } from '@/types/table.types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

const isModalOpen = ref(false)
const sessionId = ref()
const id = ref()
const totalNumber = ref<number | undefined>(0)
const currentPage = ref(0)
const tariffsList = ref<any>()
const isLoading = ref(false)

const open = async (id: number) => {
    isModalOpen.value = true
    sessionId.value = id
    await fetchEvents()
    fetTariffs()
}

const fetchEvents = async () => {
    try {
        const { data: { result } } = await getAllEventId({ eventId: sessionId.value, skip: 0, take: 5 })
        id.value = result.data[0].id
    } catch (e) {
        console.error(e)
    }
}

defineExpose({ open })

const tableHeader = ref<TableHeaderTypes[]>([
    {
        id: 1,
        text: t('tariffs.table.name'),
        role: 'text',
        key: 'name'
    },
    {
        id: 2,
        text: t('tariffs.table.sum'),
        role: 'sum',
        key: 'price'
    },
    {
        id: 3,
        text: t('tariffs.table.color'),
        role: 'color',
        key: 'color'
    },
    {
        id: 4,
        text: t('forTourAgent'),
        role: 'checkbox',
        key: 'forAgent'
    },
])

const fetTariffs = async () => {
    isLoading.value = true
    try {
        const {
            data: { result }
        } = await getEventSessionTarifs({
            eventSessionId: id.value,
            take: 1000,
            skip: 0
        })
        tariffsList.value = result.data
    }
    catch (e) {
        console.error(e)
    } finally {
        isLoading.value = false
    }
}


</script>

<style scoped></style>