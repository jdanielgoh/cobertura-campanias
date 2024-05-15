<script setup>
import MonitoreoDiarioStreams from "./resumen/MonitoreoDiarioStreams.vue";
import ValoracionesCandidatx from "./resumen/ValoracionesCandidatx.vue";
import { computed, onMounted } from "vue";
import { groups, sum, max } from "d3-array";
const props = defineProps({
  datos: {
    type: Array,
  },
});
const valoraciones = computed(() => {
  let datos_valorados = props.datos.filter(
    (d) => d.TIPO_VALORACION != "S"
  );
  let default_data = {
    JAM: {
      P: 0,
      N: 0,
    },
    BXGR: {
      P: 0,
      N: 0,
    },
    CSP: {
      P: 0,
      N: 0,
    },
    SE: {
      P: 0,
      N: 0,
    },
  };
  if (datos_valorados.length != 0) {
    let agrupada = groups(
      datos_valorados,
      (d) => d.CANDIDATO,
      (d) => d.TIPO_VALORACION
    );
    for (var i = 0; i < agrupada.length; i++) {
      for (var j = 0; j < agrupada[i][1].length; j++) {
        default_data[agrupada[i][0]][agrupada[i][1][j][0]] = sum(
          agrupada[i][1][j][1].map((d) => +d.DURACION_MINUTOS)
        );
      }
    }
    let maximo = max(
      Object.values(default_data).map((d) => max(Object.values(d)))
    );
    for (var i = 0; i < agrupada.length; i++) {
      for (var j = 0; j < agrupada[i][1].length; j++) {
        default_data[agrupada[i][0]][agrupada[i][1][j][0]] =
          default_data[agrupada[i][0]][agrupada[i][1][j][0]] / maximo;
      }
    }
  }

  return default_data;
});
onMounted(() => {
});
</script>
<template>
  <ValoracionesCandidatx :datos="valoraciones"></ValoracionesCandidatx>
  <MonitoreoDiarioStreams :datos="datos"></MonitoreoDiarioStreams>
</template>
