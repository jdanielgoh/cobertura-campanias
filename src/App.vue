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
      En esta herramienta se visualiza el tiempo que han destinado los medios de
      radio y TV a la difusión sobre cada candidatx, así como los juicios de
      valor, estereotipos y actos violentos que han emitido a través del proceso
      de campañas electorales.
    </p>
    <p>
      Aquí podrás consultar la cobertura que ha hecho tu presentadora o
      presentador de noticias favorito,<strong> a qué candidatxs han mantenido al centro de la opinión</strong>, así como confirmar por qué desconfías
      tanto de ______.
    </p>
  </div>
  <HelloWorld msg="Vite + Vue" />
  <Footer></Footer>
</template>

<style scoped lang="scss">

@import "node_modules/sisdai-css/src/eni.scss";
a.marca{
  font-family: 'Roboto Mono', monospace!important;

}
h1 {
  font-family:"Newsreader", serif!important;

  text-align: center;
  font-weight: 700;
  font-size: 50px;
  span.caben {  
    font-family:"Newsreader", serif!important;

    font-size: 44px;

    font-weight: 300;
    span {
      color: rgb(143, 143, 143);
    }
  }
}
p{
  strong{
    background: rgb(196, 250, 101);
  }
}
</style>
