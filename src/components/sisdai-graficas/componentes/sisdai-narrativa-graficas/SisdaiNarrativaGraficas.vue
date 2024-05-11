<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { idAleatorio } from '../../utils'
const lista_elementos = ref([])
const seccion_visible = ref(-1)
const posicion_depurador = ref(0)
const narrativa = ref()
let posicion_actual = -1

const props = defineProps({
  id: {
    type: String,
    default: () => idAleatorio(),
  },
  depurador: { type: Boolean, default: false },
  altura_sensor: {
    type: Number,
    default: 0.5,
  },
  separacion: {
    type: Number,
    default: 1,
  },
  posicion_inicial: {
    type: Number,
    default: 1,
  },
})

const obtenerElementos = () => {
  narrativa.value = document.querySelector(
    `section#${props.id}.narrativa-graficas `
  )
  lista_elementos.value = [...narrativa.value.querySelectorAll(` .bullet`)]

  narrativa.value.style.height =
    (lista_elementos.value.length + 1) * props.separacion * 100 + 'vh'
  lista_elementos.value.forEach((el, i) => {
    el.style.top = (props.posicion_inicial + i * props.separacion) * 100 + 'vh'
  })
}
function scroleando() {
  posicion_depurador.value = document
    .querySelector(`section#${props.id}.narrativa-graficas div.depurador`)
    .getBoundingClientRect().top

  // Checando elementos activos
  lista_elementos.value.forEach((el, i) => {
    if (i < lista_elementos.value.length - 1) {
      if (
        el.getBoundingClientRect().top < posicion_depurador.value &&
        posicion_depurador.value <
          lista_elementos.value[i + 1].getBoundingClientRect().top
      ) {
        posicion_actual = i
      }
    } else if (
      posicion_depurador.value <
      lista_elementos.value[0].getBoundingClientRect().top
    ) {
      posicion_actual = -1
    } else if (i === lista_elementos.value.length - 1) {
      if (
        posicion_depurador.value >
        lista_elementos.value[i].getBoundingClientRect().top
      ) {
        posicion_actual = i
      }
    }
  })

  if (posicion_actual !== seccion_visible.value) {
    seccion_visible.value = posicion_actual
  }
}
onMounted(() => {
  obtenerElementos()
  window.addEventListener('scroll', scroleando)
})
onUnmounted(() => {
  window.removeEventListener('scroll', scroleando)
})
defineExpose({ seccion_visible, posicion_depurador })
</script>
<template>
  <section
    class="narrativa-graficas"
    :id="id"
  >
    <div
      :style="{ opacity: depurador ? 1 : 0, top: altura_sensor * 100 + 'vh' }"
      class="depurador"
    >
      <span
        >Seccion activa: {{ seccion_visible }} | Posicion depurador:
        {{ posicion_depurador }}</span
      >
    </div>
    <slot name="sisdai-grafica"> </slot>

    <slot></slot>
  </section>
</template>
<style scoped lang="scss">
.narrativa-graficas {
  position: relative;
  .contenedor-vis {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
  }
  .depurador {
    position: sticky;
    width: 100%;
    border-top: solid 2px crimson;
    z-index: 10;
    height: 2px;
  }
  .bullet {
    position: absolute;
    z-index: 10;
    top: 0;
    height: auto;
  }
}
</style>
