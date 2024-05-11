<script setup>
import HelloWorld from './components/HelloWorld.vue'
import "sisdai-css/src/eni.scss"
</script>

<template>
  
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped lang="scss">
@import "node_modules/sisdai-css/src/eni.scss";
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
