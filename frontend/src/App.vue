<script setup lang="ts">
import { onMounted } from 'vue';
import { initFlowbite } from 'flowbite';

onMounted(() => {
    initFlowbite();
})
</script>

<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<style scoped>
</style>
