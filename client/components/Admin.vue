<template>
  <div class="site-container">
    <div class="limiter">
        <div v-if="!isUserConnected" class="container">
          <form @submit.prevent="loginUser">
            <h3>Connexion</h3>
            <input type="text" v-model="email" placeholder="Email" required>
            <input type="password" v-model="password" placeholder="Mot de passe" required>

            <button type="submit">Connexion</button>
          </form>
        </div>
        <div v-else>
            <nav class="navbar">
                <ul class="nav-links">
                    <li class="nav-item"><a><router-link to='/admin/nouvelleelection'>Nouvelle élection</router-link></a></li>
                    <li class="nav-item"><a><router-link to='/admin/elections'>Elections</router-link></a></li>
                    <li class="nav-item"><a><router-link to='/admin/resultats'>Résultats</router-link></a></li>
                  <li class="nav-item"><a><router-link to='/admin/electeurs'>Electeurs</router-link></a></li>
                    <li class="nav-item"><a><router-link to='/admin/admins'>Gérer les administrateurs</router-link></a></li>
                </ul>
                <a class="deconnexionBouton" @click="LogOut()">Se déconnecter</a>
            </nav>
          <router-view></router-view>
        </div>
      </div>
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
/*
nav {
  width: 100%;
  background-color: #001D6E;
  padding-left: 20px;
  padding-right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 50px;
  transition: 0.8s;
}


.nav-links {
  list-style: none;
  display: flex;
}

.nav-item {
  transition: 0.6s;
}

.nav-item a {
  display: inline-block;
  padding: 10px 15px;
  text-decoration: none;
  color: white;
  transition: 0.6s;
}

.nav-item:hover {
  background-color: white;
}

.nav-item:hover a {
  color: #001D6E;
}
*/
.deconnexionBouton {
  border-style:solid 2px #D60920;
  background-color: #fff;
  color: #D60920;
  border-radius: 4px;
  padding: 10px;
  transition: 0.4s;
  margin-top: 10px;
  margin-bottom: 10px;
}

.deconnexionBouton:hover {
  cursor: pointer;
  color:#fff;
  background-color: #D60920;
}


nav > div {
  font-size: 16px;
  max-height: 50px;
  padding: 10 15px;
}

nav {
  display: grid;
  justify-items: center;
  text-align: center;

  width: 100%;
  background-color: #001D6E;
  padding-left: 20px;
  padding-right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 50px;
  transition: 0.8s;
}

.nav-links {
  list-style: none;
  display: flex;
}

.nav-item {
  transition: 0.6s;
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 15px;
  padding-right: 15px;
}

.nav-item a {
  text-decoration: none;
  color: white;
  transition: 0.6s;
  text-decoration: none;
  height: 50px;
}

.nav-item:hover {
  background-color: white;
}

.nav-item:hover a {
  color: #001D6E;
}


@media (min-width: 30rem) {
  nav {
    grid-template-columns: 1fr auto auto;
    justify-items: start;
  }

  .nav-item {
    transition: 0.6s;
    padding-top: 20px;
    padding-bottom: 20px;
    padding-left: 0px;
    padding-right: 0px;
  }
}

</style>
