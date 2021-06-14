<template>
  <div class="site-container">
    <div v-for="election in elections" :key="election.id" class="election">
      <router-link :to="chemin(maraude)">
        <h3>{{election.nom}}</h3>
      </router-link>
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
    this.elections = result.data
  },

  methods: {
    chemin(election){
      return "/admin/election/" + election.id
    }
  }
}
</script>

<style scoped>
</style>
