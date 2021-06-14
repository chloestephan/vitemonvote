<template>
  <div class="site-container">
    <div v-if="!isUserConnected">
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
        <a><router-link to="'/admin/elections">Elections</router-link></a>
        <a><router-link to='/admin/resultats'>Résultats</router-link></a>
        <a><router-link to='/admin/admins'>Gérer les admins</router-link></a>
      </nav>
      <router-view></router-view>
    </div>
  </div>
</template>


<script>
module.exports = {
  data () {
    return {
      elections: null,
    }
  },

  created: async function () {
    const result = await axios.get('/api/admin/elections')
    this.elections = result.data.admin
  },

  methods: {
  }
}
</script>

<style scoped>
</style>
