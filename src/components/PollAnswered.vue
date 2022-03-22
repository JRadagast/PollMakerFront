<template>
    <div class="form">
        <div class="content columns is-flex-wrap">
            <div class="column is-11">
                Obrigado por responder esta pesquisa!
                <router-link :to="{ name: 'poll-list' }"> Voltar para a tela inicial </router-link>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
        }
    },
    created(){
    },
    methods:{
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
    .is-flex-wrap{ 
        flex-wrap: wrap;
    }
    .textarea{
        resize: none!;
    }
</style>
