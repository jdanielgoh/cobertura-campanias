<script setup>
import { idAleatorio } from "../utils";
import { ref, onMounted,watch } from "vue";
import { selectAll, select } from "d3-selection";
import { scaleLinear, scaleTime } from "d3-scale";
import { timeParse } from "d3-time-format";
const colores ={"BXGR":"#318ccd","CSP":"#cd4a66","JAM":"#f77f00","SE":"gray"} 
const props = defineProps({
  id_grafica: {
    type: String,
    default: () => idAleatorio(),
  },
  datos :{
    type:Array,
    default: []
  },
  esc:{default:1,type:Number}
});
const contenedor = ref(),
  svg = ref(),
  grupo_contenedor = ref();
const ancho = ref(10),
  alto = ref(10);
const escalaRadial = ref(),
  escalaAngular = ref();
const conversionTemporalHorario = timeParse("%d/%m/%Y %H:%M:%S");
const conversionTemporalDia = timeParse("%d/%m/%Y");

onMounted(() => {
  contenedor.value = select("div#" + props.id_grafica);
  svg.value = contenedor.value.select("svg");
  grupo_contenedor.value = svg.value.select("g.grupo_contenedor");
  calculaDimensiones();
  pintaGrafico()
});
function calculaDimensiones() {
  ancho.value = contenedor.value.node().clientWidth;
  alto.value = ancho.value;
  escalaRadial.value = scaleTime()
    .domain([
      conversionTemporalHorario("01/01/2024 00:00:00"),
      conversionTemporalHorario("01/01/2024 05:00:00"),
    ])
    .range([ancho.value * 0.2, ancho.value * 0.49]);
  escalaAngular.value = scaleTime()
    .domain([
      conversionTemporalDia("01/03/2024"),
      conversionTemporalDia("02/06/2024"),
    ])
    .range([0, Math.PI * 2]);
}
function pintaGrafico(){
    grupo_contenedor.value.selectAll("bolitas")
    .data(props.datos)
    .enter()
    .append("circle")
    .attr("cx",d=> escalaRadial.value(conversionTemporalHorario("01/01/2024 "+d.HORA_INICIO_PIEZA)) * Math.cos(escalaAngular.value(conversionTemporalDia(d.FECHA_TESTIGO))))
    .attr("cy",d=> escalaRadial.value(conversionTemporalHorario("01/01/2024 "+d.HORA_INICIO_PIEZA)) * Math.sin(escalaAngular.value(conversionTemporalDia(d.FECHA_TESTIGO))))
    .attr("r",d=> props.esc * ancho.value * Math.sqrt(d.DURACION_SEGUNDOS)/2000)
    .attr("fill-opacity",.4)
    .attr("fill",d=>colores[d.CANDIDATO])

    
}
watch(()=>props.datos,pintaGrafico)
</script>
<template>
  <div class="contenedor" :id="id_grafica">
    <svg class="svg" :width="ancho" :height="alto">
      <g
        class="grupo_contenedor"
        :transform="`translate(${ancho * 0.5}, ${alto * 0.5})`"
      ></g>
    </svg>
  </div>
</template>
