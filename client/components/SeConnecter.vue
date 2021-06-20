<template>
    <div class="limiter">

        <div v-if="!isUserConnected" class="container">

            <div class="getPassword">
                <form @submit.prevent="getPassword">
                    <h3>Récupérer son mot de passe</h3>
                    <input type="text" v-model="numCarteElec" placeholder="Numéro de carte électorale" required>
                    <input type="text" v-model="codePostal" placeholder="Code postal" required>
                    <input type="text" v-model="emailRegister" placeholder="Email" required>
                    <button type="submit">Récupérer</button>
                </form>
            </div>

            <div class="login">
                <form>
                    <h3>Se connecter</h3>
                    <input type="text" v-model="emailLogin" placeholder="Email" required>
                    <input v-bind:type="typeMdp" v-model="password" placeholder="Mot de passe" required>

                    <img src="img/hide_password.png" class="showMDP" @click="showMDP" v-if="hidden">
                    <img src="img/show_password.png" class="showMDP" @click="showMDP" v-else>

                    <button type="submit" @click="loginUser">Connexion</button>
                </form>                
            </div>

        </div>

        <div v-else>
            <div>Vous êtes connectés ! Mais on a pas fait la suite :(</div>
            <button @click="LogOut()">oui le pain bonjour</button>
        </div>

        <div :class="[{displayPop : isError}, {displayPop : mailSent}]" class="overlay">
            <div class="popup">
                <h2 v-if="isError">Erreur</h2>
                <h2 v-else>Nouveau mot de passe</h2>
                <br>
                <p>{{ popup }}</p>
                <button v-on:click="closePopup" class="cross">
                    X
                </button>
            </div>
        </div>

    </div>
</template>

<script>
module.exports = {
    data () {
        return {
            numCarteElec: '',
            codePostal: '',
            emailRegister: '',
            emailLogin: '',
            password: '',
            popup: '',
            isError: false,
            mailSent: false,
            isUserConnected: false,
            typeMdp: 'password',
            hidden: true,
        }
    },
    created: async function () {
        const result = await axios.get('/api/user/me')
        this.isUserConnected = result.data.user
    },
    methods: {
        async getPassword() {
            this.popup = ''
            if (this.email !== '' && this.numCarteElec !== '' && this.codePostal !== '') {
                const user = {
                    numCarteElec: this.numCarteElec,
                    codePostal: this.codePostal,
                    email: this.emailRegister,
                }

                const result = await axios.post('/api/user/register', user)
                this.popup = result.data.popup
                if (this.popup === "Un mot de passe vous a été envoyé sur votre adresse mail. Veuillez le saisir pour vous connecter !") {
                    this.mailSent = true
                    this.emailRegister = ''
                    this.codePostal = ''
                    this.numCarteElec = ''
                }
                else if (this.popup !== undefined) {
                    this.isError = true
                }
            }
        },
        async loginUser() {
            this.popup = ''
            if (this.email !== '' && this.password !== '') {
                const user = {
                    email: this.emailLogin,
                    password: this.password,
                }

                const result = await axios.post('/api/user/login', user)
                this.popup = result.data.popup
                console.log(this.popup)
                this.isUserConnected = result.data.connected
                
                if (!(this.popup === undefined)) {
                    this.isError = true
                }
            }
        },
        closePopup() {
            this.isError = false
            this.mailSent = false
        },
        async LogOut(){
            const user = {
                email: this.email,
                password: this.password,
            }
            const result = await axios.post('/api/user/logout', user)

            this.emailLogin = result.data.email 
            this.password = result.data.password
            this.isUserConnected = result.data.connected
        },
        showMDP() {
            if (this.typeMdp === 'text') {
                this.typeMdp = 'password'
                this.hidden = true
            }
            else {
                this.typeMdp = 'text'
                this.hidden = false
            }
        }
  }
}


</script>



<style scoped>

.container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-content: center;
    padding-top: 50px;
    padding-bottom: 50px;
    background-color: #f8f9fd;
}

.limiter {
  width: 100%;
  margin: 0 auto;
  background-color: #f8f9fd;
}

.overlay {
    text-align: center;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,0.7);
    transition: opacity .4s;
    visibility: hidden;
    opacity: 0;
}

.displayPop {
    visibility: visible;
    opacity: 1;
}

.popup {
    margin: 6rem auto;
    padding: 2rem;
    background: #fff;
    border-radius: 5px;
    width: 35%;
    position: relative;
    transition: all .4s ease-in-out;
}

.cross {
    color: black;
    position: absolute;
    top: 2px;
    bottom: 0;
    right: 2px;
    width: 10px;
    background: #fff;
    border: 0px;
    font-weight: bold;
    font-size: 120%;
}

.cross:hover {
    color: #001D6E;
}

h2 {
    color: #001D6E;
    font-family: Poppins-Bold;
    font-size: 30px;
}

.showMDP {
    margin-bottom: 10px;
    width: 75px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all .4s;  
    border: none;  
    text-decoration: none;
    border-radius: 50%;
}

.showMDP:hover {
    cursor: pointer;
    background-color: rgba(245, 245, 245, 0.5);
}

</style>


