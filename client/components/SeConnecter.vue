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
            <div>ZEBI ZEBI ZEBI ZEBI</div>
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
            isUserConnected: false,
    }
  },
  methods: {
      async getPassword() {
          if (this.email !== '') {
              const user = {
                  numCarteElec: this.numCarteElec,
                  codePostal: this.codePostal,
                  email: this.emailRegister,
              }

              const result = await axios.post('/api/user/register', user)
          }
      },
      async loginUser() {
          if (this.email !== '' && this.password !== '') {
                const user = {
                    email: this.emailLogin,
                    password: this.password,
                }

                const result = await axios.post('/api/user/login', user)
                this.isUserConnected = result.data.connected
          }
      }
  }
}
</script>

<style scoped>

.container {
    /*display: flex;
    justify-content: space-around;*/
    padding-top: 50px;
    padding-bottom: 50px;
    background-color: #f8f9fd;

}

.getPassword, .login {
    margin-bottom: 30px;
}

.getPassword {
    margin-top: 30px;
}

.limiter {
  width: 100%;
  margin: 0 auto;
  background-color: #f8f9fd;
}

</style>