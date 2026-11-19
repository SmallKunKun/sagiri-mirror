<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import type { SearchEntry } from "../data/search";

interface Props {
  entries: SearchEntry[];
}

const props = defineProps<Props>();
const query = ref("");

const terms = computed(() =>
  query.value
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean),
);

const results = computed(() => {
  if (terms.value.length === 0) return [];

  return props.entries
    .map((entry) => {
      const title = entry.title.toLowerCase();
      const summary = entry.summary.toLowerCase();
      const tags = entry.tags.join(" ").toLowerCase();
      const category = entry.category.toLowerCase();
      const text = entry.text.toLowerCase();
      const haystack = `${title} ${summary} ${tags} ${category} ${text}`;

      if (!terms.value.every((term) => haystack.includes(term))) return null;

      let score = 0;
      for (const term of terms.value) {
        if (title.includes(term)) score += 5;
        if (tags.includes(term) || category.includes(term)) score += 3;
        if (summary.includes(term)) score += 2;
        if (text.includes(term)) score += 1;
      }

      return { entry, score };
    })
    .filter(
      (result): result is { entry: SearchEntry; score: number } =>
        result !== null,
    )
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));
});

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(value: string) {
  let html = escapeHtml(value);
  for (const term of terms.value) {
    const pattern = new RegExp(`(${escapeRegExp(term)})`, "gi");
    html = html.replace(pattern, "<mark>$1</mark>");
  }
  return html;
}

function snippet(entry: SearchEntry) {
  const source = entry.summary || entry.text;
  return source.length > 180 ? `${source.slice(0, 180).trimEnd()}…` : source;
}

function updateUrl() {
  const url = new URL(window.location.href);
  if (query.value.trim()) {
    url.searchParams.set("q", query.value.trim());
  } else {
    url.searchParams.delete("q");
  }
  window.history.replaceState(null, "", url);
}

onMounted(() => {
  query.value = new URLSearchParams(window.location.search).get("q") ?? "";
});

watch(query, updateUrl);
</script>

<template>
  <section class="search-page">
    <form class="search-page-form" role="search" @submit.prevent>
      <label class="sr-only" for="search-page-input">搜索远端文章</label>
      <input
        id="search-page-input"
        v-model="query"
        type="search"
        placeholder="搜索远端文章…"
        autocomplete="off"
      />
    </form>

    <p v-if="!query.trim()" class="search-hint">输入关键词，搜索远端文章。</p>
    <p v-else-if="results.length === 0" class="search-hint">
      没有找到匹配的文章。
    </p>

    <ul v-else class="search-results">
      <li v-for="{ entry } in results" :key="entry.slug">
        <a :href="`/post/${entry.slug}/`">
          <h2 v-html="highlight(entry.title)"></h2>
          <p v-html="highlight(snippet(entry))"></p>
          <div class="search-meta">
            <span v-if="entry.category !== '未分类'">{{ entry.category }}</span>
            <span v-for="tag in entry.tags" :key="tag">#{{ tag }}</span>
          </div>
        </a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.search-page {
  padding: 32px 40px;
  border-radius: 5px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.search-page-form {
  margin-bottom: 24px;
}

.search-page-form input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #eee;
  border-radius: 5px;
  background: #fff;
  color: #555;
  font: inherit;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-page-form input:focus {
  border-color: #97dffd;
}

.search-hint {
  margin-bottom: 0;
  color: #999;
  text-align: center;
}

.search-results {
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.search-results a {
  display: block;
  padding: 18px 20px;
  border: 1px solid #eee;
  border-radius: 5px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-results a:hover {
  border-color: rgba(255, 77, 0, 0.28);
  box-shadow: 0 6px 18px rgba(51, 68, 95, 0.08);
}

.search-results h2 {
  margin-bottom: 6px;
  color: #444;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.45;
}

.search-results p {
  margin-bottom: 10px;
  color: #555;
  font-size: 14px;
  line-height: 1.8;
}

.search-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #999;
  font-size: 12px;
}

.search-results :deep(mark) {
  padding: 0 2px;
  background: rgba(151, 223, 253, 0.55);
  color: inherit;
}

@media (max-width: 991px) {
  .search-page {
    padding: 24px 18px;
    border-radius: 0;
  }
}
</style>
