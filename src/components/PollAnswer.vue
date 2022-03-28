<template>
    <div class="form">
        <div class="content columns is-flex-wrap"
            v-if=" !requireAuthenticationToAnswer || (requireAuthenticationToAnswer && userIsLogged)"
        >
            <div class="column is-12">
                Titulo: {{ poll.title }}
            </div>
            <div class="column is-12">
                Descrição: {{ poll.description }}
            </div>
            <div class="column is-12">
                <div class="options columns is-flex-wrap">
                    <div class="column is-12"
                        v-for="(pol, k) in poll.pollOptions"
                        :key="k"
                    >
                        <b-radio v-model="answer.option" @input="optionSelected(pol)" :native-value="pol.option" > {{ pol.option }} </b-radio>
                    </div>
                </div>
                <div class="button-box">
                    <b-button
                        type="is-info"
                        outlined
                        @click="salvar"
                    >
                        Responder
                    </b-button>
                </div>
            </div>
        </div>
        <div class="content columns is-flex-wrap"
            v-else
        >
            <div class="column">
                O criador desta pesquisa requeriu que o usuário esteja logado para responder a esta pesquisa! 
                Faça o login para poder responder
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        msg: String
    },
    data() {
        return {
            poll: {
                title: null,
                description: null,
                iduser: null,
                pollOptions: [],
                requiresauthentication: false
            },
            answer: {
                pollOptionId: 0,
                option: "",                
            },
            requireAuthenticationToAnswer: false,
            userIsLogged: false,
        }
    },
    created(){
        this.userIsLogged = localStorage.idusuario ? true : false;

        if (this.$route.params.idpoll){
            this.loadData(this.$route.params.idpoll);
        }
        if (this.$route.params.idpoll && localStorage.idusuario ){
            this.loadUserAnswer(this.$route.params.idpoll, localStorage.idusuario);
        }
    },
    methods:{
        loadData(idpoll){
            this.axios.get('http://localhost:8080/pollmaker/getbyid?idpoll='+idpoll)
                .then( x => {
                    this.poll = x.data;     
                    this.requireAuthenticationToAnswer = this.poll.requiresAuthentication;
                })
                .catch(e =>{
                    console.error(e);
                });  
        },
        loadUserAnswer(idpoll, iduser){
            this.axios.get('http://localhost:8080/pollmaker/answers/getanswerbypollanduser?idpoll='+idpoll+'&iduser='+iduser)
                .then( x => {
                    if (x.data){
                        this.answer = x.data;       
                    }
                })
                .catch(e =>{
                    console.error(e);
                });  
        },
        optionSelected( opt ){
            this.answer.pollOptionId = opt.pollOptionId
        },
        salvar(){
            if ( this.answer && this.answer.pollOptionId > 0 ){
                this.isSaving = true;
                this.answer.iduser = localStorage.idusuario;
                this.answer.pollId = this.$route.params.idpoll;

                let url = this.requireAuthenticationToAnswer ? 'http://localhost:8080/poll-maker/answers/save-answer-authenticated' : 'http://localhost:8080/pollmaker/answers/save-answer';
                let header = {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (localStorage.token ? localStorage.token : '')
                }

                this.axios.post(url, this.answer, {
                    headers: header
                })
                .then( x => {
                    if (x.status == 200){

                        this.$router.push( { name: 'poll-answered' });
                    }
                    this.isSaving = false;
                })
                .catch(e =>{
                    console.error(e);
                    this.isSaving = false;
                });
            }
        },
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
