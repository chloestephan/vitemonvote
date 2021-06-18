<template>
  <div class="site-container">
    <div v-if="!isUserConnected" class="vertical-center">
      <form @submit.prevent="loginUser">
        <h3>Connexion</h3>
        <input type="text" v-model="email" placeholder="Email" required>
        <input type="password" v-model="password" placeholder="Mot de passe" required>

        <button type="submit">Connexion</button>
      </form>
    </div>
    <div v-else>
      <nav class="navbar-admin">
        <a><router-link to='/admin/nouvelleelection'>Nouvelle élection</router-link></a>
        <a><router-link to='/admin/elections'>Elections</router-link></a>
        <a><router-link to='/admin/resultats'>Résultats</router-link></a>
        <a><router-link to='/admin/admins'>Gérer les admins</router-link></a>
      </nav>
      <router-view></router-view>
      <button id="deconnexionBouton" @click="LogOut()">Se déconnecter</button>
    </div>
  </div>
</template>


<script>
module.exports = {
    data () {
        return {
            email: '',
            password: '',
            isUserConnected: false,
        }
    },

    created: async function () {
        const result = await axios.get('/api/admin/me')
        this.isUserConnected = result.data.admin
        console.log(result.data.admin)
    },

    methods: {
        async loginUser(){
            if(this.email !== '' && this.password !== ''){
                const user = {
                    email: this.email,
                    password: this.password,
                }

                const result = await axios.post('/api/admin/login', user)

                this.isUserConnected = result.data.connected
            }
        },
        async LogOut(){
            const user = {
                email: this.email,
                password: this.password,
            }
            const result = await axios.post('/api/admin/logout', user)

            this.email = result.data.email 
            this.password = result.data.password

            this.isUserConnected = result.data.connected

        }
    }
}
</script>

<style scoped>

.navbar-admin {
    background-color: #001D6E;
    margin-bottom: 50px;
    width: 100%;
    height: 50px;
    bottom: 0;
    text-align: center;
    overflow: hidden;
    position: fixed;
    position: sticky;
    padding-top: 10px;
}

a {
    color:lightgrey;
    margin: 10px;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 14px;
    font-weight: bold;
    text-decoration: none;
}

a:hover {
    color: #fff;
}
</style>
