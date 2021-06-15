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
                <form @submit.prevent="loginUser">
                    <h3>Se connecter</h3>
                    <input type="text" v-model="emailLogin" placeholder="Email" required>
                    <input type="password" v-model="password" placeholder="Mot de passe" required>

                    <button type="submit">Connexion</button>
                </form>
            </div>

        </div>

        <div v-else>
            <div>Vous êtes connectés ! Mais on a pas fait la suite :(</div>
        </div>

        <div :class="{displayPop : isError}" class="overlay">
            <div class="popup">
                <h2>Erreur</h2>
                <p>{{ popup }}</p>
                <button v-on:click="closePopup" class="cross">&times;</button>
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
            isUserConnected: false,
    }
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
              console.log(this.popup)

              if (!(this.popup === undefined)) {
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
      }
  }
}
</script>

<style scoped>

.container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    padding-top: 50px;
    padding-bottom: 50px;
    background-color: #f8f9fd;

}

.getPassword, .login {
    margin-bottom: 30px;
}

.login {
    margin-top: 30px;
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
    opacity: 3;
}

.popup {
    margin: 6rem auto;
    padding: 2rem;
    background: #fff;
    border-radius: 5px;
    width: 45%;
    position: relative;
    transition: all 0.4s ease-in-out;
}



</style>


