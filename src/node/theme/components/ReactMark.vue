<script setup lang="ts">
const REACT_LOGO_SVG = '<svg class="vp-sidebar-react-icon" xmlns="http://www.w3.org/2000/svg" viewBox="-11.5 -10.23174 23 20.46348" aria-hidden="true"><circle cx="0" cy="0" r="2.05" fill="#61dafb"/><g stroke="#61dafb" stroke-width="1" fill="none"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>'
</script>

<template>
  <span class="vp-inline-react-mark" v-html="REACT_LOGO_SVG" aria-hidden="true" title="React-specific API" />
</template>
