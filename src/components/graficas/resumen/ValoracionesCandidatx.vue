<script setup>
const props = defineProps({
    datos: {type:Object,defaul:()=>({
        JAM:{
            "POSITIVA": 0,
            "NEGATIVA": 0
        },BXGR:{
            "POSITIVA": 0,
            "NEGATIVA": 0
        },CSP:{
            "POSITIVA": 0,
            "NEGATIVA": 0
        },SE:{
            "POSITIVA": 0,
            "NEGATIVA": 0
        }

    })}
})

</script>
<template>
    <div class="valoracion-candidatx">
        <div class="flex flex-contenido-centrado positivas">
            <img class="m-1" src="@/assets/imgs/positiva-CSP.svg" alt="" :style="{opacity: datos?.CSP?.POSITIVA}">
            <img class="m-1" src="@/assets/imgs/positiva-JAM.svg" alt="" :style="{opacity: datos?.JAM?.POSITIVA}">
            <img class="m-1"  src="@/assets/imgs/positiva-BXGR.svg" alt="" :style="{opacity: datos?.BXGR?.POSITIVA}">
            <img class="m-1"  src="@/assets/imgs/positiva-SE.svg" alt="" :style="{opacity: datos?.SE?.POSITIVA}">
        </div>
        <div class="flex flex-contenido-centrado negativas">
            <img class="m-1" src="@/assets/imgs/negativa-CSP.svg" alt="" :style="{opacity: datos?.CSP?.NEGATIVA}">
            <img class="m-1" src="@/assets/imgs/negativa-JAM.svg" alt="" :style="{opacity: datos?.JAM?.NEGATIVA}">
            <img class="m-1"  src="@/assets/imgs/negativa-BXGR.svg" alt="" :style="{opacity: datos?.BXGR?.NEGATIVA}">
            <img class="m-1"  src="@/assets/imgs/negativa-SE.svg" alt="" :style="{opacity: datos?.SE?.NEGATIVA}">
        </div>
    </div>
</template>
<style scoped lang="scss">
.valoracion-candidatx{
    .positivas,.negativas{
        img{
            max-width: 25px;

        }
    }
}
</style>