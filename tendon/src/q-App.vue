<template>
  <div class="container py-4">
    <h1 class="h4 mb-3">解剖学クイズ</h1>

    <!-- ファイル選択 -->
    <div class="mb-3">
      <label for="fileInput" class="form-label">sentences.txt を選択</label>
      <input id="fileInput" type="file" class="form-control" @change="loadFile" />
    </div>

    <!-- 前後ボタン -->
    <div v-if="lines.length" class="mb-3 d-flex justify-content-between">
      <button class="btn btn-outline-primary" @click="prev" :disabled="index === 0">← 前へ</button>
      <button class="btn btn-outline-primary" @click="next" :disabled="index >= lines.length - 1">次へ →</button>
    </div>

    <!-- クイズ表示 -->
    <div v-if="parsedParts.length" class="card p-3 shadow-sm">
      <span v-for="(part, i) in parsedParts" :key="i" style="display: inline">
        <span
          v-if="part.hidden"
          class="badge bg-secondary me-1 align-middle"
          role="button"
          :style="{
            fontSize: '1rem',
            padding: '0.3rem 0.5rem',
            borderRadius: '0.5rem',
            minWidth: (part.width + 1) + 'ch',
            display: 'inline-block',
            textAlign: 'center',
            lineHeight: '1.5',
          }"
          @click="part.revealed = !part.revealed"
        >
          <span v-if="part.revealed">{{ part.text }}</span>
          <span v-else>&nbsp;</span>
        </span>
        <span v-else>{{ part.text }}</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const lines = ref([])             // 全行データ
const index = ref(0)              // 現在の行インデックス
const parsedParts = ref([])       // 現在の行の表示用データ

function parseLine(line) {
  return line
    .split(/(《[^》]+》)/)
    .filter(Boolean)
    .map((segment) => {
      if (segment.startsWith('《') && segment.endsWith('》')) {
        const text = segment.slice(1, -1)
        return { text, hidden: true, revealed: false, width: text.length }
      } else {
        return { text: segment, hidden: false }
      }
    })
}

function loadFile(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    lines.value = e.target.result.split('\n').filter(line => line.trim() !== '')
    index.value = 0
    parsedParts.value = parseLine(lines.value[0])
  }
  reader.readAsText(file)
}

function prev() {
  if (index.value > 0) {
    index.value--
    parsedParts.value = parseLine(lines.value[index.value])
  }
}

function next() {
  if (index.value < lines.value.length - 1) {
    index.value++
    parsedParts.value = parseLine(lines.value[index.value])
  }
}
</script>