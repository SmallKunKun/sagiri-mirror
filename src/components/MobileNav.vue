<script setup lang="ts">
import { ref } from "vue";

interface NavLink {
  label: string;
  href: string;
}

defineProps<{
  links: NavLink[];
}>();

const open = ref(false);
</script>

<template>
  <div class="mobile-nav">
    <button
      class="mobile-nav-toggle"
      type="button"
      :aria-expanded="open"
      aria-controls="mobile-menu"
      aria-label="打开菜单"
      @click="open = !open"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <nav v-if="open" id="mobile-menu" class="mobile-menu" aria-label="移动端导航">
      <a
        v-for="link in links"
        :key="link.href"
        :href="link.href"
        @click="open = false"
      >
        {{ link.label }}
      </a>
    </nav>
  </div>
</template>

<style scoped>
.mobile-nav {
  display: none;
}

.mobile-nav-toggle {
  display: grid;
  gap: 4px;
  width: 36px;
  height: 36px;
  place-content: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}

.mobile-nav-toggle span {
  display: block;
  width: 18px;
  height: 2px;
  border-radius: 2px;
  background: #555;
}

.mobile-menu {
  position: absolute;
  top: 52px;
  right: 16px;
  left: 16px;
  z-index: 20;
  display: grid;
  gap: 2px;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

.mobile-menu a {
  padding: 10px 12px;
  border-radius: 6px;
  color: #555;
  text-decoration: none;
}

.mobile-menu a:hover {
  background: #f7f7f7;
  color: #ff4d00;
}

@media (max-width: 991px) {
  .mobile-nav {
    display: block;
    position: relative;
  }
}
</style>
