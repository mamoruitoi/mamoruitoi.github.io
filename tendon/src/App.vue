<template>
    <div class="container mt-4">
        <div v-if="loading">読み込み中です...</div>
        <!--ログイン画面-->
        <div v-if="!authenticated" class="text-center">
            <input v-model="passwordInput" type="password" class="form-control mb-2" placeholder="パスワードを入力" />
            <button @click="authenticate" class="btn btn-primary">ログイン</button>
        </div>

        <!--ログイン済み-->
        <div v-else>
            
            <!--単元選択画面-->
            <div v-if="!selectedUnit && !loading">
                <h4>単元を選択してください</h4>
                <button v-for="unit in Object.keys(unitToPageId)" :key="unit" class="btn btn-outline-secondary m-1" @click="selectUnit(unit)">
                    {{ unit }}
                </button>
            </div>

            <!--クイズ画面-->
            <div v-else>
                <!--問題が存在するならば-->
                <div v-if="questions.length && currentQuestion">
                    <div class="question">
                    <p>
                        <span v-for="(text, i) in currentQuestion.paragraph.rich_text" :key="i">
                            <span v-if="text.annotations.bold" class="cloze" @click="toggleCloze(i)">
                                <template v-if="clozeState[i]">
                                    <strong>{{ text.text.content }}</strong>
                                </template>
                                <template v-else>
                                    <u>[__________]</u>
                                </template>
                            </span>
                            <span v-else>
                                {{ text.text.content }}
                            </span>
                        </span>
                    </p>
                    </div>
                    <!--ナビゲーションバー-->
                    <div class="navigation">
                        <button @click="prev" :disabled="currentIndex === 0">戻る</button>
                        <button @click="next" :disabled="currentIndex === questions.length - 1">進む</button>
                        <button @click="fetchUnits">一覧に戻る</button>
                    </div>
                </div>
            </div>

        </div>

    </div>
</template>


<script setup>

import { ref, onMounted, computed, watch } from 'vue'

// ログイン済みかどうか
const authenticated = ref(false)
// 画面読み込み中フラグ
const loading = ref(true)
// 単元とNotionのページIDの連想配列
const unitToPageId = ref({})
// エラーメッセージ
const error = ref(null)

//// ユーザ認証
// ユーザが入力したパスワードを取得
const passwordInput = ref('')
// tendon-authを叩いてトークンを受け取る関数
const authenticate = async () => {
    const res = await fetch("https://tendon-auth.mamoruitoi.workers.dev/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput.value })
    });
    // 成功したらtendon-authから受け取ったトークンをlocalStorageに書き込む
    if (res.ok) {
        const json = await res.json()
        const newToken = json.token
        token.value = newToken
        localStorage.setItem('token', newToken)
        console.log('from authenticate, res.json(): ', json)
        authenticated.value = true
        await fetchUnits()
    } else {
        error.value = 'パスワードが間違っています'
    }
}

//// クイズ画面
const questions = ref([])
const currentIndex = ref(0)
const currentQuestion = computed(() => {
    if (!questions.value || !questions.value.length) return null
    return questions.value[currentIndex.value]
})
// 穴が開いていれば真、閉じていれば偽
const clozeState = ref({})
// 現在の単元内のクイズを取得
const fetchQuestions = async () => {
    loading.value = true
    const currentPageId = unitToPageId.value[selectedUnit.value]
    const res = await fetch('https://tendon-auth.mamoruitoi.workers.dev/notion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token.value}`
        },
        body: JSON.stringify({ page_id: currentPageId }),
    })
    const json = await res.json()
    questions.value = json.results
    currentIndex.value = 0
    loading.value = false
}

//// 単元選択
// 単元名とpage_idをセットで取得
const fetchUnits = async () => {
    selectedUnit.value = null
    loading.value = true
    console.log('token:', token.value)
    const res = await fetch('https://tendon-auth.mamoruitoi.workers.dev/notion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token.value}`
        },
        body: JSON.stringify({ page_id: "1efd0f4b272080fc9e5ff40c63eb6e28" }),  // 「解剖学I」のページのID
    })
    // トークンが無効の場合エラーを立てる
    if (!res.ok) {
        throw new Error('トークンが無効です')
    } else {
        authenticated.value = true
    }
    const json = await res.json()
    for (const unit of json.results) {
        if (unit.child_page && unit.child_page.title && unit.id) {
            unitToPageId.value[unit.child_page.title] = unit.id
        }
    }
    loading.value = false
}
const selectedUnit = ref(null)
const selectUnit = (unit) => {
    selectedUnit.value = unit
    fetchQuestions()
}


//// てんどんのサイトを表示した際に実行
const token = ref(localStorage.getItem('token'))
onMounted(async () => {
    // トークンがない場合
    if (!token.value) {
        // ログイン画面を表示
        authenticated.value = false
        loading.value = false
        return
    }
    // トークンがある場合
    try {
        // Notion APIを叩いて単元一覧を取得 
        await fetchUnits()
    // エラーが出たらログイン画面を表示
    } catch (e) {
        console.error(e)
        localStorage.removeItem('token')  // 念のため削除
        authenticated.value = false
        error.value = 'ログインに失敗しました'
    // 「読み込み中」を解除
    } finally {
        loading.value = false
    }
})

// 
watch(currentQuestion, () => {
  clozeState.value = {}
})
// 穴埋め部分の開閉を反転
function toggleCloze(index) {
  clozeState.value[index] = !clozeState.value[index]
}
// 「進む」ボタンの処理
function next() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
  }
}
// 「戻る」ボタンの処理
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