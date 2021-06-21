<template>
  <div class="site-container">
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
      let reader = new FileReader()
      let file = document.getElementById('electeurs').files[0]
      let fileText
      reader.onload = function () {
        fileText = reader.result;
      };
      reader.readAsText(file);
      console.log(fileText)
      fileText = fileText.split("\n")
      for (let i = 0; i < fileText.length; i++) {
        fileText[i] = fileText[i].split(";")
      }
      console.log(fileText)
    }
  }
}

</script>

<style scoped>
</style>