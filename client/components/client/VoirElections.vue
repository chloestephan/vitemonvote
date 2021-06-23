<template>
    <ul v-if="elections.length">
        <li :key="election.id" v-for="election in elections" class="election">
            <h3>{{ election.nom }}</h3>
            <br>
            <div> <strong>Type d'élection : </strong> {{ election.type }}</div>
            <div> <strong>Date du vote : </strong> {{ election.jour }} / {{ election.mois }} / {{ election.année }}</div>
            <div> <strong>Tour : </strong> {{ election.tour }}</div>
        </li>
    </ul>
    <h2 v-else class="noElection">Aucune élection disponible !</h2>
</template>

<script>

module.exports = {
    data () {
        return {
            elections: [{}],
        }
    },
    mounted: async function() {
        
        const result = await axios.get('/api/user/voirelections')
        this.elections.pop()

        for (var i = 0; i < result.data.elections.length; i++) {
            var date = result.data.elections[i].date.substring(0,10).split('-')
            
            this.elections.push({
                id: result.data.elections[i].id_election,
                nom: result.data.elections[i].nom,
                année: date[0],
                mois: date[1],
                jour: date[2],
                tour: result.data.elections[i].tour,
                type: result.data.elections[i].type_election,
            })
        }     
    },
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

.election:hover {
    
}

ul {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    list-style-type: none;
}

.election:hover {
    scale: 1.05;
    cursor: pointer;
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


