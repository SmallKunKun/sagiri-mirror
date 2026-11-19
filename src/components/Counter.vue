<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <button type="button" @click="count++">
    Vue island 点击次数：{{ count }}
  </button>
</template>

<style scoped>
button {
  border: 1px solid #d4d4d8;
  border-radius: 8px;
  background: #fff;
  padding: 8px 14px;
  font: inherit;
  cursor: pointer;
}

button:hover {
  border-color: #18181b;
}
</style>
