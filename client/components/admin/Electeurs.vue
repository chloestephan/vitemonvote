<template>
  <div>
    <h2>Electeurs</h2>
    <hr>

    <p>Recherche</p>
    <input type="text" v-model="num_carte_electeur" placeholder="Numéro de carte électeur">
    <input type="text" v-model="email" placeholder="Email">
    <input type="text" v-model="code_postal" placeholder="Code postal">
    <button type="button" @click="rechercher">Rechercher</button>

    <div v-for="electeur in electeurs" :key="electeur.num_carte_electeur">
      <p>{{electeur.num_carte_electeur}}</p>
      <p>{{electeur.email}}</p>
      <p>{{electeur.code_postal}}</p>
      <p class="cross" @click="deleteElecteur(electeur.num_carte_electeur)">✖️</p>
    </div>

    <label for="electeurs">Choisissez le fichier pour ajouter les électeurs:</label>
    <input type="file" id="electeurs" name="electeurs" accept=".csv">
    <button type="button" @click="ajouterUtilisateurs">Importer</button>
  </div>
</template>

<script>

module.exports = {
  data () {
    return {
      num_carte_electeur: '',
      email: '',
      code_postal: '',
      electeurs: [],
    }
  },

  methods: {
    async rechercher() {
      const recherche = {
        num_carte_electeur: this.num_carte_electeur,
        email: this.email,
        code_postal: this.code_postal,
      }

      const result = await axios.get('/api/admin/electeur', recherche)
      this.electeurs = result.data
    },

    async deleteElecteur(num_carte_electeur){
      await axios.delete('/api/admin/electeur/' + num_carte_electeur)
      await this.rechercher()
    },

    async ajouterUtilisateurs() {

      const file = document.getElementById('electeurs').files[0];
      let fileText = ''
      const reader = new FileReader();
      reader.onload = async function (progressEvent) {
        // Entire file
        //console.log(this.result);

        // By lines
        const lines = this.result.split('\n');
        fileText = this.result.split('\n')
        for (let line = 0; line < lines.length; line++) {
          //console.log(lines[line]);
          //console.log(fileText[line])
          fileText[line] = fileText[line].split(';')
        }
        console.log(fileText)

        function checkElecteurs(electeurs) {
          for (let i = 0; i < electeurs.length; i++){
            console.log({electeur: electeurs[i]})
            console.log({length: electeurs[i].length})
            if( electeurs[i].length !== 3){
              return false
            }
            console.log("first")
            for(let j = 0; j < electeurs[i]; j++){
              if( electeurs[i][j] == ''){
                return false
              }
            }
            console.log("second")
          }
          return true
        }

        if (checkElecteurs(fileText) === false) {
          alert("Erreur dans le fichier importé (données manquantes dans un utilisateur ou ligne vide)")
        }
        else{
          const electeurs = {
            electeurs: fileText
          }
          const result = await axios.post('/api/admin/electeurs', electeurs)
          alert(result.data.message)
        }

      };
      reader.readAsText(file);

    },
  }
}

</script>

<style scoped>
</style>