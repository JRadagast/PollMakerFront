<template>
    <div class="content">
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
                    <div v-else-if="col.field == 'vincular'" >
                        <b-button
                            type="is-success"
                            size="is-small"
                            @click="()=> vincularPolls(props.row)"
                        >
                            Vincular
                        </b-button>
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
                { field: 'requiresauthentication', label: 'Requer Login para Responder', width: 150 },
                { field: 'vincular', label: 'Vincular', width: 150 }
            ],
            hasPolls: false,
        }
    },
    created(){
        if ( localStorage.idusuario && localStorage.token ){
            this.loadData();
        }
        
    },
    methods:{
        loadData(){
            let idsPolls = JSON.parse( localStorage.getItem("polls-added") );
            if ( idsPolls ){
                this.axios.post('http://localhost:8080/pollmaker/getallwithids', idsPolls)
                    .then( x => {
                        this.polls = x.data;
                                            
                        if (this.polls.length > 0){
                            this.hasPolls = true;
                        }
                    })
                    .catch(e =>{
                        console.error(e);
                    })
            }
        },
        vincularPolls( obj ){
            this.addPollToUser = obj;
            this.$buefy.dialog.confirm({
                message: 'Tem certeza que deseja vincular esta pesquisa ao seu usuário?',
                onConfirm: this.vincular
            })
        },
        vincular(){
            let pollId = this.addPollToUser.pollId;
            this.addPollToUser.user.idusuario = localStorage.idusuario;
            this.axios.post('http://localhost:8080/pollmaker/save-poll', this.addPollToUser)
                .then( () => {

                    let pollsAdded = JSON.parse(localStorage.getItem('polls-added'));
                    let index = pollsAdded.indexOf(pollId);
                    if (index > -1){
                        pollsAdded.splice( index, 1 );
                    }
                    localStorage.setItem('polls-added', JSON.stringify(pollsAdded));

                    this.$buefy.dialog.alert('Pesquisa vinculada com sucesso!');

                    this.loadData();
                })
                .catch(e =>{
                    console.error(e);
                });
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
    
</style>
