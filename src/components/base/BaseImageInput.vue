<template>
  <template v-if="!image">
    <v-file-input
      type="file"
      density="comfortable"
      v-bind="attrs"
      prepend-icon=""
      :label="label"
      :accept="accept"
      :disabled="disabled"
      v-on:change="emit('update:file', $event)"
      :prepend-inner-icon="icon"
      :rules="rules"
    />
  </template>
  <div class="file-image" v-else>
    <button v-if="!disabled" class="close" @click.stop="emit('clearImage')"><i class="mdi mdi-close"></i></button>
    <img :src="image as string" />
    <input type="file" v-bind="attrs" v-on:change="emit('update:file', $event)" v-if="!disabled" />
    <i class="mdi mdi-camera" v-if="!disabled"></i>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  image: {
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
    default: 'mdi-camera'
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  rules: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:file', 'clearImage'])
</script>

<style scoped lang="scss">
.file-image {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 5px;
  border: 1px solid #eee;
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

  .mdi-camera {
    position: absolute;
    bottom: 2px;
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
    opacity: 0;
    transition: all 0.3s ease;
  }
  &:hover {
    .mdi-camera {
      opacity: 1;
    }
  }
}
</style>
