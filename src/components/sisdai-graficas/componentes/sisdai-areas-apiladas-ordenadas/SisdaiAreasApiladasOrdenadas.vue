<script setup>
import { extent, max, min, sum, bisector } from "d3-array";
import { scaleLinear, scaleTime } from "d3-scale";
import { select } from "d3-selection";
import { stack } from "d3-shape";
import { timeParse } from "d3-time-format";
import { transition } from "d3-transition";
import { onMounted, ref, shallowRef, toRefs, watch } from "vue";
import usarRegistroGraficas from "../../composables/usarRegistroGraficas";
import {
  buscarIdContenedorHtmlSisdai,
  creaEjeHorizontal,
  creaEjeVertical,
  reordenamientoApilado,
} from "../../utils";
var idGrafica;

const props = defineProps({
  datos: {
    type: Array,
    require: true,
  },
  variables: {
    type: Array,
    require: true,
    validator(value) {
      // debe tener: id, nombre, color
      const validado = value.some(
        ({ id, nombre, color }) =>
          id !== undefined || nombre !== undefined || color !== undefined
      );
      if (!validado) {
        console.error("El objeto no cumple con las especificaciones");
      }
      return validado;
    },
  },
  clave_fecha: {
    type: String,
    default: "fecha",
  },
  alineacion_eje_y: {
    type: String,
    default: "izquierda",
    validator(value) {
      const validado = value === "izquierda" || value === "derecha";
      if (!validado) {
        console.error(
          "la propiedad 'alineacion_eje_y' sólo admite los valores 'izquierda' o 'derecha'"
        );
      }
      return validado;
    },
  },
  angulo_etiquetas_eje_x: {
    type: Number,
    default: 0,
    validator(value) {
      // debe estar entre -90 y 90
      const validado = -90 <= value && value <= 90;
      if (!validado) {
        console.error("El número debe estar entre -90 y 90");
      }
      return validado;
    },
  },
  angulo_etiquetas_eje_y: {
    type: Number,
    default: 0,
    validator(value) {
      // debe estar entre -90 y 90
      const validado = -90 <= value && value <= 90;
      if (!validado) {
        console.error("El número debe estar entre -90 y 90");
      }
      return validado;
    },
  },
  formato_temporal: {
    default: "%d-%m-%Y",
    type: String,
  },

  ancho_barra: {
    default: 0.3,
    validator(value) {
      // debe estar entre 0 y 1
      const validado = 0 <= value && value <= 1;
      if (!validado) {
        console.error("El número debe estar entre 0 y 1");
      }
      return validado;
    },
  },
});

const sisdaiAreasApiladas = shallowRef();
const { datos, clave_fecha, variables } = toRefs(props);
transition;
const margenesSvg = ref({});
const datos_apilados = ref([]);
const conversionTemporal = timeParse(props.formato_temporal);
const escalaTemporal = ref(),
  escalaLineal = ref();
const grupoContenedor = ref(),
  tooltip = ref(),
  svg = ref(),
  grupoAreas = ref(),
  grupoRectangulos = ref(),
  eje_y = ref();
