<template>
    <div class="form">
        <div class="content columns is-flex-wrap">
            <div class="column is-11">
                <b-field
                    label="Título"
                    :type="{'is-danger': !(poll.title && poll.title.length > 0) }"
                    :message="{'Título não pode ser vazio!': !(poll.title && poll.title.length > 0) }"
                >
                    <b-input v-model="poll.title" maxlength="50" :has-counter="false"></b-input>
                </b-field>
            </div>
            <div class="column is-1">
                <b-field
                    label="Obrigar Login?"
                >
                    <b-checkbox v-model="poll.requiresAuthentication" 
                        :true-value="true"
                        :false-value="false"
                    ></b-checkbox>
                </b-field>
            </div>
            <div class="column is-12">
                <b-field
                    label="Descrição"
                >
                    <b-input v-model="poll.description" type="textarea" maxlength="255" :has-counter="false"></b-input>
                </b-field>
            </div>
            <div class="column is-12">
                <div class="options columns is-flex-wrap">
                    <div
                        class="column is-12"
                        v-for="(pol, k) in poll.pollOptions"
                        :key="k"
                    >
                        <b-field
                            :label="'Opção ' + (k+1)"
                            :type="{ 'is-danger': pol.hasError }"
                            :message="{ 'Descrição não pode ser vazia!': pol.hasError }"
                        >
                            <b-input v-model="pol.option" maxlength="255" :has-counter="false" @input="changeOption(pol)" ></b-input>
                        </b-field>
                    </div>
                </div>
                <div class="button-box">
                    <b-button
                        type="is-info"
                        outlined
                        @click="addNewOption"
                    >
                        Criar nova opção
                    </b-button>
                    <b-button
                        type="is-info"
                        outlined
                        :loading="isSaving"
                        @click="salvar"
                    >
                        Salvar
                    </b-button>
                    <b-button
                        type="is-info"
                        outlined
                        v-if="showShareButton"
                        @click="share"
                    >
                        Compartilhar
                    </b-button>
                    <b-button
                        type="is-info"
                        outlined
                        v-if="showShareButton"
                        @click="showChart"
                    >
                        Ver Resultado
                    </b-button>
                </div>
            </div>
        </div>

        <b-modal
            :active="openShareModal"
            has-modal-card
            :on-cancel="() => { openShareModal = !openShareModal }"
        >
            <div class="modal-card" style="width: auto" v-if="isShare" >
                <header class="modal-card-head">
                    <p class="modal-card-title">Copiar link para o clipboard</p>
                </header>
                <section class="modal-card-body columns">
                    <div class="column is-10">
                        <b-input ref="shareLink" v-model="shareLink" :readonly="true" ></b-input>
                    </div>
                    <div class="column is-2">
                        <b-button
                            type="is-info"
                            outlined
                            @click="copyLink"
                        >
                            Copiar Link
                        </b-button>
                    </div>
                </section>
                <footer class="modal-card-foot">
                    <b-button
                        label="Close"
                        @click="openShareModal = !openShareModal" />
                </footer>
            </div>

            <div class="modal-card" style="width: auto" v-if="isChart" >
                <BarChartContainer :idpoll="idpoll" ></BarChartContainer>
            </div>
        </b-modal>
    </div>
</template>

<script>
import copy from 'copy-to-clipboard';
import BarChartContainer from './BarChartContainer.vue';

export default {
    props: {
        msg: String
    },
    components: {
        BarChartContainer,
    },
    data() {
        return {
            poll: {
                title: null,
                description: null,
                user: null,
                pollOptions: [],
                requiresAuthentication: false
            },
            showShareButton: false,
            openShareModal: false,
            isSaving: false,
            shareLink: '',
            isShare: false,
            isChart: false,
            idpoll: 0,
        }
    },
    created(){
        if (this.$route.params.id){
            this.idpoll = this.$route.params.id;
            this.loadData(this.$route.params.id);
        }
    },
    methods:{
        loadData(id){
            this.axios.get('http://localhost:8080/pollmaker/getbyid?idpoll='+id)
                .then( x => {
                    this.poll = x.data;                
                })
                .catch(e =>{
                    console.error(e);
                });
            this.showShareButton = true;
        },
        addNewOption(){
            let newOpt = {
                option: ''
            }

            this.poll.pollOptions.push(newOpt);
        },
        salvar(){
            if ( this.validatePoll() ){
                this.isSaving = true;
                if (localStorage.idusuario){
                    this.poll.user = { idusuario: localStorage.idusuario };
                }

                this.axios.post('http://localhost:8080/pollmaker/save-poll', this.poll )
                .then( x => {
                    if (x.status == 200){

                        if (!localStorage.idusuario){
                            let pollsAdded = JSON.parse(localStorage.getItem('polls-added'));
                            if (!pollsAdded){
                                pollsAdded = [];
                            }
                            pollsAdded.push( x.data.pollId );
                            localStorage.setItem('polls-added', JSON.stringify(pollsAdded));
                        }

                        this.$router.go( { name: 'poll-edit', params: { id: x.data.pollId } });
                    }
                    this.isSaving = false;
                })
                .catch(e =>{
                    console.error(e);
                    this.isSaving = false;
                });
            }
        },
        changeOption( opt ){
            opt.hasError = false;
        },
        share(){
            this.shareLink = "http://localhost:8081/answer-poll/" +this.$route.params.id;
            this.openShareModal = true;
            this.isShare = true;
            this.isChart = false;
        },
        showChart(){
            this.openShareModal = true;
            this.isChart = true;
            this.isShare = false;
        },
        copyLink(){
            copy(this.shareLink);
        },
        validatePoll(){
            let canSave = true;

            if (this.poll){
                if ( !(this.poll.title && this.poll.title.length > 0) ){
                    canSave = false;
                }

                if ( this.poll.pollOptions.length == 0){
                    canSave = false;
                } else {
                    this.poll.pollOptions.forEach( p => {
                        if ( !(p.option && p.option.length > 0) ){
                            canSave = false;
                            p.hasError = true;
                        }
                    });
                }
            } 
            
            this.$forceUpdate();
            return canSave;
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
    .form{
        margin-top: 20px;
    }
    .is-flex-wrap{ 
        flex-wrap: wrap;
    }
    .textarea{
        resize: none!;
    }
    .button-box{
        display: flex;
        justify-content: space-around;
    }
</style>
