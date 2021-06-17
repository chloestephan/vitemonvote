<template>
  <div>
    <h2>Nouvelle election</h2>
    <hr>

    <div>
      <input type="text" v-model="nom" placeholder="Nom de l'élection" required>

      <label for="start">Premier tour:</label>
      <input type="date" id="start" name="premierTourDate" v-model="date">

      <label for="type-election">Choisir le type d'élection:</label>
      <select name="typeElection" id="type-election" v-model="typeElection">
        <option value="">--Choisir une option--</option>
        <option value="Municipales">Municipales</option>
        <option value="Cantonales">Département</option>
        <option value="Regionales">Regionales</option>
        <option value="Legislatives">Legislatives</option>
        <option value="Presidentielle">Presidentielle</option>
        <option value="Europeenes">Européennes</option>
        <option value="Referundum">Referundum</option>
      </select>
      
      <div v-if="typeElection==='Presidentielle'">
        <div v-for="(liste, index1) in candidats" :key="index1" class="">
          <h2>Nouvelle liste</h2>
          <hr>

          <input type="text" class="nom-liste" v-model="nomListes[index1]" placeholder="Nom de la liste" required>

          <div v-for="(candidat, index2) in candidats[index1]" :key=index2 class="">
            <div class="">
              <input type="text"  class="" v-model="candidats[index1][index2]" :placeholder="'Candidat ' + index2" required>
              <p class="delete" @click="deleteCandidat(index1, index2)">✖️</p>
            </div>
          </div>
          <button type="button" @click="ajouterCandidat(index1)">➕ Ajouter un candidat</button>

          <button type="button" @click="ajouterListe">➕ Ajouter une liste</button>
        </div>
        <button type="button" @click="creerEletionPresidentielle">Valider</button>
      </div>
    </div>
  </div>
</template>


<script>

module.exports = {
  data () {
    return {
      nom:'',
      date: null,
      tour: '',
      typeElection: '',
      nomListes: [''],
      candidats: []
    }
  },

  computed: {

  },

  created: function(){
    this.candidats.push([''])
  },

  methods:{
    deleteCandidat(index1, index2){
      this.candidats[index1].splice(index2, 1)
    },
    ajouterCandidat(index){
      this.candidats[index].push('')
    },

    async ajouterListe(){
      this.candidats.push([''])
    },

    async creerEletionPresidentielle(){
      const election = {
        nom: this.nom,
        date: this.date,
        tour: 1,
        nomListes: this.nomListes,
        candidats: this.candidats,
      }

      const result = await axios.post('/api/admin/election', election)
      alert(result.data.message)
    },
  }
}

</script>

<style scoped>
.user{
    background-color: rgb(248, 248, 248);
    border-radius: 10px;
    width: 480px;
    margin: auto;
    padding: 20px;
    margin-top: 20px;
    margin-bottom: 20px;
}

.user h3 {
    text-align: center;
}

.user p {
    margin-top: 5px;
    margin-bottom: 5px;
}

.user p span {
    text-decoration: underline;
}

.delete {
    text-align: center;
    color: grey;
}

.delete:hover{
    cursor: pointer;
    text-decoration: underline;
}

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

ul {
    margin-left: 20px;
}
</style>