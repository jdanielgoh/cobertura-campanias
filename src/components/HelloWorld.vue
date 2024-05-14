<script setup>
import { ref, onMounted, computed } from "vue";
import { rollup, rollups, sum, groups } from "d3";
import lista_medios from "@/assets/datos/lista_medios.csv";
import ResumenNoticiero from "@/components/graficas/ResumenNoticiero.vue";
import DetalleNoticiero from "@/components/graficas/DetalleNoticiero.vue";

const datos_modal = ref([]);
const miModal = ref();
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
    NOMBRE_NOTICIERO:
      "EMANUEL SIBILLA OROPEZA, ANTONY MENDOZA, HUGO TRIANO GÓMEZ, MARICHUY GARCÍA",
    FECHA_TESTIGO: "21/04/2024",
    TIPO_VALORACION: "SIN VALORACIÓN",
    CANDIDATO: "BXGR",
    DURACION_MINUTOS: 12,
  },
]);
const datum_agrupado = ref([
  {
    nombre: "",
    datos: [
      {
        NOMBRE_NOTICIERO:
          "EMANUEL SIBILLA OROPEZA, ANTONY MENDOZA, HUGO TRIANO GÓMEZ, MARICHUY GARCÍA",
        FECHA_TESTIGO: "21/04/2024",
        TIPO_VALORACION: "SIN VALORACIÓN",
        CANDIDATO: "BXGR",
        DURACION_MINUTOS: 12,
      },
    ],
  },
]);
const listaFiltrada = computed(() => {
  return datum_agrupado.value.filter((d) =>
    d.nombre?.toLowerCase()?.includes(busqueda.value.toLowerCase())
  );
});
const busqueda = ref("");
onMounted(() => {
  datum.value = lista_medios;
  datum_agrupado.value = groups(lista_medios, (d) => d.NOMBRE_NOTICIERO)
    .sort((a, b) => b[1].length - a[1].length)
    .map((d) => ({ nombre: d[0], datos: d[1] }));

  datos.value = rollups(
    datum.value,
    (v) =>
      rollup(
        v,
        (vv) => sum(vv.map((ddd) => ddd.DURACION_MINUTOS)),
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
function clickResumen(d) {
  miModal.value?.abrirModal();
  datos_modal.value = d;
}
</script>

<template>
  <div class="contenedor">
    <SisdaiGraficas
      :titulo_eje_y="'Minutos'"
      :titulo_eje_x="'Fecha'"
      :margenes="{ arriba: 30, abajo: 50, derecha: 20, izquierda: 40 }"
    >
      <template #panel-encabezado-vis>
        <p class="vis-titulo-visualizacion">
          Minutos dedicados a cada candidatx en todos los programas de radio y
          TV
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
    <div class="contenedor ancho-fijo">
      <div class="search-wrapper">
        <label for="buscador">Busca un noticiero de radio o TV </label>

        <input
          id="buscador"
          type="text"
          v-model="busqueda"
          placeholder="Busca tu programa de radio o TV"
        />
      </div>
    </div>
    <div class="contenedor ancho-fijo">
      <div class="flex contenedor">
        <button
          class="columna-4 boton-secundario"
          v-for="datillo in datum_agrupado"
          :key="datillo.nombre"
          @click="clickResumen(datillo.datos)"
          v-show="
            datillo?.nombre?.toLowerCase()?.includes(busqueda.toLowerCase())
          "
        >
          <p>{{ datillo.nombre }}</p>
          <ResumenNoticiero :datos="datillo.datos"></ResumenNoticiero>
        </button>
      </div>
      <SisdaiModal ref="miModal" tamanioModal="pantalla-completa">
        <DetalleNoticiero
          :datos="datos_modal"
          :variables="variables"
        ></DetalleNoticiero>
      </SisdaiModal>
    </div>
  </div>
</template>

<style scoped lang="scss">
.contenedor {
  display: flex;
  flex-flow: row wrap;
}
button.columna-4 {
  width: calc(25% - 24px);
  min-width: calc(25% - 24px);
  display: block;
}
input[type="text"] {
  background: white;
}
</style>
