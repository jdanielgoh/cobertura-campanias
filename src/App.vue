<script setup>
import Tablero from "./components/Tablero.vue";
import Header from "./components/ui/Header.vue";
import Footer from "./components/ui/Footer.vue";

import "sisdai-css/src/eni.scss";
</script>

<template>
  <Header></Header>
  <div class="contenedor ancho-lectura">
    <h1>
      EN UNA DEMOCRACIA <br />
      <span class="caben"
        ><span>¿</span>caben todas las voces<span>?</span></span
      >
    </h1>
    <p>
      En esta herramienta se visualiza el tiempo que han destinado diariamente
      los medios de radio y TV a la difusión sobre cada candidatx, así como los
      juicios de valor, estereotipos y enfoques que han emitido a través del
      proceso de campañas electorales.
    </p>
    <p>
      Aquí podrás consultar la cobertura que ha hecho tu noticiero favorito, a
      qué candidatxs han destinado más tiempo, así como verificar la no
      imparcialidad de la información.
    </p>
    <p class="inst"><b>Instrucciones:</b></p>
    <p>
      Usa el buscador izquierdo para encontrar un programa de noticias, o
      escribe "TODOS LOS MEDIOS" si deseas ver la estadística general (ten
      paciencia con esta opción, puede costarle un poquito a tu dispositivo).
      Las opciones del selector derecho te permitirán consultar distintos tipos
      de frases en relacion a las candidaturas al pasar tu cursor sobre las
      burbujas.
    </p>
  </div>
  <Tablero />
  <div class="contenedor ancho-lectura">
    <p class="inst"><b>Fuentes</b></p>
    <ul>
      <li>
        <a
          href="https://monitoreo2024.ine.mx/descargas-informes/"
          target="_blank"
          >Monitoreo de programas de radio y televisión que difunden noticias,
          INE</a
        >
      </li>
    </ul>
    <p class="inst"><b>Metdología</b></p>
    <ul>
      <li>
        Las columnas "PRESENCIA DE
        ESTEREOTIPOS","FRASE_ESTEREOTIPO_VULNERABILIDAD" se fusionaron en una
        sola columna que llamé "FRASE_ESTEREOTIPO_GENERAL"
      </li>
      <li>
        Los registros que tenían frases positivas, negativas, de enfoques y de
        FRASE_ESTEREOTIPO_GENERAL se agruparon por las siguientes columnas:
        "NOMBRE_NOTICIERO","ID_PIEZA_INFORMATIVA", "FECHA_TESTIGO",
        "TIPO_VALORACION", "CANDIDATO", "DURACION_MINUTOS". Y las frases se
        concatenaron con tres puntos suspensivos y un salto de línea. Esto se
        hizo para eliminar frases sueltas y optimizar la experiencia web.
      </li>
      <li>
        Los registros sin frases se agruparon por las siguientes columnas:
        "NOMBRE_NOTICIERO", "ID_PIEZA_INFORMATIVA", "FECHA_TESTIGO",
        "TIPO_VALORACION","CANDIDATO". Y para cada grupo, la duración se sumó.
        Esto se hizo con la finalidad de reducir renglones y optimizar el tiempo
        de carga de la data.
      </li>
      <li>
        Ambos conjuntos de datos se vuelven a concatenar para hacer una base de
        datos completa
      </li>
      <li> Si quieres checar el código a más detalle, acá lo encuentras en mi <a
          href="https://github.com/jdanielgoh/cobertura-campanias-analisis"
          target="_blank"
          >Github</a
        ></li>
    </ul>
  </div>
  <Footer></Footer>
</template>

<style scoped lang="scss">
@import "node_modules/sisdai-css/src/eni.scss";
a.marca {
  font-family: "Roboto Mono", monospace !important;
}
h1 {
  font-family: "Newsreader", serif !important;

  text-align: center;
  font-weight: 700;
  font-size: 50px;
  @media (max-width: 768px) {
    font-size: 34px;
  }
  span.caben {
    font-family: "Newsreader", serif !important;

    font-size: 44px;

    font-weight: 300;
    @media (max-width: 768px) {
      font-size: 28px;
    }
    span {
      color: rgb(143, 143, 143);
    }
  }
}
p {
  strong {
    background: rgb(227, 210, 224);
  }
}
p.inst b {
  background: rgb(227, 210, 224);
}
ul {
  li {
    a {
      color: #008773;
    }
  }
}
</style>
