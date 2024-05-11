import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import SisdaiGraficas from "./components/sisdai-graficas";

const app = createApp(App)
app.use(SisdaiGraficas);
app.mount('#app')