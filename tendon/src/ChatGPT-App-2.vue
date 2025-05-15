<template>
  <div v-if="blocks.length">
    <div class="question">
      <p>
        <span v-for="(text, i) in currentBlock.paragraph.rich_text" :key="i">
          <span
            v-if="text.annotations.bold"
            class="cloze"
            @click="toggleCloze(i)"
          >
            <template v-if="clozeState[i]">
              <strong>{{ text.text.content }}</strong>
            </template>
            <template v-else>
              <u>???</u>
            </template>
          </span>
          <span v-else>
            {{ text.text.content }}
          </span>
        </span>
      </p>
    </div>

    <div class="navigation">
      <button @click="prev" :disabled="currentIndex === 0">戻る</button>
      <button @click="next" :disabled="currentIndex === blocks.length - 1">進む</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// 仮のNotionデータ
const blocks = ref([
  {
    paragraph: {
      rich_text: [
        {
          text: { content: '大伏在静脈は、足背の静脈弓から始まり、下肢の内側を上行して' },
          annotations: { bold: false }
        },
        {
          text: { content: '皮静脈' },
          annotations: { bold: true }
        },
        {
          text: { content: 'である。' },
          annotations: { bold: false }
        },
        {
          text: { content: '皮静脈' },
          annotations: { bold: true }
        },
        {
          text: { content: 'である。' },
          annotations: { bold: false }
        }
      ]
    }
  },
  {
    paragraph: {
      rich_text: [
        {
          text: { content: '大腿の筋群は' },
          annotations: { bold: false }
        },
        {
          text: { content: '3つ' },
          annotations: { bold: true }
        },
        {
          text: { content: 'に分けられる。' },
          annotations: { bold: false }
        }
      ]
    }
  }
])

const currentIndex = ref(0)
const currentBlock = computed(() => blocks.value[currentIndex.value])
const clozeState = ref({})

watch(currentBlock, () => {
  clozeState.value = {}
})

function toggleCloze(index) {
  clozeState.value[index] = !clozeState.value[index]
}

function next() {
  if (currentIndex.value < blocks.value.length - 1) {
    currentIndex.value++
  }
}

function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}
</script>

<style scoped>
.cloze {
  cursor: pointer;
  background-color: #f0f0f0;
  padding: 2px 4px;
  border-radius: 4px;
  margin: 0 2px;
  transition: background-color 0.2s;
}
.cloze:hover {
  background-color: #e0e0e0;
}
.navigation {
  margin-top: 16px;
}
button {
  margin: 0 8px;
  padding: 4px 8px;
}
</style>
