<script setup>
import { idAleatorio, reordenamientoApilado } from "../utils";
import { ref, onMounted, watch, toRefs } from "vue";
import { selectAll, select } from "d3-selection";
import { stack, areaRadial } from "d3-shape";
import { rollup, rollups, sum, groups, min } from "d3";
import fechas from "@/assets/datos/fechas.json";
import { scaleLinear, scaleTime } from "d3-scale";
import { timeParse } from "d3-time-format";
import { curveCatmullRom, stackOffsetSilhouette } from "d3-shape";
const colores = { BXGR: "#00468c", CSP: "#930b28", JAM: "#ff7900", SE: "gray" };
const props = defineProps({
  id_grafica: {
    type: String,
    default: () => idAleatorio(),
  },
  datos: {
    type: Array,
    default: [],
  },
  esc: { default: 1, type: Number },
  variables: {
    default: () => [
      {
        id: "BXGR",
        nombre: "X",
        color: "#00468c",
      },
      {
        id: "CSP",
        nombre: "X",
        color: "#930b28",
      },
      {
        id: "JAM",
        nombre: "X",
        color: "#ff7900",
      },
      {
        id: "SE",
        nombre: "X",
        color: "gray",
      },
    ],
  },
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
const { variables, datos } = toRefs(props);

onMounted(() => {
  contenedor.value = select("div#" + props.id_grafica);
  svg.value = contenedor.value.select("svg");
  grupo_contenedor.value = svg.value.select("g.grupo_contenedor");
  calculaDimensiones();
  pintaGrafico();
});
function calculaDimensiones() {
  ancho.value = contenedor.value.node().clientWidth;
  alto.value = ancho.value;
  escalaRadial.value = scaleLinear()
    .domain([0, 5000])
    .range([ancho.value * 0.3, ancho.value * 0.1]);
  escalaAngular.value = scaleTime()
    .domain([
      conversionTemporalDia("01/03/2024"),
      conversionTemporalDia("02/06/2024"),
    ])
    .range([0, Math.PI * 2]);
}
function pintaGrafico() {
  let datos_valorados = datos.value.filter(
    (d) => d.TIPO_VALORACION != "SIN VALORACIÓN"
  );
  let data_full = fechas
    .map((d) => {
      let datito = datos.value.filter((dd) => d == dd.FECHA_TESTIGO);
      if (datito.length != 0) {
        return datito;
      } else
        return {
          NOMBRE_LOCUTOR: "",
          FECHA_TESTIGO: d,
          TIPO_VALORACION: "SIN VALORACIÓN",
          CANDIDATO: "SE",
          DURACION_SEGUNDOS: "0",
          HORA_INICIO_PIEZA: "00:00:00",
        };
    })
    .flat();

  let datos_apilados = stack()
    .offset(stackOffsetSilhouette)
    .keys(variables.value.map((d) => d.id))(
    rollups(
      data_full,
      (v) =>
        rollup(
          v,
          (vv) => sum(vv.map((ddd) => ddd.DURACION_SEGUNDOS)),
          (dd) => dd.CANDIDATO
        ),
      (d) => d.FECHA_TESTIGO
    ).map((d) => {
      let diccionario = {};
      diccionario.fecha = d[0];
      diccionario.BXGR = d[1].get("BXGR") ? d[1].get("BXGR") : 0;
      diccionario.CSP = d[1].get("CSP") ? d[1].get("CSP") : 0;

      diccionario.JAM = d[1].get("JAM") ? d[1].get("JAM") : 0;

      diccionario.SE = d[1].get("SE") ? d[1].get("SE") : 0;
      return diccionario;
    })
  );
  datos_apilados = reordenamientoApilado(datos_apilados);

  var areas = areaRadial()
    .innerRadius((d) => escalaRadial.value(d[0]))
    .outerRadius((d) => escalaRadial.value(d[1]))
    .angle((d) => escalaAngular.value(conversionTemporalDia(d.data.fecha)))
    .curve(curveCatmullRom);

  grupo_contenedor.value
    .selectAll("pathcs")
    .data(datos_apilados)
    .enter()
    .append("path")
    .attr("d", areas)
    .attr("fill", (d) => colores[d.key])
    .attr("fill-opacity", 0.7);
  grupo_contenedor.value
    .selectAll("valoraciones")
    .data(datos_valorados)
    .enter()
    .append("circle")
    .attr("cx", (d) => 
      (d.TIPO_VALORACION=="NEGATIVA" ? escalaRadial.value(0) : escalaRadial.value(5000)) *
        Math.cos(
          -0.5 * Math.PI +
            escalaAngular.value(conversionTemporalDia(d.FECHA_TESTIGO))
        )
    )
    .attr("cy", (d) => 
      (d.TIPO_VALORACION=="NEGATIVA" ? escalaRadial.value(0) : escalaRadial.value(5000)) *
        Math.sin(
          -0.5 * Math.PI +
            escalaAngular.value(conversionTemporalDia(d.FECHA_TESTIGO))
        )
    )
    .attr(
      "r",
      (d) => (props.esc * ancho.value * Math.sqrt(d.DURACION_SEGUNDOS)) / 500
    )
    .attr("fill-opacity", 0.4)
    .attr("fill", (d) => colores[d.CANDIDATO]);
}
watch(() => datos.value, pintaGrafico);
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
