<template>
  <v-card class="pa-4 mb-4">
    <base-title back :to="`/palaces/schemas/${route.params.id}?name=${route.query.name}`"
      :title="isEdit ? t('halls.halls_edit') : t('halls.halls_add')">
      <template #actions>
        <base-button v-if="isEdit && create.svgText" @click="clone">{{ t('schema.clone') }}</base-button>
      </template>
    </base-title>
    <v-form v-model="valid" @submit.prevent="handleSubmit">
      <p class="mb-4 mt-2">
        <strong>{{ t('sold_tickets.table.palace') }}</strong>: {{ route.query.name }}
      </p>
      <v-row>
        <v-col md="6" cols="12">
          <base-input :rules="[rules.required]" required :placeholder="t('halls.name')" v-model="create.name" />
        </v-col>
        <v-col md="6" cols="12">
          <v-checkbox color="primary" v-model="create.isActive" hide-details :label="t('active')"></v-checkbox>
        </v-col>
        <v-col md="6" cols="12">
          <base-document-input :label="t('halls.svg')" accept="image/svg+xml" icon="mdi-file-image"
            @update:file="svgToHTML" />
        </v-col>
        <v-col md="6" cols="12">
          <base-document-input :file="create.confirmationFile ? `${storageUrl}/${create.confirmationFile}` : ''"
            :label="t('halls.document')" @update:file="addFile" @clear-file="create.confirmationFile = ''" />
        </v-col>
        <v-col md="6" cols="12">
          <base-button type="button" color="red" class="mr-2"
            @click="router.push(`/palaces/schemas/${route.params.id}?name=${route.query.name}`)">{{ t('actions.cancel')
            }}</base-button>
          <base-button :loading="submitLoading" type="submit">{{
            isEdit ? t('actions.edit') : t('actions.add')
          }}</base-button>
        </v-col>
      </v-row>
    </v-form>
  </v-card>
  <v-card class="pa-4 mt-4 shema-form" v-show="create.svgText">
    <h2 class="mb-3">{{ t('halls.hall_scheme') }}</h2>
    <div class="d-flex align-center justify-center ga-3 mb-4" v-if="!isEdit">
      <v-btn size="small" color="teal" icon="mdi-arrow-left" :disabled="isReversed" @click="redraw(true)"></v-btn>
      <v-btn size="small" color="teal" icon="mdi-arrow-right" :disabled="!isReversed" @click="redraw(false)"></v-btn>
    </div>
    <div id="map" class="map"></div>
  </v-card>
  <change-row-seats-number-dialog v-model="isDialogOpen" :dialog-state="dialogState" :isReversed="isReversed"
    @save="saveDialog" @position-clicked="reChangeRow" />
</template>

<script lang="ts" setup>
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'

import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

import { getErrorMessage, sleep } from '@/utils/functions'
import { useRules } from '@/utils/rules'

import { createAddImage } from '@/services/events/events.service'
import { getPalaceHallById, palaceHallCreate, palaceHallUpdate } from '@/services/palace/palace.service'

import { PalaceHallDto } from '@/services/palace/dto/palace.dto'
import { Sector } from '@/services/palace/model/palace.model'
import { useTooltip } from '@/composables/useTooltip'
import { useEventsStore } from '@/stores/events.store'

const props = withDefaults(defineProps<{ isEdit?: boolean }>(), {
  isEdit: false
})

const storageUrl = import.meta.env.VITE_API_URL
const { t } = useI18n()
const { renderTooltip } = useTooltip()
const isReversed = ref(false)
const isDialogOpen = ref(false)

const store = useEventsStore()

const rules = useRules()
const route: any = useRoute()
const router = useRouter()
const map = ref<L.Map>()
const submitLoading = ref(false)

const elementRow = ref<HTMLElement>()
const oldSeatRow = ref('')
const oldSeatSector = ref('')

const valid = ref(false)

const create = ref<PalaceHallDto>({
  name: '',
  isActive: false,
  confirmationFile: '',
  palaceId: Number(route.params.id),
  svgJson: '',
  svgText: ''
})

