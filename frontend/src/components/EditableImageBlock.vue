<script setup lang="ts">
import { ref } from 'vue';

const fileInput = ref<HTMLInputElement | null>(null);
const imageSrc = ref('');

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      imageSrc.value = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      imageSrc.value = reader.result;
    };
    reader.readAsDataURL(file);
  }
};

const handlePaste = (event) => {
  const items = event.clipboardData.items;
  for (let item of items) {
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      const reader = new FileReader();
      reader.onload = () => {
        imageSrc.value = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }
};
</script>

<style>
.upload-area {
  border: 2px dashed #ccc;
  padding: 20px;
  text-align: center;
  cursor: pointer;
}
.upload-area img {
  max-width: 100%;
  height: auto;
  margin-top: 10px;
}
</style>


<template>
  <div 
    @dragover.prevent 
    @drop.prevent="handleDrop" 
    @paste.prevent="handlePaste"
    class="upload-area"
    @click="triggerFileInput"
  >
    <input 
      type="file" 
      ref="fileInput" 
      @change="handleFileChange" 
      accept="image/*"
      style="display: none;"
    />
    <p>이미지를 드래그 앤 드롭하거나, 클릭해서 선택하거나, 클립보드에서 붙여넣기 하세요.</p>
    <img v-if="imageSrc" :src="imageSrc" alt="Uploaded Image" />
  </div>
</template>
