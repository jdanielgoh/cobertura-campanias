import { createApp } from 'vue'
import './style.scss'
import App from './App.vue'
import Autocomplete from '@trevoreyre/autocomplete-vue'
import '@trevoreyre/autocomplete-vue/dist/style.css'


const app = createApp(App)
app.use(Autocomplete)
app.mount('#app')