const dialogState = ref({ sector: '', seat: '', row: '', id: '' })

const clone = () => {
  store.storedSvg.svgText = create.value.svgText
  store.storedSvg.svgJson = create.value.svgJson
  router.push(`/palaces/schemas/${route.params.id}/add?name=${route.query.name}`)
}

const getPalaceById = async () => {
  try {
    const { data } = await getPalaceHallById(Number(route.query.id))
    create.value = {
      name: data.result.name,
      isActive: data.result.isActive,
      confirmationFile: data.result.confirmationFile,
      palaceId: data.result.palaceId,
      svgText: data.result.svgText,
      svgJson: ''
    }

    if (create.value.svgText) {
      createSvgOverlay(create.value.svgText)
      swgToJson()
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const addFile = async (file: any) => {
  const uploadedFile = file.target.files[0]
  if (uploadedFile) {
    const formData = new FormData()
    formData.append('field', 'palacehallconfirmationfiles')
    formData.append('files', uploadedFile)
    try {
      const {
        data: { result }
      } = await createAddImage(formData)
      create.value.confirmationFile = result.path
      toast.success(t('messages.file_uploaded'))
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }
}

const handleSubmit = async () => {
  if (!valid.value) return

  try {
    submitLoading.value = true
    if (props.isEdit) {
      console.log(route)
      const { data } = await palaceHallUpdate({ ...create.value, id: Number(route.query.id) })
      if (data.result.success) {
        toast.success(t('messages.updated_success'))
        await sleep(1000)
        router.go(-1)
      }
    } else {
      const { data } = await palaceHallCreate(create.value)
      if (data.result.success) {
        toast.success(t('messages.added_success'))
        await sleep(1000)
        router.push(`/palaces/schemas/${route.params.id}?name=${route.query.name}`)
      }
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    submitLoading.value = false
  }
}

const svgToHTML = async (e: any) => {
  const file = e.target.files[0]

  if (!file || file.type !== 'image/svg+xml') {
    toast.warning(t('messages.svg_warning'))
    return
  }

  await sleep(50)

  const reader = new FileReader()

  reader.readAsText(file)


  reader.onload = (evt: ProgressEvent<FileReader>) => {
    const div = document.createElement('div')
    if (evt.target?.result) {
      div.innerHTML = evt.target.result as string
      const wrapper = div.querySelector('#sm-main') as HTMLElement
      redrawSvg(wrapper)


      create.value.svgText = div.innerHTML
      createSvgOverlay(create.value.svgText)


      swgToJson()
    }
  }
}

const redraw = (state: boolean) => {
  isReversed.value = state
  const wp = document.querySelector('#sm-main') as HTMLElement
  redrawSvg(wp)
  swgToJson()
  drawTooltips()
}

const reChangeRow = (state: boolean) => {
  if(state) {
    saveRow(true)
  } else {
    saveRow(true, false)
  }
}

const swgToJson = () => {
  const jsonSeatMap: Sector[] = []
  let id = 1
  const smMain = document.querySelector('#sm-main') as HTMLElement | null
  if (smMain) {
    const sectors = smMain.children

    Array.from(sectors).forEach((elementSector: Element, indxSector: number) => {
      const sector = elementSector.id
      const sectorJson: Sector = { name: sector, seat: [] }

      elementSector.setAttribute('data-sector', sector)
      const rows = elementSector.children

      Array.from(rows).forEach((elementRow: Element, indxRow: number) => {
        const rowNumber = elementRow.getAttribute('data-row')
        const seats = elementRow.querySelectorAll('g')

        Array.from(seats).forEach((elementSeat: Element, indxSeat: number) => {
          const seatNumber = elementSeat.getAttribute('data-seat')
          const idAttribute = elementSeat.getAttribute('id')

          if (idAttribute) {
            const obj = idAttribute.split('seat-')
            if (obj && obj[1]) {
              id = +obj[1]
            } else {
              toast.warn('Something went wrong')
              return
            }

            if (rowNumber && seatNumber) {
              sectorJson.seat.push({
                seatId: id,
                row: rowNumber,
                number: seatNumber
              })
            }
          }
        })
      })

      jsonSeatMap.push(sectorJson)
    })

    create.value.svgJson = JSON.stringify(jsonSeatMap)
  }
}


const redrawSvg = (smMain: HTMLElement) => {
  const jsonSeatMap: Sector[] = []
  let id = 1
  if (smMain) {
    const sectors = smMain.children
    let sectorNumber = 1

    Array.from(sectors).forEach((elementSector: Element, indxRow) => {
      const sector = elementSector.id
      const sectorJson: Sector = { name: sector, seat: [] }

      elementSector.setAttribute('data-sector', sector)
      const rows = elementSector.children
      let row = rows.length

      if (rows) {
        const rowsDy: number[] = []
        const rowsDySorted: number[] = []
        sectorNumber = indxRow

        Array.from(rows).forEach((elementRow: Element, indxRow: number) => {
          const gs = elementRow.querySelectorAll('g')
          const path = gs[0]?.querySelector('path')
          const d = path?.getAttribute('d')?.split(/(?=[LMCc])/)
          if (d) {
            const dy = parseFloat(d[0].slice(1).split(',')[1])
            rowsDy.push(dy)
            rowsDySorted.push(dy)
          }
        })

        rowsDySorted.sort((a, b) => b - a)
        Array.from(rows).forEach((elementRow: Element, indxRow: number) => {
          const rowNumber = rowsDySorted.indexOf(rowsDy[indxRow]) + 1

          elementRow.setAttribute('data-sector', sector)
          elementRow.setAttribute('data-row', rowNumber.toString())

          const seats = elementRow.querySelectorAll('g')
          if (seats) {
            const dxs: number[] = []
            const dxsSorted: number[] = []

            Array.from(seats).forEach((elementSeat: Element) => {
              const path = elementSeat.querySelector('path')
              const d = path?.getAttribute('d')?.split(/(?=[LMCc])/)
              if (d) {
                const dx = parseFloat(d[0].slice(1).split(',')[0])
                dxs.push(dx)
                dxsSorted.push(dx)
              }
            })

            isReversed.value ? dxsSorted.sort((a, b) => b - a) : dxsSorted.sort((a, b) => a - b)

            Array.from(seats).forEach((elementSeat: Element, indxSeat: number) => {

              const seatNumber = dxsSorted.indexOf(dxs[indxSeat]) + 1
              const textElement = elementSeat.querySelector('text')
              if (textElement) {
                textElement.innerHTML = seatNumber.toString()
              }

              elementSeat.setAttribute('id', 'seat-' + id)
              elementSeat.setAttribute('data-sector', sector)
              elementSeat.setAttribute('data-row', rowNumber.toString())
              elementSeat.setAttribute('data-seat', seatNumber.toString())
              elementSeat.setAttribute('data-toggle', 'tooltip')
              elementSeat.setAttribute('data-placement', 'top')
              elementSeat.setAttribute('data-html', 'true')
              elementSeat.setAttribute('title', `<p>Sector: ${sector} Row: ${rowNumber} Seat: ${seatNumber}</p>`)
              elementSeat.setAttribute(
                'data-original-title',
                `<p>Sector: ${sector} Row: ${rowNumber} Seat: ${seatNumber}</p>`
              )
              elementSeat.classList.add('seat')
                ; (elementSeat as HTMLElement).style.cursor = 'pointer'


              sectorJson.seat.push({
                seatId: id,
                row: rowNumber ? rowNumber.toString() : '',
                number: seatNumber ? seatNumber.toString() : ''
              })
              id++
            })
          }

          row--
        })
      }

      sectorNumber++
      jsonSeatMap.push(sectorJson)
    })

    create.value.svgJson = JSON.stringify(jsonSeatMap)
    create.value.svgText = smMain.parentElement?.parentElement?.innerHTML || ''
  }
}

const createSvgOverlay = (svgText: string) => {
  if (map.value) {
    map.value.remove()
  }

  const svgElement = document.createElement('div') as any
  map.value = L.map('map', {
    zoomControl: true,
    attributionControl: false,
    doubleClickZoom: false,
    maxZoom: 9,
    minZoom: 5
  }).setView({ lat: 31, lng: -130 }, 6)
  // onMapReady(map.value);
  const svgElementBounds: L.LatLngBoundsExpression = [
    [31, -130],
    [13, -100]
  ]
  svgElement.innerHTML = svgText
  L.svgOverlay(svgElement, svgElementBounds, { interactive: true, zIndex: 0 }).addTo(map.value)
  drawTooltips()
}


const drawTooltips = () => {
  const smMain = document.querySelector('#sm-main') as HTMLElement | null
  if (!smMain) return
  const sectors = smMain.children

  Array.from(sectors).forEach((elementSector: Element) => {
    const sections = elementSector.querySelectorAll('g') as NodeListOf<SVGGElement>
    sections.forEach((section) => {
      renderTooltip(section)
      const sections = section.querySelectorAll('g') as NodeListOf<SVGGElement>
      sections.forEach((element) => {
        doubleClickHandler(element)
      })
    })
  })
}

const doubleClickHandler = (element: SVGGElement) => {
  element.addEventListener('dblclick', () => {
    const sector = element.getAttribute('data-sector') || ''
    const row = element.getAttribute('data-row') || ''
    elementRow.value = element.parentNode as HTMLElement
    const seat = element.getAttribute('data-seat') || ''
    const id = element.id.split('-')[1] || ''

    oldSeatRow.value = row
    oldSeatSector.value = sector

    dialogState.value = { sector, seat, row, id }
    isDialogOpen.value = true
  })
}

const saveRow = (withSeatNumber = false, isL2R = true) => {
  let element = elementRow.value as any
  element.setAttribute('data-row', dialogState.value.row)
  element.children.slice = Array.prototype.slice
  let a = [...element.children]

  a.sort((a, b) => {
    let id1 = a.attributes['data-seat'].value;
    let id2 = b.attributes['data-seat'].value;
    return id1 - id2;
  });
  for(let j = 0; j < a.length; j++) {
    const seat = a[j]
    if(seat.tagName !== 'g') continue;
    if(withSeatNumber) {
     if(isL2R) {
      // @ts-expect-error
      saveSeat(seat, j + Number(dialogState.value.seat))
     } else {
      const seatNumber = Number(dialogState.value.seat) + (a.length - j - 1);
      // @ts-expect-error
      saveSeat(seat, seatNumber)

     }
    } else {
      const seatNumber = seat.querySelector('text').innerHTML
      seat.setAttribute('data-row', dialogState.value.row)
      seat.setAttribute('title', `<p>Sector: ${dialogState.value.sector} Row: ${dialogState.value.row} Seat: ${seatNumber}</p>`)
      seat.setAttribute('data-original-title', `<p>Sector: ${dialogState.value.sector} Row: ${dialogState.value.row} Seat: ${seatNumber}</p>`)
    }
  }

  let data = JSON.parse(create.value.svgJson)
  let sector = data.find((sector: any) => sector.name === oldSeatSector.value)

  if(sector) {
    let rows = sector.seat.find((row: any) => row.row === oldSeatRow.value)
    if(rows) {
      for(let index = 0; index < rows.length; index++) {
        const row = rows[index]
        row.row = dialogState.value.row
      }
      create.value.svgJson = JSON.stringify(data)
      create.value.svgText = document.querySelector('#sm-main')?.parentElement?.parentElement?.innerHTML!
      drawTooltips()
    }
  }
}

const saveSeat = (element = document.querySelector(`#seat-${dialogState.value.id}`), editedSeatNumber = dialogState.value.seat) => {
  let arr = (element?.attributes as NamedNodeMap).getNamedItem('id')?.value.split('seat-');
  let seatIdNumber = 0
  if (arr && arr[1]) {
    seatIdNumber = Number(arr[1])
  } else {
    toast.warn('Something went wrong')
    return
  }

  let text = element?.querySelector('text')!
  text.textContent = editedSeatNumber;
  element?.setAttribute('data-sector', dialogState.value.sector)
  element?.setAttribute('data-row', dialogState.value.row)
  element?.setAttribute('data-seat', editedSeatNumber)

  element?.setAttribute('title', `<p>Sector: ${dialogState.value.sector} Row: ${dialogState.value.row} Seat: ${editedSeatNumber}</p>`)
  element?.setAttribute('data-original-title', `<p>Sector: ${dialogState.value.sector} Row: ${dialogState.value.row} Seat: ${editedSeatNumber}</p>`)

  const seatArray = JSON.parse(create.value.svgJson)
  for (let index = 0; index < seatArray.length; index++) {
    const element = seatArray[index];
    let found = element.seat.find((seat: any) => seat.seatId === seatIdNumber);
    if (found) {
      found.row = dialogState.value.row;
      found.number = editedSeatNumber;
      create.value.svgJson = JSON.stringify(seatArray);
      break
    }
  }

  create.value.svgText = document.querySelector('#sm-main')?.parentElement?.parentElement?.innerHTML!
  drawTooltips()
}

const saveDialog = () => {
  let element = document.querySelector(`#seat-${dialogState.value.id}`)
  let row = element?.parentNode as HTMLElement;
  let arr = (element?.attributes as NamedNodeMap).getNamedItem('id')?.value.split('seat-');
  let seatIdNumber = 0
  if (arr && arr[1]) {
    seatIdNumber = Number(arr[1])
  }
  if (!element) {
    isDialogOpen.value = false
    return toast.error(t('messages.not_found'))
  }
  if (element) {
    element.setAttribute('data-sector', dialogState.value.sector)
    element.setAttribute('data-row', dialogState.value.row)
    if (row) {
      row.setAttribute('data-row', dialogState.value.row)
      let seats = Array.from(row.children).sort((a, b) => {
        let id1 = Number(a.getAttribute('data-seat'));
        let id2 = Number(b.getAttribute('data-seat'));
        return id1 - id2;
      });
      seats.forEach((seat) => {
        if (seat.tagName !== 'g') return;
        seat.setAttribute('data-row', String(dialogState.value.row));

        const titleContent = `<p>Sector: ${dialogState.value.sector} Row: ${dialogState.value.row} Seat: ${dialogState.value.seat}</p>`;
        seat.setAttribute('title', titleContent);
        seat.setAttribute('data-original-title', titleContent);
      });
    }
    const textElement = element.querySelector('text');
    if (textElement) {
      textElement.textContent = String(dialogState.value.seat);
    }
    element.setAttribute('data-seat', dialogState.value.seat)
    element.setAttribute('data-toggle', 'tooltip')
    element.setAttribute('data-placement', 'top')
    element.setAttribute('data-html', 'true')
    element.setAttribute(
      'title',
      `<p>Sector: ${dialogState.value.sector} Row: ${dialogState.value.row} Seat: ${dialogState.value.seat}</p>`
    )
    element.setAttribute(
      'data-original-title',
      `<p>Sector: ${dialogState.value.sector} Row: ${dialogState.value.row} Seat: ${dialogState.value.seat}</p>`
    )
  }

  const seatArray = JSON.parse(create.value.svgJson)
  for (let index = 0; index < seatArray.length; index++) {
    const element = seatArray[index];
    let found = element.seat.find((seat: any) => seat.seatId === seatIdNumber);
    if (found) {
      found.row = dialogState.value.row;
      found.number = dialogState.value.seat;
      create.value.svgJson = JSON.stringify(seatArray);
      break
    }
  }

  create.value.svgText = document.querySelector('#sm-main')?.parentElement?.parentElement?.innerHTML!

  drawTooltips()
  toast.success(t('messages.saved_success'))
  isDialogOpen.value = false
}

onMounted(async () => {
  if (props.isEdit) {
    await getPalaceById()
  }
  if (store.storedSvg.svgText) {
    create.value.svgText = store.storedSvg.svgText
    create.value.svgJson = store.storedSvg.svgJson

    createSvgOverlay(create.value.svgText)
  }
})
</script>

<style lang="scss">
.shema-form .map {
  width: 100%;
  aspect-ratio: 16 / 9;
}
</style>
