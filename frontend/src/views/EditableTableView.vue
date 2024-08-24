<script setup lang="ts">
import EditableImageBlock from '@/components/EditableImageBlock.vue'
</script>

<template>
  <div>
    <div class="container">
      <ul>
        <li v-for="index in 5" :key="index">
          <EditableImageBlock />
        </li>
      </ul>
    </div>
  </div>
</template>