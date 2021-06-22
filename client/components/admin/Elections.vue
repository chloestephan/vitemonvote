<template>
  <div>
    <div class="site-container">
      <h2>Veuillez sélectionner une élection.</h2>
      <hr>
    </div>
    <div class="site-container">
      <div v-for="election in elections" :key="election.id_election" class="election">
        <router-link :to="chemin(election)">
          <h3>{{election.nom}}</h3>
        </router-link>
      </div>
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
    console.log(this.elections)
    let test = [5, 6, 7, 8]
    let data = test.join()
    console.log(data)
  },

  methods: {
    chemin(election){
      return "/admin/election/" + election.id_election
    }
  }
}
</script>

<style scoped>
h2 {
  font-family: 'open sans', 'HelveticaNeue', 'Helvetica Neue', 'Helvetica-Neue', Helvetica, Arial, sans-serif;
  font-size: 28px;
  line-height: 1.1em;
  margin-bottom: 10px;
  display: block;
  font-size: 1.5em;
  margin-block-start: 0.83em;
  margin-block-end: 0.83em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  text-align: center;
  text-transform: uppercase;
  color: #001D6E;
}

hr {
  display: block;
  border: 0;
  border-radius: 3em;
  border-top: 2px solid #D60920;
  margin-top: 10px;
  margin-bottom: 10px;
  width: 10%;
  margin: auto;
}
</style>
