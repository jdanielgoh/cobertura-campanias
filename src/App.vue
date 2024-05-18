<script setup>
import HelloWorld from "./components/HelloWorld.vue";
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
      qué candidatxs han destinado más tiempo, así como verificar la no imparcialidad
      de la información.
    </p>
    <p><b>Instrucciones:</b></p>
    <p>
      Usa el buscador izquierdo para encontrar un programa de noticias, o
      escribe "TODOS LOS MEDIOS" si deseas ver la estadística general (ten
      paciencia con esta opción, puede costarle un poquito a tu dispositivo).
      Las opciones del selector derecho te permitirán consultar distintos tipos
      de frases en relacion a las candidaturas al pasar tu cursor sobre las burbujas.
    </p>
  </div>
  <HelloWorld msg="Vite + Vue" />
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
    background: rgb(196, 250, 101);
  }
}
</style>
