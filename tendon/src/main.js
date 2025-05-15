// node_modulesの中にあるcreateApp関数を呼び出し
import { createApp } from 'vue'
// App.vueをAppとして呼び出し
import App from './App.vue'

// このcreateApp関数を実行するところから†すべてが始まる†
// createApp関数を実行するだけではUIが作られただけで表示はされず、
// #app（App.vueのstyleにある）を呼び出すことで表示される
createApp(App).mount('#app')
