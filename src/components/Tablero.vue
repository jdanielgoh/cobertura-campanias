<script setup>
import { ref, onMounted, computed, watch } from "vue";
import lista_medios from "@/assets/datos/lista_medios.csv";
import VisGeneral from "@/components/graficas/VisGeneral.vue";
import medios from "@/assets/datos/diccionario_medios.json";

const datum = ref([
  {
    ID_NOTICIERO:
      "EMANUEL SIBILLA OROPEZA, ANTONY MENDOZA, HUGO TRIANO GÓMEZ, MARICHUY GARCÍA",
    FECHA_TESTIGO: "21/04/2024",
    TIPO_VALORACION: "S",
    CANDIDATO: "BXGR",
    DURACION_MINUTOS: 12,
  },
]);
const lista_select = ref([
  { id: "0", nombre: "TODOS LOS MEDIOS" },
  ...Object.keys(medios).map((d) => ({ id: d, nombre: medios[d] })),
]);
const listaLanguagesFiltrada = ref(lista_select.value);
let id_random = "0"; //lista_medios[Math.floor(lista_medios.length * Math.random())].ID_NOTICIERO
const medio_seleccionado = ref(id_random);
const categoria_seleccionada = ref("FRASE_POSITIVA"),
  categorias = ref([
    { id: "FRASE_POSITIVA", nombre: "Frases positivas" },
    { id: "FRASE_NEGATIVA", nombre: "Frases negativas" },
    { id: "FRASE_ESTEREOTIPO_GENERAL", nombre: "Frases de estereotipos" },
    { id: "FRASE_ENFOQUE", nombre: "Frases de enfoque" },
  ]);
onMounted(() => {
  //datum.value = lista_medios.filter(d=>d.ID_NOTICIERO==medio_seleccionado.value);
  datum.value = lista_medios; //.filter(d=>d.ID_NOTICIERO.includes("1"))//.filter(d=>d.ID_NOTICIERO==medio_seleccionado.value);

  console.log(medio_seleccionado.value);
  console.log(
    [...new Set(lista_medios.map((d) => d.FECHA_TESTIGO))].sort((a, b) => a - b)
  );
});
watch(medio_seleccionado, (nv) => {
  if (nv == "0") {
    datum.value = lista_medios;
  } else {
    datum.value = lista_medios.filter((d) => d.ID_NOTICIERO == nv);
  }
});

function search(input) {
  if (input.length < 1) {
    return [];
  }
  return lista_select.value.filter((noticiero) => {
    return noticiero.nombre.toLowerCase().includes(input.toLowerCase());
  });
}
function getResultValue(result) {
  return result.nombre;
}
function submit(resultado) {
  medio_seleccionado.value = resultado.id;
}
</script>

<template>
  <div class="contenedor">
    <div class="flex">
      <div class="columna-8">
        <autocomplete
          :search="search"
          @submit="submit"
          placeholder="Busca un noticiero"
          aria-label="Escribe un noticiero"
          :autoSelect="false"
          :get-result-value="getResultValue"
        ></autocomplete>
      </div>
      <div class="columna-8">
        <select
          name="categoria"
          id="categoria"
          v-model="categoria_seleccionada"
        >
          <option :value="cat.id" v-for="cat in categorias" :key="cat.id">
            {{ cat.nombre }}
          </option>
        </select>
      </div>
    </div>
    <h2>
      {{
        medio_seleccionado != "0"
          ? medios?.[medio_seleccionado]
          : "TODOS LOS MEDIOS"
      }}
    </h2>
    <VisGeneral :datos="datum" :categoria="categoria_seleccionada"></VisGeneral>
  
  </div>
</template>

<style lang="scss">
div.autocomplete {
  input.autocomplete-input {
    padding-left: 40px !important;
    margin-bottom: 0 !important;
  }
}
select#categoria {
  padding-bottom: 10px;
  padding-top: 10px;
}

</style>
