<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ImageBlock } from '@/types';

const props = defineProps<{
  block: ImageBlock;
}>();

const emit = defineEmits(['update:block']);

const isSelected = ref(props.block.isSelected);

watch(isSelected, (newVal) => {
  emit('update:block', { ...props.block, isSelected: newVal });
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      emit('update:block', { ...props.block, imageSrc: reader.result as string });
    };
    reader.readAsDataURL(file);
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  const file = event.dataTransfer?.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      emit('update:block', { ...props.block, imageSrc: reader.result as string });
    };
    reader.readAsDataURL(file);
  }
};
</script>

<template>
  <div class="upload-area">
    <input type="checkbox" v-model="isSelected" />
    <input 
      type="file" 
      ref="fileInput" 
      @change="handleFileChange" 
      accept="image/*"
      style="display: none;"
    />
    <div 
      @dragover.prevent 
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <p>이미지를 드래그 앤 드롭하거나, 클릭해서 선택하세요.</p>
      <p>{{ props.block.isSelected }}</p>
      <p>{{ isSelected }}</p>
      <img v-if="props.block.imageSrc" :src="props.block.imageSrc" alt="Uploaded Image" />
    </div>
  </div>
</template>

<style>
.upload-area {
  border: 2px dashed #ccc;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 10px;
}
.upload-area img {
  max-width: 100%;
  height: auto;
  margin-top: 10px;
}
</style>
