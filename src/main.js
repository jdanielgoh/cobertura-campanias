import { createApp } from 'vue'
import './style.scss'
import App from './App.vue'
import SisdaiGraficas from "./components/sisdai-graficas";
import SisdaiComponentes from 'sisdai-componentes'


const app = createApp(App)
app.use(SisdaiGraficas);
app.use(SisdaiComponentes)

app.mount('#app')