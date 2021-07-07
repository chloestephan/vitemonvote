<template>
  <div class="site-container">
    <div class="limiter">
      <h2>Nouvelle election</h2>
      <hr>

      <div>
        <!-- Menu déroulant pour choisir le type d'élection -->
        <label for="type-election"><h3>Choisir le type d'élection :</h3></label>
        <select name="typeElection" id="type-election" class="box" v-model="typeElection">
          <option value="">Choisir une option</option>
          <option value="Municipales">Municipales</option>
          <option value="Regionales">Regionales</option>
          <!--
          <option value="Departementales">Départementales</option>
          <option value="Legislatives">Legislatives</option>
          -->
          <option value="Presidentielle">Presidentielle</option>
          <option value="Europeennes">Européennes</option>
          <option value="Referundum">Referendum</option>
        </select>

        <div v-if="typeElection!==''">
          <div v-if="typeElection!=='Referundum'"> <!-- Création d'un réferendum -->
            <input type="text" v-model="nom" placeholder="Nom de l'élection" required>

            <label for="start"><h3>Date et lieu du premier tour :</h3></label>
          </div>
          <div v-else> <!-- Autres -->
            <input type="text" v-model="nom" placeholder="Question du referundum" required>

            <label for="start"><h3>Date du referundum :</h3></label>
          </div>
          <input type="date" id="start" name="premierTourDate" v-model="date">

          <input v-if="typeElection==='Municipales'" type="text" v-model="codePostaux[0]" placeholder="Code postal" required>

          <div v-if="typeElection==='Regionales'"> <!-- Choix de la région si élection régionale -->
            <label for="nom-region"><h3>Choisir la région :</h3></label>
            <select name="nomRegion" id="nom-region" class="box" v-model="nomRegion">
              <option value="">Choisir une option</option>
              <option value="Bretagne">Bretagne</option>
              <option value="Ile-de-France">Ile-de-France</option>
              <option value="Normandie">Normandie</option>
              <option value="Hauts-de-France">Hauts-de-France</option>
              <option value="Grand Est">Grand Est</option>
              <option value="Pays de la Loire">Pays de la Loire</option>
              <option value="Centre-Val de Loire">Centre-Val de Loire</option>
              <option value="Bourgogne-Franche-Comté">Bourgogne-Franche-Comté</option>
              <option value="Nouvelle-Aquitaine">Nouvelle-Aquitaine</option>
              <option value="Auvergne-Rhône-Alpes">Auvergne-Rhône-Alpes</option>
              <option value="Occitanie">Occitanie</option>
              <option value="Provence-Alpes-Côte d'Azur">Provence-Alpes-Côte d'Azur</option>
              <option value="Corse">Corse</option>
              <option value="La Réunion">La Réunion</option>
              <option value="Mayotte">Mayotte</option>
              <option value="Guyane">Guyane</option>
              <option value="Martinique">Martinique</option>
              <option value="Guadeloupe">Guadeloupe</option>
            </select>
          </div>

          


          <div v-if="typeElection!=='Referundum'"> <!-- Form pour les autres élections --> 
            <div v-for="(liste, index1) in candidats" :key="index1" class="">
              <h2>Nouvelle liste</h2>
              <hr>

              <input type="text" class="nom-liste" v-model="nomListes[index1]" placeholder="Nom de la liste" required>

              <div v-for="(candidat, index2) in candidats[index1]" :key=index2>
                <div class="ligne">
                  <input class="nouveauCandidat" type="text" v-model="candidats[index1][index2]" :placeholder="'Candidat'" required>
                  <p v-if="candidats[index1].length > 1" @click="deleteCandidat(index1, index2)" class="supprimer">❌</p>
                </div>
              </div>

              <button v-if="typeElection!=='Presidentielle'" type="button" @click="ajouterCandidat(index1)">➕ Ajouter un candidat</button>
              <button v-if="candidats.length > 1" type="button" @click="supprimerListe">❌ Supprimer la liste</button>
            </div>
            <button type="button" @click="ajouterListe">➕ Ajouter une liste</button>
            <hr>
          </div>
          
          <button type="button" @click="creerEletion">Valider</button>
        </div>
      </div>

        <div :class="[{displayPop : isGenerated}]" class="overlay">
            <div class="popup">
                <h2> {{ popupTitle }} </h2>
                <br>
                <p>{{ popup }}</p>
                <button @click="closePopup" class="cross">
                    X
                </button>
            </div>
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
      nomRegion: '',
      codePostaux: [''],
      nomListes: [''],
      candidats: [],
      numDepartement: null,
      isGenerated: false,
      popup: '',
      popupTitle: ''
    }
  },

  computed: {
    election: function() {
      return {
        nom: this.nom,
        date: this.date,
        tour: 1,
        nomListes: this.nomListes,
        candidats: this.candidats,
        typeElection: this.typeElection,
        code_postaux: this.codePostaux,
        region: this.nomRegion,
        currentDate: ''
      }
    }
  },

  created: function(){
    this.candidats.push([''])

    const time = Date.now()
    const today = new Date(time)
    const date = today.getDate()
    const month = today.getMonth() + 1
    const year = today.getFullYear()
    this.currentDate = year + '-' + month + '-' + date
  },

  methods:{
    deleteCandidat(index1, index2){ // Suppresion d'un candidat pendant le remplissage du form
      this.candidats[index1].splice(index2, 1)
    },
    ajouterCandidat(index){ // Bouton pour ajouter un candidat à une liste
      this.candidats[index].push('')
    },
    supprimerListe(index){ // Suppresion d'une liste pendant le remplissage du form
      this.candidats.splice(index, 1)
      this.nomListes.splice(index, 1)
    },
    ajouterListe(){ // Bouton pour ajouter une nouvelle liste
      this.candidats.push([''])
    },
    ajouterCode(){ // Ajout d'un code postal
      this.codePostaux.push('')
    },
    isDone(){ // Fonction vérifiant si le formulaire est correctement rempli
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
    async creerEletion(){ // L'élection est génerée

      if (this.isDone()){

        // Récuperation de la date

        const splitDateElection = this.date.split('-')
        const splitCurrentDate = this.currentDate.split('-')

        const electionDate = parseInt(splitDateElection[2])
        const electionMonth = parseInt(splitDateElection[1])
        const electionYear = parseInt(splitDateElection[0])

        const currentDate = parseInt(splitCurrentDate[2])
        const currentMonth = parseInt(splitCurrentDate[1])
        const currentYear = parseInt(splitCurrentDate[0])

        let isError = false

        if (currentYear < electionYear || 
        (currentYear === electionYear && currentMonth < electionMonth) ||
        (currentYear === electionYear && currentMonth === electionMonth && currentDate <= electionDate)) {
          isError = false
        }
        else {
          isError = true
        }

        if (!isError) { // Pop-up lorsque l'on appuie sur le bouton pour créer l'élection
          this.isGenerated = true
          this.popupTitle = "En cours..."
          this.popup = "L'élection est en cours de création..."
          const result = await axios.post('/api/admin/election', this.election)
          this.popup = result.data.message
          
          if (this.popup === "L'élection a bien été créée !") { 
            this.popupTitle = "Confirmation"
          }
          else {
            this.popupTitle = "Erreur"
          }
        }
        else {
          this.isGenerated = true
          this.popup = "La date choisie n'est pas valide !"
          this.popupTitle = "Erreur"
        }
      }
    },
    closePopup() {
      this.isGenerated = false
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
  margin-bottom: 20px;
}

button {
  width: 30%;
  margin: 20px;
  margin-left: 35%;
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

.supprimer {
  margin-top: 15px;
}

.supprimer:hover {
  cursor: pointer;
}

</style>