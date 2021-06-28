<template>
  <div class="site-container">
    <div class="limiter">

        <div v-if="!isUserConnected" class="container">
          <form @submit.prevent="loginUser">
            <h3>Connexion</h3>

              <input type="text" v-model="email" placeholder="Email" required>
              <div class="ligne">
                <input v-bind:type="typeMdp" v-model="password" placeholder="Mot de passe" required>
                <img src="img/hide_password.png" class="showMDP" @click="showMDP" v-if="hidden">
                <img src="img/show_password.png" class="showMDP" @click="showMDP" v-else>
              </div>

              <button type="submit" @click="loginUser">Connexion</button>
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

            <div :class="[{displayPop : isError}]" class="overlay">
                <div class="popup">
                    <h2 v-if="isError">Erreur</h2>
                    <br>
                    <p>{{ popup }}</p>
                    <button v-on:click="closePopup" class="cross">
                        X
                    </button>
                </div>
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
            popup: '',
            isError: false,
            typeMdp: 'password',
            hidden: true,
        }
    },

    created: async function () {
        const result = await axios.get('/api/admin/me')
        this.isUserConnected = result.data.admin
        console.log(result.data.admin)
    },
    
    beforeMount() {
      window.addEventListener("beforeunload", this.preventNav())
    },
      
    

    methods: {
        async loginUser(){
            if(this.email !== '' && this.password !== ''){
                const user = {
                    email: this.email,
                    password: this.password,
                }

                const result = await axios.post('/api/admin/login', user)
                this.popup = result.data.popup
                this.isUserConnected = result.data.connected

                if (!(this.popup === undefined)) {
                  this.isError = true
                }
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
        },
        showMDP() {
            this.typeMdp = this.hidden ? "text" : "password"
            this.hidden = !this.hidden
        },
        closePopup() {
            this.isError = false
        },
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

/* CSS POPUP */

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
    transition: all 0s ease-in-out;
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

/* CSS FORM */

.ligne {
    width:100%;
    display: flex;
}

.showMDP {
    height: 30px;
    width: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all .4s;
    border: none;
    text-decoration: none;
    margin: 10px;
}

.showMDP:hover {
    cursor: pointer;
}

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
