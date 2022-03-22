<template>
    <div class="content">
        <div class="button-container" >
            <b-button
                type="is-info"
                outlined
                @click="newPoll"
            >
                Criar nova Pesquisa
            </b-button>
            <b-button
                type="is-info"
                outlined
                v-if="userLogged"
                @click="vincularPolls"
            >
                Vincular Pesquisas ao Usuário
            </b-button>
        </div>
        <div v-if="hasPolls">
            <b-table
                :data="polls"
            >  
                <b-table-column 
                    v-for="(col, i) in columns"
                    :key="i"
                    :field="col.field" 
                    :label="col.label"
                    :width="col.width" 
                    numeric 
                    v-slot="props"
                    >

                    <div v-if="col.field == 'requiresauthentication'">
                        {{ props.row[col.field] ? "Sim" : "Não" }}
                    </div>
                    <div v-else-if="col.field == 'title'">
                        <router-link :to="{ name: 'poll-edit', params: { id: props.row['pollId'] } }" > {{ props.row[col.field] }} </router-link> 
                    </div>
                    <div v-else >
                        {{ props.row[col.field] }}
                    </div>
                </b-table-column>

            </b-table>
        </div>
        <div v-else>
            <div class="spacing" >
                Nenhuma pesquisa encontrada.
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'HelloWorld',
    props: {
        msg: String
    },
    data() {
        return {
            testRoute: {
                name: 'poll-edit',
                params: {
                    id: 0
                }
            },
            polls: [],
            columns: [
                { field: 'title', label: 'Titulo' },
                { field: 'description', label: 'Descrição' },
                { field: 'requiresauthentication', label: 'Requer Login para Responder', width: 150 }
            ],
            hasPolls: false,
            userLogged: false,
        }
    },
    created(){
        if ( localStorage.idusuario && localStorage.token ){
            this.userLogged = true;
            this.loadDataFromUser();
        } else {
            // Carrega todos as pesquisas na memória (localstorage)
            this.polls = [];
            this.loadData();
        }
        
    },
    methods:{
        loadData(){
            let idsPolls = JSON.parse( localStorage.getItem("polls-added") );
            if ( idsPolls ){
                this.axios.post('http://localhost:8080/pollmaker/getallwithids', idsPolls)
                    .then( x => {
                        this.polls.push(...x.data);
                                            
                        if (this.polls.length > 0){
                            this.hasPolls = true;
                        }
                    })
                    .catch(e =>{
                        console.error(e);
                    })
            }
        },
        loadDataFromUser(){
            this.polls = []; 
            this.axios.get('http://localhost:8080/pollmaker/getallbyuser?iduser='+localStorage.idusuario)
                .then( x => {
                    this.polls.push(...x.data);

                    if (this.polls.length > 0){
                        this.hasPolls = true;
                    }
                    this.loadData();
                })
                .catch(e =>{
                    console.error(e);
                });
        },
        vincularPolls(){
            this.$router.push({ name: 'poll-vincular-user' });
        },
        newPoll(){
            this.$router.push({ name: 'poll-create' });
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    h3 {
        margin: 40px 0 0;
    }
    ul {
        list-style-type: none;
        padding: 0;
    }
    li {
        display: inline-block;
        margin: 0 10px;
    }
    a {
        color: #42b983;
    }
    .spacing{
        margin: 20px;
    }
    
    .button-container .button{
        margin-right: 20px;
    }
</style>
