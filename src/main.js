import { createApp } from 'vue'
import './style.scss'
import App from './App.vue'
import SisdaiGraficas from "./components/sisdai-graficas";
import SisdaiComponentes from 'sisdai-componentes'
import Autocomplete from '@trevoreyre/autocomplete-vue'
import '@trevoreyre/autocomplete-vue/dist/style.css'


const app = createApp(App)
app.use(SisdaiGraficas);
app.use(SisdaiComponentes)
app.use(Autocomplete)
app.mount('#app')

