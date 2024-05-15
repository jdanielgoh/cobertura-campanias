<script setup>
const props = defineProps({
    datos: {type:Object,defaul:()=>({
        JAM:{
            "P": 0,
            "N": 0
        },BXGR:{
            "P": 0,
            "N": 0
        },CSP:{
            "P": 0,
            "N": 0
        },SE:{
            "P": 0,
            "N": 0
        }

    })}
})

</script>
<template>
    <div class="valoracion-candidatx">
        <div class="flex flex-contenido-centrado positivas">
            <img class="m-1" src="@/assets/imgs/positiva-CSP.svg" alt="" :style="{opacity: datos?.CSP?.P}">
            <img class="m-1" src="@/assets/imgs/positiva-JAM.svg" alt="" :style="{opacity: datos?.JAM?.P}">
            <img class="m-1"  src="@/assets/imgs/positiva-BXGR.svg" alt="" :style="{opacity: datos?.BXGR?.P}">
            <img class="m-1"  src="@/assets/imgs/positiva-SE.svg" alt="" :style="{opacity: datos?.SE?.P}">
        </div>
        <div class="flex flex-contenido-centrado negativas">
            <img class="m-1" src="@/assets/imgs/negativa-CSP.svg" alt="" :style="{opacity: datos?.CSP?.N}">
            <img class="m-1" src="@/assets/imgs/negativa-JAM.svg" alt="" :style="{opacity: datos?.JAM?.N}">
            <img class="m-1"  src="@/assets/imgs/negativa-BXGR.svg" alt="" :style="{opacity: datos?.BXGR?.N}">
            <img class="m-1"  src="@/assets/imgs/negativa-SE.svg" alt="" :style="{opacity: datos?.SE?.N}">
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