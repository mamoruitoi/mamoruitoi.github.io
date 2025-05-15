// 修正されたVueの例
<template>
  <div class="container mt-4">
    <header class="d-flex align-items-center mb-3">
      <img src="/tendon-icon.png" alt="Logo" class="me-2" style="height: 40px">
      <h3 class="m-0">Anatomy Practice</h3>
    </header>

    <div v-if="!authenticated" class="text-center">
      <input v-model="passwordInput" type="password" class="form-control mb-2" placeholder="Enter password" />
      <button @click="authenticate" class="btn btn-primary">Login</button>
    </div>

    <div>
      <div v-if="!selectedSubject">
        <h4>教科を選択してください</h4>
        <button v-for="subject in subjects" :key="subject" class="btn btn-outline-primary m-1" @click="selectSubject(subject)">
          {{ subject }}
        </button>
      </div>

      <div v-else-if="!selectedUnit">
        <h4>単元を選択してください</h4>
        <button v-for="unit in units[selectedSubject]" :key="unit" class="btn btn-outline-secondary m-1" @click="selectUnit(unit)">
          {{ unit }}
        </button>
      </div>

      <div v-else>
        <div class="progress mb-3">
          <div class="progress-bar" role="progressbar" :style="{ width: progress + '%' }" />
        </div>

        <transition name="slide-fade" mode="out-in">
          <div :key="currentIndex" class="mb-4">
            <p>
              <template v-for="(segment, i) in parsedSentence" :key="i">
                <span v-if="segment.hidden" class="badge rounded-pill text-bg-secondary mx-1" @click="segment.revealed = true" :style="badgeStyle(segment.text.length)">
                  {{ segment.revealed ? segment.text : ' '.repeat(segment.text.length) }}
                </span>
                <span v-else>{{ segment.text }}</span>
              </template>
            </p>
          </div>
        </transition>

        <div class="d-flex justify-content-between">
          <button class="btn btn-outline-dark" @click="goBack" :disabled="currentIndex === 0">戻る</button>
          <div>
            <button class="btn btn-success me-2" @click="next">覚えた</button>
            <button class="btn btn-warning" @click="next">まだ覚えてない</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const authenticated = ref(false)
const passwordInput = ref('')
const storedPassword = 'your_password' // 環境変数やCloudflare側でチェックする想定

const authenticate = () => {
  if (passwordInput.value === storedPassword) authenticated.value = true
}

const subjects = ['解剖学', '生理学']
const units = {
  '解剖学': ['上肢', '下肢'],
  '生理学': ['神経', '循環']
}
const selectedSubject = ref(null)
const selectedUnit = ref(null)

const selectSubject = (subj) => (selectedSubject.value = subj)
const selectUnit = (unit) => {
  selectedUnit.value = unit
  fetchSentences()
}

const sentences = ref([])
const currentIndex = ref(0)

const fetchSentences = async () => {
  // 仮の構成
  const res = await fetch(`/sample-data/${selectedSubject.value}_${selectedUnit.value}.json`)
  const json = await res.json()
  sentences.value = json
  currentIndex.value = 0
}

const parsedSentence = computed(() => {
  const blocks = sentences.value[currentIndex.value]?.text.split(/《(.*?)》/g)
  return blocks.map((seg, i) => i % 2 === 0 ? { text: seg, hidden: false } : { text: seg, hidden: true, revealed: false })
})

const progress = computed(() => ((currentIndex.value + 1) / sentences.value.length) * 100)
const goBack = () => currentIndex.value--
const next = () => currentIndex.value++

const badgeStyle = (length) => ({
  display: 'inline-block',
  minWidth: `${length}ch`,
  borderRadius: '1rem'
})
</script>

<style>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}
.slide-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>