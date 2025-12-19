<template>
  <template v-if="!file">
    <v-file-input
      type="file"
      :density="density"
      v-bind="attrs"
      :prepend-icon="icon"
      :label="label"
      :accept="accept"
      :disabled="disabled"
      v-on:change="emit('update:file', $event)"
      :rules="rules"
    />
  </template>
  <div class="file" v-else>
    <div class="file-image">
      <button v-if="!disabled" class="close" @click.stop="emit('clearFile')"><i class="mdi mdi-close"></i></button>
      <i :class="`mdi ${afterUploadIcon} mdi-icons`" v-if="file"></i>
      <input type="file" v-bind="attrs" v-on:change="emit('update:file', $event)" v-if="!disabled" />
    </div>
    <span @click="isViewOpen = true">{{ t('actions.view') }}</span>
  </div>
  <teleport to="body">
    <v-dialog v-model="isViewOpen" width="auto" style="height: 100vh;">
      <v-card class="view">
        <template #text>
          <iframe :src="file as string" frameborder="0"></iframe>
        </template>
        <template v-slot:actions>
          <v-btn class="ms-auto" :text="t('close')" @click="isViewOpen = false"></v-btn>
        </template>
      </v-card>
    </v-dialog>
  </teleport>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

defineProps({
  file: {
    type: [String, Blob],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  attrs: {
    type: Object,
    default: () => ({})
  },
  icon: {
    type: String,
    default: 'mdi-file-pdf-box'
  },
  accept: {
    type: String,
    default: 'application/pdf'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  afterUploadIcon: {
    type: String,
    default: 'mdi-file-pdf-box'
  },
  density: {
    type: String,
    default: 'comfortable'
  },
  rules: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:file', 'clearFile'])

const isViewOpen = ref(false)
const { t } = useI18n()
</script>

<style scoped lang="scss">
.file {
  display: flex;
  align-items: center;
  gap: 20px;
  & > span {
    font-size: 18px;
    color: blue;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
}
.file-image {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 5px;
  border: 1px solid #eee;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    border-radius: 5px;
    display: block;
  }
  input[type='file'] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
  .close {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #f6f6f6;
    color: #000;
    box-shadow: rgba($color: #000000, $alpha: 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
  }

  .mdi-icons {
    font-size: 40px;
    line-height: 1;
    color: red;
  }
}
.view {
  /* a4 size */
  width: 22cm;
  height: 30.7cm;
  display: flex;
  flex-direction: column;
  iframe {
    width: 100%;
    height: 100%;
  }
}
</style>