const minDeltaTiempo = ref();
const anchoBanda = ref();
function calcularEscalas(grupoVis) {
  if (!grupoVis && grupoVis.ancho === 0) return;
  escalaTemporal.value = scaleTime()
    .domain(extent(datos.value?.map((d) => d.la_fecha)))
    .range([0, grupoVis.ancho]);
  let fechasOrdenadas = datos.value
    ?.map((d) => d.la_fecha)
    .sort((a, b) => a - b);

  minDeltaTiempo.value = min(
    fechasOrdenadas.map((d, i) => (i > 0 ? d - fechasOrdenadas[i - 1] : null))
  );

  escalaLineal.value = scaleLinear()
    .domain([
      0,
      max(datos.value?.map((d) => sum(variables.value.map((dd) => d[dd.id])))),
    ])
    .range([grupoVis.alto, 0]);

  creaEjeHorizontal(
    idGrafica,
    escalaTemporal.value,
    props.angulo_etiquetas_eje_x
  );

  eje_y.value = creaEjeVertical(
    idGrafica,
    escalaLineal.value,
    props.angulo_etiquetas_eje_y,
    props.alineacion_eje_y,
    grupoVis.ancho
  );
}
function creaAreas() {
  datos.value.forEach(
    (d) => (d.la_fecha = conversionTemporal(d[clave_fecha.value]))
  );
  datos_apilados.value = stack().keys(variables.value.map((d) => d.id))(
    datos.value
  );
  datos_apilados.value = reordenamientoApilado(datos_apilados.value);

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
  eje_y.value.selectAll("text").attr("x", -0.5 * anchoBanda.value);
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
function creaVis() {
  creaAreas();
  creaBarras();
  svg.value
    .on("mousemove", (evento) => {
      mostrarTooltip(evento);
    })
    .on("mouseout", cerrarTooltip);
}
function mostrarTooltip(evento) {
  let bisecetDate = bisector((d) => d.la_fecha).left;
  let x0 = escalaTemporal.value.invert(
    evento.layerX - margenesSvg.value.izquierda - margenesSvg.value.derecha
  );
  let indice = bisecetDate(datos.value, x0, 1);
  let d0 = datos.value[indice - 1];
  let d1 = datos.value[indice];
  let tooltip_data_seleccionada = x0 - d0.la_fecha > d1.la_fecha - x0 ? d1 : d0;
  let ancho_tooltip = 250;
  let ancho_leyenda_y = document.querySelector(
    "#" + idGrafica + " .titulo-eje-y.vis-titulo-ejes"
  ).clientHeight;
  tooltip.value
    .style("visibility", "visible")
    .style("opacity", "1")
    .style(
      "left",
      evento.layerX >
        0.5 *
          (usarRegistroGraficas().grafica(idGrafica).grupoVis.ancho +
            margenesSvg.value.izquierda +
            margenesSvg.value.derecha)
        ? `${
            evento.layerX - ancho_tooltip + ancho_leyenda_y - 20 < 0
              ? 0
              : evento.layerX - ancho_tooltip + ancho_leyenda_y - 20
          }px`
        : `${evento.layerX + ancho_leyenda_y + 20}px`
    )
    .style("width", ancho_tooltip + "px");
  tooltip.value.html(textoTooltip(tooltip_data_seleccionada));

  let alto_tooltip = parseInt(tooltip.value.style("height"));
  tooltip.value.style(
    "top",
    (evento.layerY <
    usarRegistroGraficas().grafica(idGrafica).grupoVis.value - alto_tooltip
      ? evento.layerY + 10
      : evento.layerY - 10 - alto_tooltip) + "px"
  );
}
function textoTooltip(datum) {
  let total_muestras = sum(variables.value.map((d) => datum[d.id]));
  let cifras_variables = variables.value
    .map((d) => {
      return [
        `<p>
          <span class="nomenclatura-tooltip" style="background: ${d.color} "></span>
          ${d.nombre}| <b> muertes: ${
          datum[d.id + "_absoluto"]
        }</b> | tasa: ${Math.round(100 * datum[d.id]) / 100}
              | % anual: ${Math.round((100 * datum[d.id]) / total_muestras)}
                              </p>`,
        parseInt(datum[d.id + "_absoluto"]),
      ];
    })
    .sort((a, b) => b[1] - a[1])
    .map((d) => {
      return d[0];
    })
    .slice(0, 10);
  return `Año: <b>${
    datum[clave_fecha.value]
  }</b> <br/>${cifras_variables.join("")}`;
}
function cerrarTooltip() {
  tooltip.value.style("visibility", "hidden").style("opacity", "0");
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
          .attr("y", usarRegistroGraficas().grafica(idGrafica).grupoVis.alto)
          .attr(
            "x",
            (d) =>
              escalaTemporal.value(d.data.la_fecha) - 0.5 * anchoBanda.value
          )
          .attr("height", 0)
          .attr("width", anchoBanda.value)
          .transition()
          .duration(500)
          .attr("y", (d) => escalaLineal.value(d[1]))
          .attr("height", (d) =>
            escalaLineal.value(d[0]) - escalaLineal.value(d[1]) < 0
              ? 0
              : escalaLineal.value(d[0]) - escalaLineal.value(d[1])
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
                .attr(
                  "y",
                  usarRegistroGraficas().grafica(idGrafica).grupoVis.alto
                )
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
                .attr("y", (d) => escalaLineal.value(d[1]))
                .attr("height", (d) =>
                  escalaLineal.value(d[0]) - escalaLineal.value(d[1]) < 0
                    ? 0
                    : escalaLineal.value(d[0]) - escalaLineal.value(d[1])
                );
            },
            (barras_update) => {
              barras_update

                .transition()
                .duration(500)
                .attr("y", (d) => escalaLineal.value(d[1]))
                .attr("height", (d) =>
                  escalaLineal.value(d[0]) - escalaLineal.value(d[1]) < 0
                    ? 0
                    : escalaLineal.value(d[0]) - escalaLineal.value(d[1])
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

onMounted(() => {
  idGrafica = buscarIdContenedorHtmlSisdai(
    "grafica",
    sisdaiAreasApiladas.value
  );
  grupoContenedor.value = select("#" + idGrafica + " svg g.contenedor-areas");
  svg.value = select("#" + idGrafica + " svg");

  tooltip.value = select("#" + idGrafica + " div.tooltip");

  margenesSvg.value = usarRegistroGraficas().grafica(idGrafica).margenes;
  watch(
    () => usarRegistroGraficas().grafica(idGrafica).margenes,
    (nv) => (margenesSvg.value = nv)
  );

  if (
    usarRegistroGraficas().grafica(idGrafica).grupoVis.ancho > 0 &&
    datos.value &&
    anchoBanda.value
  ) {
    calcularEscalas(usarRegistroGraficas().grafica(idGrafica).grupoVis);

    creaVis();
  }

  watch(
    () => usarRegistroGraficas().grafica(idGrafica).grupoVis,
    () => {
      calcularEscalas(usarRegistroGraficas().grafica(idGrafica).grupoVis);
      if (
        usarRegistroGraficas().grafica(idGrafica).grupoVis.ancho > 0 &&
        datos.value &&
        anchoBanda.value
      ) {
        calcularEscalas(usarRegistroGraficas().grafica(idGrafica).grupoVis);

        creaVis();
      }
    }
  );
  watch(datos, () => {
    datos.value.forEach(
      (d) => (d.la_fecha = conversionTemporal(d[clave_fecha.value]))
    );
    calcularEscalas(usarRegistroGraficas().grafica(idGrafica).grupoVis);
    creaVis();
  });
  watch(variables, () => {
    calcularEscalas(usarRegistroGraficas().grafica(idGrafica).grupoVis);
    creaVis();
  });
});
defineExpose({
  escalaTemporal,
  escalaLineal,
});
function generadorAreaBezier(datum) {
  if (datum.length > 2) {
    var txt = `M ${escalaTemporal.value(
      +datum[0].data.la_fecha
    )}, ${escalaLineal.value(datum[0][1])}`;
    let x_i_mas_1;
    for (let i = 0; i < datum.length - 1; i++) {
      //let x00 = escalaTemporal.value(+datum[i-1].data.Year) - escalaTemporal.value.bandwidth() * .5
      let x_i =
        escalaTemporal.value(datum[i].data.la_fecha) 
      x_i_mas_1 =
        escalaTemporal.value(datum[i + 1].data.la_fecha) -
        0.5 * anchoBanda.value;

      //escalaTemporal.value(+datum[i + 1].datala_fecha)

      let x_i_bandwidth = x_i + 0.5 * anchoBanda.value;
      let x_mid = 0.5 * (x_i_mas_1 - x_i_bandwidth) + x_i_bandwidth;

      let y_i = escalaLineal.value(datum[i][1]);
      let y_i_mas_1 = escalaLineal.value(datum[i + 1][1]);

      txt += `H ${x_i_bandwidth} C ${x_mid} ${y_i},
        ${x_mid} ${y_i_mas_1},
        ${x_i_mas_1} ${y_i_mas_1}H ${x_i_mas_1}`;
    }
    txt += `H ${x_i_mas_1 + .5 *anchoBanda.value}`;

    txt += `V ${escalaLineal.value(datum[datum.length - 1][0])}`;
    txt += `H ${x_i_mas_1 - .5 * anchoBanda.value}`;

    for (let i = datum.length - 1; i > 0; i--) {
      //let x00 = escalaTemporal.value(+datum[i-1].data.Year) - escalaTemporal.value.bandwidth() * .5
      let x_i =
        escalaTemporal.value(+datum[i].data.la_fecha) - 1 * anchoBanda.value;
      let x_i_menos_1 = escalaTemporal.value(+datum[i - 1].data.la_fecha);
      let x_i_bandwidth = x_i + 0.5 * anchoBanda.value;

      let x_i_bandwidth_menos_1 = +0.5*anchoBanda.value + x_i_menos_1;

      let x_mid = 0.5 * (x_i - x_i_bandwidth_menos_1) + x_i_bandwidth_menos_1;

      let y_i = escalaLineal.value(datum[i][0]);
      let y_i_menos_1 = escalaLineal.value(datum[i - 1][0]);

      txt += `H ${x_i_bandwidth} C ${x_mid} ${y_i}, ${x_mid} ${y_i_menos_1}, ${x_i_bandwidth_menos_1} ${y_i_menos_1}H ${x_i_menos_1}`;
    }

    return txt;
  }
}
</script>

<template>
  <g
    ref="sisdaiAreasApiladas"
    :transform="`translate(${margenesSvg?.izquierda || 0},${
      margenesSvg?.arriba || 0
    })`"
    class="contenedor-areas"
  >
  </g>
</template>