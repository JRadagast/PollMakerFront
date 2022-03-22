<template>
    <div id="app">
        <div class="header">
            <div class="content columns">    
                <div class="to-right column is-6">
                    <router-link :to="{ name: 'poll-list' }" > Home </router-link>
                </div>
                <div class="to-left column is-6">
                    <div class="to-left-block">
                        <span> Usuario logado: {{ user }} </span>
                    </div>
                    <div class="to-left-block">
                        <div class="second">
                            <span v-if="user == 'Anônimo'" @click="openModalLogIn" > Login </span>
                            <span v-else @click="logOut" > Logout </span>
                        </div>
                        <div class="third">
                            <span @click="openModalCadastroUsuario" > Cadastrar Usuario </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="body">
            <router-view />

            <b-modal
                :active="openModal"
                has-modal-card
                :on-cancel="() => { openModal = false }"
            >
                <div class="modal-card" style="width: auto">
                    <header class="modal-card-head">
                        <p class="modal-card-title"> {{ isLogin ? "Login" : "Cadastrar Usuário" }} </p>
                    </header>
                    <section class="modal-card-body columns is-flex-wrap">
                        <div class="column is-12">
                            <b-field
                                label="Login"
                                :type="{ 'is-danger': !(newUser.username && newUser.username.length > 0) }"
                                :message="{ 'Usuário não pode ser vazio!': !(newUser.username && newUser.username.length > 0) }"
                            >
                                <b-input v-model="newUser.username" maxlength="50" :has-counter="false"></b-input>
                            </b-field>
                        </div>

                        <div class="column is-12">
                            <b-field
                                label="Password"
                                :type="{ 'is-danger': passwordNotSame }"
                                :message="{ 'Passwords tem que ser iguais!': passwordNotSame }"
                            >
                                <b-input v-model="newUser.password" maxlength="50" :has-counter="false" type="password" password-reveal @input="verifyPasswords" ></b-input>
                            </b-field>
                        </div>

                        <div class="column is-12">
                            <b-field
                                v-if="!isLogin"
                                label="Repetir Password"
                                :type="{ 'is-danger': passwordNotSame }"
                                :message="{ 'Passwords tem que ser iguais!': passwordNotSame }"
                            >
                                <b-input v-model="newUser.password2" maxlength="50" :has-counter="false" type="password" password-reveal @input="verifyPasswords" ></b-input>
                            </b-field>
                        </div>
                        
                    </section>
                    <footer class="modal-card-foot">
                        <b-button
                            label="Close"
                            @click="openModal = false" />
                        <b-button
                            v-if="isLogin"
                            :label="'Login'"
                            @click="logIn"
                            type="is-primary" />
                        <b-button
                            v-else
                            :label="'Cadastrar'"
                            @click="cadastrarUsuario"
                            type="is-primary" />
                    </footer>
                </div>
            </b-modal>
        </div>
    </div>
</template>

<script>

export default {
    name: 'App',
    components: {
    },
    data (){
        return {
            user: "Anônimo",
            newUser: {
                username: null,
                password: null,
                password2: null
            },
            openModal: false,
            passwordNotSame: false,
            isLogin: false,
        }
    },
    created (){
        this.$root.header = { Authorization: 'Bearer ' }

        if (localStorage.token && localStorage.idusuario){
            this.loadUser();
        }
    },
    methods: {
        openModalLogIn(){
            this.isLogin = true;
            this.openModal = true;
        }, 
        logIn(){
            if (this.validateUser()){
                this.axios.post('http://localhost:8080/pollmaker/authenticate', this.newUser )
                    .then(x => {
                        this.$root.user = x.data;
                        this.user = x.data.username;
                        this.openModal = false;
                        localStorage.setItem("token", x.data.jwttoken);
                        localStorage.setItem("idusuario", x.data.idusuario);
                        this.$router.go();
                    })
                    .catch(er => {
                        console.log(er);
                        this.$buefy.dialog.alert('Usuário não encontrado!');
                    })
            }
        }, 
        loadUser(){
            this.axios.get('http://localhost:8080/pollmaker/getuserbyid?iduser='+localStorage.idusuario )
                .then(x => {
                    this.user = x.data.username;
                    this.$root.user = x.data;
                })
                .catch(er => {
                    console.log(er);
                })
        },
        openModalCadastroUsuario(){
            this.isLogin = false;
            this.openModal = true;
        },
        cadastrarUsuario(){
            if (this.validateUser()){
                this.axios.post('http://localhost:8080/pollmaker/cadastrar', this.newUser )
                    .then(() => {
                        this.$buefy.dialog.alert('Usuário cadastrado com sucesso! Agora faça o login');
                        this.clearUser();
                    })
                    .catch(er => {
                        console.log(er);
                        this.$buefy.dialog.alert('Usuário já existe!');
                        this.clearUser();
                    })
            }
        },
        logOut(){
            this.$buefy.dialog.confirm({
                message: 'Tem certeza que deseja fazer o Logout?',
                onConfirm: () => {
                    this.user = 'Anônimo';
                    this.$root.user = null;
                    localStorage.removeItem('token');
                    localStorage.removeItem('idusuario')
                    this.$router.go();
                }
            })
        },
        verifyPasswords(){
            this.passwordNotSame =  !this.isLogin ? !(this.newUser.password == this.newUser.password2) : false;
        },
        clearUser(){
            this.newUser = {
                username: null,
                password: null,
                password2: null
            };
            this.openModal = false;
        },
        validateUser(){
            let canProceed = true;
            if ( !(this.newUser.username && this.newUser.username.length > 0) ){
                canProceed = false;
            }

            if ( !(this.newUser.password && this.newUser.password.length > 0) ){
                canProceed = false;
            }
            
            if ( !this.isLogin && !(this.newUser.password2 && this.newUser.password2.length > 0) ){
                canProceed = false;
            }

            return canProceed;
        }
    }
}
</script>

<style>
    body, html{
        width: 100%;
        height: 100%;
    }

    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .header{
        width: 100%;
        position: relative;
        height: 80px;
        display: flex;
        justify-content: space-between;
    }

    .to-right{
        margin-right: 40px;
    }

    .to-left{
        margin-right: 40px;
        display: flex;
        flex-wrap: wrap;
    }

    .to-left .to-left-block{
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .second, .third{
        width: 50%;
        cursor: pointer;
        color: black;
        text-decoration: underline;
    }

    .second:hover, .third:hover{
        color: cornflowerblue;
        text-decoration: underline;
    }

    .content{
        width: 960px;
        position: relative;
        left: 50%;
        transform: translateX(-50%);
        background-color: #fff;
    }

    .body{
        position: relative;
        flex-grow: 1;
    }

    .modal .animation-content{
        width: 960px;
    }

    .modal .modal-card-body{
        margin-bottom: 0 !important;
    }

    .is-flex-wrap{ 
        flex-wrap: wrap;
    }
</style>
