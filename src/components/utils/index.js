import {min,range,ascending} from "d3-array"
export function idAleatorio() {
  return "id-" + Math.random().toString(36).substring(2);
}
export function reordenamientoApilado(datos_apilados) {
  for (
    var indice_fecha = 0;
    indice_fecha < datos_apilados[0].length;
    indice_fecha++
  ) {
    var dictsStack = [];
    for (
      var indice_franja = 0;
      indice_franja < datos_apilados.length;
      indice_franja++
    ) {
      var min_val = min(
        range(datos_apilados.length).map(
          (i) => datos_apilados[i][indice_fecha][0]
        )
      );
      dictsStack[indice_franja] = {
        cat: indice_franja,
        intervalo: datos_apilados[indice_franja][indice_fecha],
        delta:
          datos_apilados[indice_franja][indice_fecha][1] -
          datos_apilados[indice_franja][indice_fecha][0],
        minimo: min_val,
      };
    }
    dictsStack.sort((a, b) => ascending(a.delta, b.delta));
    let contador_apilador = 0;
    for (
      indice_franja = 0;
      indice_franja < datos_apilados.length;
      indice_franja++
    ) {
      if (indice_franja === 0) {
        contador_apilador = dictsStack[indice_franja].minimo;
      }

      dictsStack[indice_franja].intervalo = [
        contador_apilador,
        contador_apilador + dictsStack[indice_franja].delta,
      ];
      datos_apilados[dictsStack[indice_franja].cat][indice_fecha][0] =
        contador_apilador;
      datos_apilados[dictsStack[indice_franja].cat][indice_fecha][1] =
        contador_apilador + dictsStack[indice_franja].delta;
      contador_apilador += dictsStack[indice_franja].delta;
    }
  }
  return datos_apilados;
}
