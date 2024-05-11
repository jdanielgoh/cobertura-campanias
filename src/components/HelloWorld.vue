<script setup>
import { ref, onMounted } from "vue";
import { rollup, rollups, sum ,groups} from "d3";
import lista_medios from "@/assets/datos/lista_medios.csv";
import MonitoreoDiarioStreams from "@/components/graficas/MonitoreoDiarioStreams.vue";
const ref_lista_medios = ref(lista_medios);
const datos = ref([
  {
    fecha: "01/04/2024",
    BXGR: 55351,
    CSP: 72087,
    JAM: 21334,
    SE: 20404,
  },
]);

const variables = ref([
  {
    id: "BXGR",
    nombre: "X",
    color: "#69aee0",
  },
  {
    id: "CSP",
    nombre: "X",
    color: "#930b28",
  },
  {
    id: "JAM",
    nombre: "X",
    color: "#f77f00",
  },
  {
    id: "SE",
    nombre: "X",
    color: "gray",
  },
]);
const datum = ref([
  {
    NOMBRE_LOCUTOR:
      "EMANUEL SIBILLA OROPEZA, ANTONY MENDOZA, HUGO TRIANO GÓMEZ, MARICHUY GARCÍA",
    FECHA_TESTIGO: "21/04/2024",
    TIPO_VALORACION: "SIN VALORACIÓN",
    CANDIDATO: "BXGR",
    DURACION_SEGUNDOS: 12,
  },
]);
const datum_agrupado = ref([
["",[
  {
    NOMBRE_LOCUTOR:
      "EMANUEL SIBILLA OROPEZA, ANTONY MENDOZA, HUGO TRIANO GÓMEZ, MARICHUY GARCÍA",
    FECHA_TESTIGO: "21/04/2024",
    TIPO_VALORACION: "SIN VALORACIÓN",
    CANDIDATO: "BXGR",
    DURACION_SEGUNDOS: 12,
  },
]]
])

onMounted(() => {
  datum.value = lista_medios;
  datum_agrupado.value = groups(lista_medios,d=>d.NOMBRE_LOCUTOR).sort((a,b)=>(b[1].length - a[1].length))

  datos.value = rollups(
    datum.value,
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
  });
  //console.log(datos.value.map(d=>d.fecha))
});
</script>

<template>
  <div class="contenedor flex">
    <SisdaiGraficas
      :titulo_eje_y="'Segundos'"
      :titulo_eje_x="'Fecha'"
      :margenes="{ arriba: 30, abajo: 70, derecha: 30, izquierda: 90 }"
    >
      <template #panel-encabezado-vis>
        <p class="vis-titulo-visualizacion">
          Segundos dedicados a cada candidatx
        </p>
      </template>
      <SisdaiAreasApiladasOrdenadas
        :datos="datos"
        :variables="variables"
        :angulo_etiquetas_eje_x="-45"
        :formato_temporal="'%d/%m/%Y'"
        clave_fecha="fecha"
      />
    </SisdaiGraficas>
    <MonitoreoDiarioStreams :datos="lista_medios"></MonitoreoDiarioStreams>

    <div class="contenedor">
      <div class="col-3" v-for="(datillo,i) in datum_agrupado.slice(0,3)" :key="i">
        <p>{{ datillo[0] }}</p>
        <MonitoreoDiarioStreams :datos="datillo[1]" :esc="1.5"></MonitoreoDiarioStreams>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.contenedor {
  display: flex;
  flex-flow: row wrap;
  div.col-3 {
    width: 33%;
  }
}
</style>
