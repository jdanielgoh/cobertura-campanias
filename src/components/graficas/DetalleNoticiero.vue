<script setup>
import { ref,onMounted,watch} from "vue"
import{ rollup,rollups,sum} from "d3-array"
import fechas from "@/assets/datos/fechas.json";

const props = defineProps({
  datos:{default:Array},variables:{type:Array,default:[
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
]}
})
const datos_strem = ref([
  {
    fecha: "01/04/2024",
    BXGR: 55351,
    CSP: 72087,
    JAM: 21334,
    SE: 20404,
  },
])
watch(()=>props.datos,(nv)=>{
  let data_formateada = rollups(
    nv,
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
  
  datos_strem.value = fechas
    .map((d) => {
      let datito = data_formateada.filter((dd) => d == dd.fecha);
      if (datito.length != 0) {
        return datito;
      } else
        return {
          BXGR: 0,
          fecha: d,
          CSP: 0,
          JAM: 0,
          SE: 0,
        };
    })
    .flat();
    console.log(datos_strem.value)
}
)
</script>
<template>
  <div>
    <h3>Detalle del noticiero</h3>
    <SisdaiGraficas
      :titulo_eje_y="'Minutos'"
      :titulo_eje_x="'Fecha'"
      :alto="300"
      :margenes="{ arriba: 30, abajo: 50, derecha: 20, izquierda: 40 }"
    >
      <SisdaiAreasApiladasOrdenadas
        :datos="datos_strem"
        :variables="variables"
        :angulo_etiquetas_eje_x="-45"
        :formato_temporal="'%d/%m/%Y'"
        clave_fecha="fecha"
      />
    </SisdaiGraficas>
  </div>
</template>
<style lang="scss">

.contenido-vis{
  --contenedor-vis-alto-menus: 0px;
  --contenedor-vis-alto-atribuciones: 0px;
  --contenedor-vis-alto-maximo: calc(100vh - var(--contenedor-vis-alto-menus));
  --contenedor-vis-alto-minimo-vis: 0px;
}
</style>


