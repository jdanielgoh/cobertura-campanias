<script setup>
import { ref, onMounted, watch, toRefs, onUnmounted } from "vue";
import {
  reordenamientoApilado,
  creaEjeHorizontal,
  creaEjeVertical,
} from "../utils";
import { stack } from "d3-shape";
import { rollup, rollups, sum, groups, min, max, extent, area } from "d3";
import { select } from "d3-selection";
import { timeParse } from "d3-time-format";
import { scaleLinear, scaleTime } from "d3-scale";
import fechas from "@/assets/datos/fechas.json";
import {
  forceSimulation,
  forceX,
  forceY,
  forceManyBody,
  forceCollide,
} from "d3-force";
import { curveCatmullRom, stackOffsetSilhouette } from "d3-shape";
const dict_opacity = {
  P: 0.7,
  N: 0.3,
};
const dict_color = ref({
  BXGR: "#00468c",
  CSP: "#930b28",
  JAM: "#ff7900",
  SE: "gray",
});
const escala_candidatas = ref({
  BXGR: 0.0,
  CSP: 0.16,
  JAM: 0.3,
  SE: 0.5,
});
const props = defineProps({
  datos: { type: Array },
  ancho_barra: { default: 0.2 },
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
const margen = ref({ arriba: 10, abajo: 50, derecha: 20, izquierda: 50 });
const alto = ref(0),
  ancho = ref(0),
  alto_ = ref();
const contenedor = ref(),
  svg = ref(),
  grupoEjeX = ref(),
  grupoEjeYTotal = ref(),
  grupoContenedor = ref(),
  grupoRectangulos = ref(),
  grupoAreas = ref(),
  grupoJAM = ref(),
  grupoBXGR = ref(),
  grupoCSP = ref(),
  globo = ref();

const conversionTemporal = timeParse("%d/%m/%Y");

const escalaLinealTotal = ref();
const escalaLinealCandidatxs = ref(scaleLinear());
const escalaTemporal = ref();
const simulacionJAM = ref();
const simulacionBXGR = ref();
const simulacionCSP = ref();
const radio_nodos = ref(1);
const datos_apilados = ref(),
  data_full = ref([{}]),
  categoria_seleccionada = ref("DESCRIPCION_ESTEREOTIPO_VULNERABILIDAD"),
  nodataJAM = ref([{ FECHA_TESTIGO: "" }]),
  nodataCSP = ref([{ FECHA_TESTIGO: "" }]),
  nodataBXGR = ref([{ FECHA_TESTIGO: "" }]);

const minDeltaTiempo = ref(),
  anchoBanda = ref();
const lasValoraciones = ref();
onMounted(() => {
  contenedor.value = select("#vis-general");
  svg.value = contenedor.value.select("svg.elSVG");
  globo.value = contenedor.value.select(".globo");
  grupoEjeX.value = svg.value.select("g.eje-x-abajo");
  grupoEjeYTotal.value = svg.value.select("g.eje-y");
  grupoContenedor.value = svg.value.select("g.grupo-contenedor");
  grupoJAM.value = svg.value.select("g.grupo-jam");
  grupoBXGR.value = svg.value.select("g.grupo-bxgr");

  grupoCSP.value = svg.value.select("g.grupo-csp");

  formateaDatosTotales();

  if (data_full.value.length > 1) {
    calculaDimensiones();
    //lasValoraciones.value = formateaDataValoraciones();
    creaVis();
  }

  watch(datos, () => {
    formateaDatosTotales();
    calculaDimensiones();
    //lasValoraciones.value = formateaDataValoraciones();
    creaVis();
  });
  window.addEventListener("resize", reescalanding);
});
onUnmounted(() => {
  window.removeEventListener("resize", reescalanding);
});
function reescalanding() {
  calculaDimensiones();
  creaVis();
}
function calculaDimensiones() {
  ancho.value =
    contenedor.value.node().clientWidth -
    margen.value.derecha -
    margen.value.izquierda;
  alto_.value = 600;
  alto.value = alto_.value - margen.value.arriba - margen.value.abajo;
  if (data_full.value.length <= 1) return;
  escalaLinealTotal.value = scaleLinear()
    .range([alto.value, 0.5 * alto.value])
    .domain([
      0,
      max(
        data_full.value?.map((d) => sum(variables.value.map((dd) => d[dd.id])))
      ),
    ]);
  escalaLinealCandidatxs.value.range([0.5 * alto.value, 0.26 * alto.value]);
  escalaTemporal.value = scaleTime()
    .domain([
      conversionTemporal("01/03/2024"),
      conversionTemporal("05/05/2024"),
    ])
    .range([0, ancho.value]);

  creaEjeHorizontal("vis-general", escalaTemporal.value, -90);
  creaEjeVertical(
    "vis-general",
    escalaLinealTotal.value,
    0,
    "izquierda",
    ancho.value,
    "total"
  );
  let fechasOrdenadas = fechas
    ?.map((d) => conversionTemporal(d))
    .sort((a, b) => a - b);
  minDeltaTiempo.value = min(
    fechasOrdenadas.map((d, i) => (i > 0 ? d - fechasOrdenadas[i - 1] : null))
  );
}
const { datos, variables } = toRefs(props);

function creaVis() {
  if (data_full.value.length <= 1) return;
  creaFuerzas();
  creaAreas();
  creaBarras();
}
function creaFuerzas() {
  radio_nodos.value = ancho.value * 0.005;
  let nodata = datos.value.filter((d) => d[categoria_seleccionada.value]);
  {
    nodataJAM.value = nodata.filter((d) => d.CANDIDATO == "JAM");
    nodataJAM.value.forEach((d) => {
      d.x = escalaTemporal.value(conversionTemporal(d.FECHA_TESTIGO));
      d.y = 500 * (0.5 - Math.random());
    });
    simulacionJAM.value?.stop();
    grupoJAM.value
      .selectAll("g.nodo")
      .data(nodataJAM.value)
      .join(
        (enter) => {
          enter
            .append("g")
            .attr("class", "nodo")
            .style("cursor", "pointer")
            .attr(
              "transform",
              (d) =>
                `translate(${escalaTemporal.value(
                  conversionTemporal(d.FECHA_TESTIGO)
                )},${Math.random()})`
            )
            .append("circle")
            .attr("fill", (d) => dict_color.value[d.CANDIDATO])
            .attr("fill-opacity", 0.7)
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", radio_nodos.value)
            .on("mouseover", hoverNodo)
            .on("mouseout", outNodo);
        },
        (update) => {
          update
            .attr("class", "nodo")
            .attr(
              "transform",
              (d) =>
                `translate(${escalaTemporal.value(
                  conversionTemporal(d.FECHA_TESTIGO)
                )},${Math.random()})`
            )
            .select("circle")
            .on("mouseover", hoverNodo)
            .on("mouseout", outNodo)

            .select("fill", (d) => dict_color.value[d.CANDIDATO])
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", radio_nodos.value);
        },
        (exit) => {
          exit
            .classed("nodo", false)
            .interrupt()
            .transition()
            .duration(500)
            .attr("transform", () => {
              let x = Math.random() < 0.5 ? -100 : ancho.value + 100,
                y = Math.random() < 0.5 ? -500 : alto.value;
              return `translate(${x},${y})`;
            })
            .attr("fill-opacity", 0)
            .remove();
        }
      );

    simulacionJAM.value = forceSimulation(nodataJAM.value)
      .force("charge", forceManyBody().strength(-0.1))
      .force("collision", forceCollide().radius(radio_nodos.value * 1.1))
      .force(
        "x",
        forceX().x((d) =>
          escalaTemporal.value(conversionTemporal(d.FECHA_TESTIGO))
        )
      )
      .force("y", forceY().y(0).strength(0.1))

      .on("tick", tickedJAM);
  }
  {
    nodataBXGR.value = nodata.filter((d) => d.CANDIDATO == "BXGR");
    nodataBXGR.value.forEach((d) => {
      d.x = escalaTemporal.value(conversionTemporal(d.FECHA_TESTIGO));
      d.y = 500 * (0.5 - Math.random());
    });
    simulacionBXGR.value?.stop();
    grupoBXGR.value
      .selectAll("g.nodo")
      .data(nodataBXGR.value)
      .join(
        (enter) => {
          enter
            .append("g")
            .attr("class", "nodo")
            .style("cursor", "pointer")
            .attr(
              "transform",
              (d) =>
                `translate(${escalaTemporal.value(
                  conversionTemporal(d.FECHA_TESTIGO)
                )},${Math.random()})`
            )
            .append("circle")
            .attr("fill", (d) => dict_color.value[d.CANDIDATO])
            .attr("fill-opacity", 0.7)
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", radio_nodos.value)
            .on("mouseover", hoverNodo)
            .on("mouseout", outNodo);
        },
        (update) => {
          update
            .attr("class", "nodo")
            .attr(
              "transform",
              (d) =>
                `translate(${escalaTemporal.value(
                  conversionTemporal(d.FECHA_TESTIGO)
                )},${Math.random()})`
            )
            .select("circle")
            .on("mouseover", hoverNodo)
            .on("mouseout", outNodo)
            .select("fill", (d) => dict_color.value[d.CANDIDATO])

            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", radio_nodos.value);
        },
        (exit) => {
          exit
            .classed("nodo", false)
            .interrupt()
            .transition()

            .duration(500)
            .attr("transform", () => {
              let x = Math.random() < 0.5 ? -100 : ancho.value + 100,
                y = Math.random() < 0.5 ? -500 : alto.value;
              return `translate(${x},${y})`;
            })
            .attr("fill-opacity", 0)
            .remove();
        }
      );

    simulacionBXGR.value = forceSimulation(nodataBXGR.value)
      .force("charge", forceManyBody().strength(-0.1))
      .force("collision", forceCollide().radius(radio_nodos.value * 1.1))
      .force(
        "x",
        forceX().x((d) =>
          escalaTemporal.value(conversionTemporal(d.FECHA_TESTIGO))
        )
      )
      .force("y", forceY().y(0).strength(0.1))

      .on("tick", tickedBXGR);
  }
  {
    nodataCSP.value = nodata.filter((d) => d.CANDIDATO == "CSP");
    nodataCSP.value.forEach((d) => {
      d.x = escalaTemporal.value(conversionTemporal(d.FECHA_TESTIGO));
      d.y = 500 * (0.5 - Math.random());
    });
    simulacionCSP.value?.stop();
    grupoCSP.value
      .selectAll("g.nodo")
      .data(nodataCSP.value)
      .join(
        (enter) => {
          enter
            .append("g")
            .attr("class", "nodo")
            .style("cursor", "pointer")
            .attr(
              "transform",
              (d) =>
                `translate(${escalaTemporal.value(
                  conversionTemporal(d.FECHA_TESTIGO)
                )},${Math.random()})`
            )
            .append("circle")
            .attr("fill", (d) => dict_color.value[d.CANDIDATO])
            .attr("fill-opacity", 0.7)
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", radio_nodos.value)
            .on("mouseover", hoverNodo)
            .on("mouseout", outNodo);
        },
        (update) => {
          update
            .attr("class", "nodo")
            .attr(
              "transform",
              (d) =>
                `translate(${escalaTemporal.value(
                  conversionTemporal(d.FECHA_TESTIGO)
                )},${Math.random()})`
            )
            .select("circle")
            .on("mouseover", hoverNodo)
            .on("mouseout", outNodo)
            .select("fill", (d) => dict_color.value[d.CANDIDATO])

            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", radio_nodos.value);
        },
        (exit) => {
          exit
            .classed("nodo", false)
            .interrupt()
            .transition()

            .duration(500)
            .attr("transform", () => {
              let x = Math.random() < 0.5 ? -100 : ancho.value + 100,
                y = Math.random() < 0.5 ? -500 : alto.value;
              return `translate(${x},${y})`;
            })
            .attr("fill-opacity", 0)
            .remove();
        }
      );

    simulacionCSP.value = forceSimulation(nodataCSP.value)
      .force("charge", forceManyBody().strength(-0.1))
      .force("collision", forceCollide().radius(radio_nodos.value * 1.1))
      .force(
        "x",
        forceX().x((d) =>
          escalaTemporal.value(conversionTemporal(d.FECHA_TESTIGO))
        )
      )
      .force("y", forceY().y(0).strength(0.1))

      .on("tick", tickedCSP);
  }
}
function tickedJAM() {
  grupoJAM.value.selectAll("g.nodo").attr("transform", (d) => {
    return `translate(${d.x},${d.y})`;
  });
}
function tickedCSP() {
  grupoCSP.value.selectAll("g.nodo").attr("transform", (d) => {
    return `translate(${d.x},${d.y})`;
  });
}
function tickedBXGR() {
  grupoBXGR.value.selectAll("g.nodo").attr("transform", (d) => {
    return `translate(${d.x},${d.y})`;
  });
}
function hoverNodo(e, d) {
  console.log(d.ID_NOTICIERO);
  let x = e.layerX > ancho.value * 0.5 ? e.layerX - 210 : e.layerX + 10;
  select(this).attr("fill-opacity", "1");
  globo.value.style("visibility","visible")
    .style("left", x + "px")
    .style("top", e.layerY + 10 + "px")
    .html(`<p>${d[categoria_seleccionada.value]}</p>`);
}
function outNodo(){
  globo.value.style("visibility","hidden")
}
function formateaDatosTotales() {
  var rellenafechas = fechas
    .map((d) => {
      let datito = datos.value.filter((dd) => d == dd.FECHA_TESTIGO);
      if (datito.length != 0) {
        return datito;
      } else
        return {
          ID_NOTICIERO: "",
          FECHA_TESTIGO: d,
          TIPO_VALORACION: "S",
          CANDIDATO: "SE",
          DURACION_MINUTOS: "0",
          HORA_INICIO_PIEZA: "00:00:00",
        };
    })
    .flat();

  data_full.value = rollups(
    rellenafechas,
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
    diccionario.la_fecha = conversionTemporal(d[0]);
    diccionario.BXGR = d[1].get("BXGR") ? d[1].get("BXGR") : 0;
    diccionario.CSP = d[1].get("CSP") ? d[1].get("CSP") : 0;

    diccionario.JAM = d[1].get("JAM") ? d[1].get("JAM") : 0;

    diccionario.SE = d[1].get("SE") ? d[1].get("SE") : 0;
    return diccionario;
  });
  datos_apilados.value = stack()
    //.offset(stackOffsetSilhouette)
    .keys(variables.value.map((d) => d.id))(data_full.value);
  datos_apilados.value = reordenamientoApilado(datos_apilados.value);
}

function creaAreas() {
  let ancho_barra =
    escalaTemporal.value(
      new Date(
        datos_apilados.value[0][0].data.la_fecha.getTime() +
          0.5 * props.ancho_barra * minDeltaTiempo.value
      )
    ) -
    escalaTemporal.value(
      new Date(
        datos_apilados.value[0][0].data.la_fecha.getTime() -
          0.5 * props.ancho_barra * minDeltaTiempo.value
      )
    );
  anchoBanda.value = ancho_barra > 20 ? 20 : ancho_barra;
  //eje_y.value.selectAll("text").attr("x", -0.5 * anchoBanda.value);
  grupoAreas.value = grupoContenedor.value
    .selectAll("path.area")
    .data(datos_apilados.value)
    .join(
      (enter) => {
        enter
          .append("path")
          .attr("class", "area")
          .attr("d", (dd) => generadorAreaBezier(dd))
          .attr(
            "fill",
            (d) => variables.value.filter((dd) => dd.id === d.key)[0].color
          )
          .attr("fill-opacity", ".5");
      },
      (update) => {
        update
          .transition()
          .duration(500)
          .attr("d", (dd) => generadorAreaBezier(dd))
          .attr(
            "fill",
            (d) => variables.value.filter((dd) => dd.id === d.key)[0].color
          )
          .attr("fill-opacity", ".5")
          .selection();
      },
      (exit) => {
        exit.remove();
      }
    );
}
function creaBarras() {
  grupoRectangulos.value = grupoContenedor.value
    .selectAll("g.barras")
    .data(datos_apilados.value)
    .join(
      (enter) => {
        let grupo = enter
          .append("g")
          .attr("class", "barras")
          .attr(
            "fill",
            (d) => variables.value.filter((dd) => dd.id === d.key)[0].color
          );
        grupo
          .selectAll("rect.barra")
          .data((d) => d)
          .enter()
          .append("rect")
          .attr("class", `barra`)
          .attr("y", alto.value)
          .attr(
            "x",
            (d) =>
              escalaTemporal.value(d.data.la_fecha) - 0.5 * anchoBanda.value
          )
          .attr("height", 0)
          .attr("width", anchoBanda.value)
          .transition()
          .duration(500)
          .attr("y", (d) => escalaLinealTotal.value(d[1]))
          .attr("height", (d) =>
            escalaLinealTotal.value(d[0]) - escalaLinealTotal.value(d[1]) < 0
              ? 0
              : escalaLinealTotal.value(d[0]) - escalaLinealTotal.value(d[1])
          );
      },
      (update) => {
        let grupo = update.call((update1) =>
          update1
            .transition()
            .duration(500)
            .attr(
              "fill",
              (d) => variables.value.filter((v) => v.id === d.key)[0].color
            )
        );
        grupo
          .selectAll("rect.barra")
          .data((d) => d)
          .join(
            (barras_enter) => {
              barras_enter
                .append("rect")
                .attr("class", `barra`)
                .attr("y", alto.value)
                .attr(
                  "x",
                  (d) =>
                    escalaTemporal.value(d.data.la_fecha) -
                    0.5 * anchoBanda.value
                )
                .attr("height", 0)
                .attr("width", anchoBanda.value)
                .transition()
                .duration(500)
                .attr("y", (d) => escalaLinealTotal.value(d[1]))
                .attr("height", (d) =>
                  escalaLinealTotal.value(d[0]) -
                    escalaLinealTotal.value(d[1]) <
                  0
                    ? 0
                    : escalaLinealTotal.value(d[0]) -
                      escalaLinealTotal.value(d[1])
                );
            },
            (barras_update) => {
              barras_update

                .transition()
                .duration(500)
                .attr("y", (d) => escalaLinealTotal.value(d[1]))
                .attr("height", (d) =>
                  escalaLinealTotal.value(d[0]) -
                    escalaLinealTotal.value(d[1]) <
                  0
                    ? 0
                    : escalaLinealTotal.value(d[0]) -
                      escalaLinealTotal.value(d[1])
                )
                .attr(
                  "x",
                  (d) =>
                    escalaTemporal.value(d.data.la_fecha) -
                    0.5 * anchoBanda.value
                )
                .attr("width", anchoBanda.value);
            },
            (barras_exit) => barras_exit.remove()
          );
      },
      (exit) => {
        exit.remove();
      }
    );
}
function generadorAreaBezier(datum) {
  if (datum.length > 2) {
    var txt = `M ${escalaTemporal.value(
      +datum[0].data.la_fecha
    )}, ${escalaLinealTotal.value(datum[0][1])}`;
    let x_i_mas_1;
    for (let i = 0; i < datum.length - 1; i++) {
      //let x00 = escalaTemporal.value(+datum[i-1].data.Year) - escalaTemporal.value.bandwidth() * .5
      let x_i = escalaTemporal.value(datum[i].data.la_fecha);
      x_i_mas_1 =
        escalaTemporal.value(datum[i + 1].data.la_fecha) -
        0.5 * anchoBanda.value;

      //escalaTemporal.value(+datum[i + 1].datala_fecha)

      let x_i_bandwidth = x_i + 0.5 * anchoBanda.value;
      let x_mid = 0.5 * (x_i_mas_1 - x_i_bandwidth) + x_i_bandwidth;

      let y_i = escalaLinealTotal.value(datum[i][1]);
      let y_i_mas_1 = escalaLinealTotal.value(datum[i + 1][1]);

      txt += `H ${x_i_bandwidth} C ${x_mid} ${y_i},
        ${x_mid} ${y_i_mas_1},
        ${x_i_mas_1} ${y_i_mas_1}H ${x_i_mas_1}`;
    }
    txt += `H ${x_i_mas_1 + 0.5 * anchoBanda.value}`;

    txt += `V ${escalaLinealTotal.value(datum[datum.length - 1][0])}`;
    txt += `H ${x_i_mas_1 - 0.5 * anchoBanda.value}`;

    for (let i = datum.length - 1; i > 0; i--) {
      //let x00 = escalaTemporal.value(+datum[i-1].data.Year) - escalaTemporal.value.bandwidth() * .5
      let x_i =
        escalaTemporal.value(+datum[i].data.la_fecha) - 1 * anchoBanda.value;
      let x_i_menos_1 = escalaTemporal.value(+datum[i - 1].data.la_fecha);
      let x_i_bandwidth = x_i + 0.5 * anchoBanda.value;

      let x_i_bandwidth_menos_1 = +0.5 * anchoBanda.value + x_i_menos_1;

      let x_mid = 0.5 * (x_i - x_i_bandwidth_menos_1) + x_i_bandwidth_menos_1;

      let y_i = escalaLinealTotal.value(datum[i][0]);
      let y_i_menos_1 = escalaLinealTotal.value(datum[i - 1][0]);

      txt += `H ${x_i_bandwidth} C ${x_mid} ${y_i}, ${x_mid} ${y_i_menos_1}, ${x_i_bandwidth_menos_1} ${y_i_menos_1}H ${x_i_menos_1}`;
    }

    return txt;
  }
}
defineExpose({
  escalaTemporal,
  escalaLinealTotal,
});
</script>

<template>
  <div class="vis-general contenedor" id="vis-general">
    <div class="globo"></div>
    <svg
      class="elSVG"
      :width="ancho + margen.derecha + margen.izquierda"
      :height="alto_"
    >
      <g
        class="grupo-bxgr"
        :transform="`translate(${margen.izquierda},${alto * 0.16})`"
      ></g>
      <g
        class="grupo-jam"
        :transform="`translate(${margen.izquierda},${alto * 0.26})`"
      ></g>
      <g
        class="grupo-csp"
        :transform="`translate(${margen.izquierda},${alto * 0.36})`"
      ></g>
      <g
        class="eje-x-abajo"
        :transform="`translate(${margen.izquierda},${margen.arriba + alto})`"
      ></g>
      <g
        class="eje-y-izquierda total"
        :transform="`translate(${margen.izquierda},${margen.arriba + 0})`"
      ></g>

      <g
        :transform="`translate(${margen.izquierda},${margen.arriba})`"
        class="grupo-contenedor"
      ></g>
      <g
        class="grupo-nodos"
        :transform="`translate(${margen.izquierda},${alto * 0.3})`"
      ></g>
    </svg>
  </div>
</template>
<style lang="scss">
.vis-general {
  position: relative;
  .globo {
    position: absolute;
    backdrop-filter: blur(5px);
    border-radius: 4px;
    z-index: 2s;
    padding: 4px;
    width: 200px;
    background-color: #e7e7e769;
  }
  svg {
    .vis-linea-ejes {
      stroke-dasharray: 2 2;
      stroke-width: 1px;
    }
    .vis-linea-base {
      stroke-width: 1px;
    }
  }
}
</style>
