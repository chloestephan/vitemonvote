<template>
  <div class="site-container">
    <h2>Nouvelle election</h2>
    <hr>

    <div>
      <input type="text" v-model="nom" placeholder="Nom de l'élection" required>

      <label for="type-election"><h3>Choisir le type d'élection :</h3></label>
      <select name="typeElection" id="type-election" class="box" v-model="typeElection">
        <option value="">--Choisir une option--</option>
        <option value="Municipales">Municipales</option>
        <option value="Cantonales">Département</option>
        <option value="Regionales">Regionales</option>
        <option value="Legislatives">Legislatives</option>
        <option value="Presidentielle">Presidentielle</option>
        <option value="Europeenes">Européennes</option>
        <option value="Referundum">Referundum</option>
      </select>

      <label for="start"><h3>Date du premier tour :</h3></label>
      <input type="date" id="start" name="premierTourDate" v-model="date">

      <div v-if="typeElection==='Presidentielle'">
        <div v-for="(liste, index1) in candidats" :key="index1" class="">
          <h2>Nouvelle liste</h2>
          <hr>

          <input type="text" class="nom-liste" v-model="nomListes[index1]" placeholder="Nom de la liste" required>

          <div v-for="(candidat, index2) in candidats[index1]" :key=index2 class="">
            <div class="ligne">
              <input class="nouveauCandidat" type="text"  class="" v-model="candidats[index1][index2]" :placeholder="'Candidat ' + index2" required>
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

    isDone(){
      if (this.nom != ''){
        if (this.date != null){
          if (this.typeElection != ''){
            for (let nomListe in this.nomListes){
              if (nomListe == ''){
                return false
              }
            }
            for (let candidatsListe in this.candidats){
              for (let candidat in candidatsListe){
                if (candidat == ''){
                  return false
                }
              }
            }
            return true
          }
        }
      }
      return false
    },

    async creerEletionPresidentielle(){
      if (this.isDone() === true){
        const election = {
          nom: this.nom,
          date: this.date,
          tour: 1,
          nomListes: this.nomListes,
          candidats: this.candidats,
        }

        const result = await axios.post('/api/admin/election', election)
        alert(result.data.message)
      }
    },
  },

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
  font-size: 24px;
  margin-top: 7px;
  text-align: center;
  color: grey;
}

.delete:hover{
    cursor: pointer;
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

h3 {
  font-family: 'open sans', 'HelveticaNeue', 'Helvetica Neue', 'Helvetica-Neue', Helvetica, Arial, sans-serif;
  font-size: 20px;
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
  margin-top: 20px;
  margin-bottom: 30px;
  margin-left: 40%;
  width: 20%;
}

ul {
    margin-left: 20px;
}

input {
  width: 40%;
  margin-left: 30%;
  border-radius: 8px;
}

::placeholder {
  color:#001D6E;
}

.box {
  width: 20%;
  height: 50px;
  margin-left: 40%;
  border: 1px solid #666;
  font-size: 18px;
  color: #001D6E;
  background-color: #e6e6e6;
  border-radius: 8px;
}

button {
  width: 20%;
  margin: 20px;
}

.ligne {
    width:100%;
    display: flex;
}

.nouveauCandidat {
  display:flex;
}

.delete {
  display:flex;
}

</style>