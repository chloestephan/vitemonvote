<template>
  <div class="site-container">
    <div class="limiter">
      <h2>Veuillez sélectionner une élection</h2>
      <hr>
      <div class="container">
        <div>
          <ul>
            <li :key="election.id_election" v-for="election in elections" class="election">
              <router-link :to="chemin(election)">
                <div>
                  <h3>{{ election.nom }}</h3>
                  <br>
                  <div> <strong>Type d'élection : </strong> {{ election.type_election }}</div>
                  <div> <strong>Date du vote : </strong> {{ election.date }}</div>
                  <div> <strong>Tour : </strong> {{ election.tour }}</div>
                </div>
              </router-link>
            </li>
          </ul>
        </div>
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
  height:2px;
  border-width:0;
  color:#D60920;
  background-color:#D60920;
  margin-top: 40px;
  margin-bottom: 30px;
  margin-left: 40%;
  width: 20%;
}

.election {
  background: #FFF;
  width: 600px;
  height: 200px;
  margin: 40px;
  padding: 20px;
  border-radius: 2%;
  transition: 0.4s;
  border-radius: 10px;
  -moz-box-shadow: 0px 1px 5px 0px #656565;
  -webkit-box-shadow: 0px 1px 5px 0px #656565;
  -o-box-shadow: 0px 1px 5px 0px #656565;
  box-shadow: 0px 1px 5px 0px #656565;
  color:#001D6E;
  text-decoration: none;
}

ul {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    list-style-type: none;
}

.election:hover {
    transform: scale(1.1);
    transition: 0.7s;
}

.election div {
    padding-top: 10px;
    padding-bottom: 10px;
}

h3 {
  font-family: 'open sans', 'HelveticaNeue', 'Helvetica Neue', 'Helvetica-Neue', Helvetica, Arial, sans-serif;
  font-size: 20px;
  text-align: center;
  text-transform: uppercase;
  color: #001D6E;
}

a:link { text-decoration: none; color: #001D6E;}


a:visited { text-decoration: none; color: #001D6E;}


a:hover { text-decoration: none; color: #001D6E;}


a:active { text-decoration: none; color: #001D6E; }


</style>
