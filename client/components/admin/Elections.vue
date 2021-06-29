<template>

    <div>
        <!--  AFFICHAGE SELON SI UNE ELECTION EST SELECTIONNEE OU NON  -->
        <div v-if="!electionInDetail">
            <h2>Cliquez sur une élection pour voir les détails de celle-ci</h2>
            <br>
            <div class="tile_div">
                <img class="loop" src="img/retour_arriere.png" @click="noSort()">
                <a class="button" @click="sortByVote()">Trier par vote</a>
                <a class="button" @click="sortByResult()">Trier par résultats</a>
                <a class="input" id="last"><input type="text" v-model="research" placeholder="Par exemple : Paris, Marseille..." required></a>
                <img class="loop" src="img/loupe.png" @click="sortBySearch()">
                <div class="clear"></div>
            </div>
            <hr>
        </div>

        <button v-else @click="showAll" class="return">Annuler la recherche</button>

        <!--  AFFICHAGE SI DES ELECTIONS SONT DISPO  -->

        <ul v-if="elections.length && !electionInDetail" class="election_container">
            <li :key="election.id" v-for="election in elections" class="election" @click="detailElection(election.id)">
                <h2>{{ election.nom }}</h2>
                <br>
                <div> <strong>Type d'élection : </strong> {{ election.type }}</div>
                <div> <strong>Date du vote : </strong> {{ election.jour }} / {{ election.mois }} / {{ election.année }}</div>
                <div> <strong>Tour : </strong> {{ election.tour }}</div>
                <div v-if="election.resultats_visibles"><strong>RESULTATS DISPONIBLES</strong></div>
                <div v-else class="dernier"><strong>VOTE DISPONIBLES</strong></div>
            </li>
        </ul>

        <!--  AFFICHAGE SI UNE ELECTION EST SELECTIONNEE  -->

        <div v-else-if="electionInDetail">
            <br><br>
            <h2>{{ elections[0].nom }}</h2>
            <hr>
            <div class="details">
                <div class="intro">
                    <div class="presentation"> <strong class="titre">Type d'élection : </strong> {{ elections[0].type }} </div>
                    <div class="presentation"> <strong class="titre">Date du vote : </strong> {{ elections[0].jour }} / {{ elections[0].mois }} / {{ elections[0].année }} </div>
                    <div class="presentation"> <strong class="titre">Tour : </strong> {{ elections[0].tour }} </div>
                    <div v-if="elections[0].resultats_visibles" class="presentation"> <strong class="titre">Nombre de votants : </strong> {{ totalVote }} </div>
                    <br>
                </div>

                <!--  AFFICHAGE QUI CHANGE POUR MONTRER LES RESULT OU POUR VOTER  -->

                <div>
                    <ul class="liste_container">
                        <li :key="liste.id_liste" v-for="liste in elections[0].listes" class="liste">

                            <div v-if="elections[0].type === 'Referundum'">
                                <div> <strong>Réponse : </strong> {{ liste.nom_liste }}</div>
                            </div>

                          <div v-else>
                                <div> <strong>Nom de la liste : </strong> {{ liste.nom_liste }}</div>
                                <div v-if="elections[0].resultats_visibles"> <strong>Taux de vote : </strong> {{ liste.pourcentage }} %</div>
                                <div v-if="elections[0].type === 'Presidentielle'"> <strong>Candidat : </strong> </div>
                                <div v-else> <strong>Candidats : </strong> </div>
                                <ul class="liste_candidats">
                                    <li :key="candidat.id" v-for="candidat in liste.candidats" class="candidat">
                                        <div> {{ candidat.nom_complet }} </div>
                                    </li>
                                </ul>
                            </div>

                        </li>
                    </ul>
                </div>
                <hr>
                <button class="btnAction" @click="openVote(elections[0])">Ouvrir les votes</button>
                <button class="btnAction" @click="closeVote(elections[0])">Fermer les votes</button>
                <button class="btnAction" @click="showResult(elections[0])">Afficher les résultats</button>
                <button class="btnAction" @click="hideResult(elections[0])">Cacher les résultats</button>
                <button class="btnAction" @click="popupConfirmation(elections[0])">Supprimer l'élection</button>
                
                <button class="btnAction" v-if="elections[0].type !== 'Referundum' && elections[0].tour !== 2 && elections[0].resultats_visibles" @click="generation = !generation">Génération du prochain tour</button>
                <div v-if="generation && elections[0].resultats_visibles">
                    <form @submit.prevent="generateNewElection(elections[0])">
                        <input type="text" placeholder="Nom de l'éléction" required v-model="newElectionName">
                        <label for="start"><h3>Date du prochain tour :</h3></label>
                        <input type="date" id="start" name="premierTourDate" required v-model="newElectionDate">
                        <button type="submit">Générer</button>
                    </form>
                </div>
            </div>
        </div>
        
        <!--  AFFICHAGE SI AUCUNE ELECTION DISPO  -->

        <h2 v-else class="noElection">Aucun résultat disponible !</h2>

        <!-- POPUP -->

        <div :class="[{displayPop : wantsToDelete}]" class="overlay">
            <div class="popup">
                <h2>ATTENTION</h2>
                <br>
                <p>Êtes-vous sur de vouloir supprimer cette élection ?</p>
                <button @click="confirmation()" class="buttonPop">Confirmer</button>
                <button @click="closePopup()" class="buttonPop">Annuler</button>
            </div>
        </div>

        <div :class="[{displayPop : isError}, {displayPop : isNoError}]" class="overlay">
            <div class="popup">
                <h2 v-if="isError">Erreur</h2>
                <h2 v-else>Confirmation</h2>
                <br>
                <p>{{ popup }}</p>
                <button @click="closePopup" class="cross">
                    X
                </button>
            </div>
        </div>

    </div>

</template>

<script>

module.exports = {
    data () {
        return {
            elections: [{}],
            listes: [{}],
            candidats: [{}],
            totalVote: -1,
            electionInDetail: false,
            sortedByVote: false,
            sortedByResult: false,
            noSorted: true,
            idSelected: -1,
            research: '',
            popup: '',
            isError: false,
            isNoError: false,
            generation: false,
            newElectionName: '',
            newElectionDate: '',
            wantsToDelete: false,
            confirmDelete: false,
            electionToDelete: -1
        }
    },
    mounted: async function() {
        
        const sort = {
            typeSort: "noSort"
        }

        const result = await axios.post('/api/admin/elections', sort)

        this.elections.pop()
        this.listes.pop()
        this.candidats.pop()

        this.fillElection(result.data.elections)
    },
    methods: {
        async detailElection(idElection) {
            const findId = (element) => element.id === idElection
            this.idSelected = this.elections.findIndex(findId)
            this.electionInDetail = true

            const information = {
                election: this.elections[this.idSelected]
            }

            const result = await axios.post('/api/admin/elections/detailElection', information)

            this.elections = [{}]
            this.listes = [{}]
            this.candidats = [{}]

            this.elections.pop()
            this.listes.pop()
            this.candidats.pop()

            this.fillDetailedElection(result.data.elections)
        },
        fillElection(elections) {
            for (var i = 0; i < elections.length; i++) {
                var date = elections[i].date.substring(0,10).split('-')
            
                this.elections.push({
                    id: elections[i].id_election,
                    nom: elections[i].nom,
                    année: date[0],
                    mois: date[1],
                    jour: date[2],
                    tour: elections[i].tour,
                    type: elections[i].type_election,
                    resultats_visibles: elections[i].resultats_visibles,
                })
            }

        },
        async fillDetailedElection(election) {
            for (var i = 0; i < election.length; i++) {
                var date = election[i].date.substring(0,10).split('-')
                
                if (election.type !== "Referundum") {
                    this.candidats.push({
                        nom_complet: election[i].nom_complet
                    })
                }

                if ( (i === election.length - 1) || ( election[i].id_liste !== election[i + 1].id_liste ) ) {
                    this.listes.push({
                        id_election: election[i].id_election,
                        id_liste: election[i].id_liste,
                        nom_liste: election[i].nom_liste,
                        nbr_votes: election[i].nbr_votes,
                        pourcentage: 0,
                        candidats: this.candidats
                    })
                    this.candidats = [{}]
                    this.candidats.pop()
                }

                if ( (i === election.length - 1) || (election[i].id_election !== election[i + 1].id_election) ) {
                    this.elections.push({
                        id: election[i].id_election,
                        nom: election[i].nom,
                        année: date[0],
                        mois: date[1],
                        jour: date[2],
                        tour: election[i].tour,
                        type: election[i].type_election,
                        resultats_visibles: election[i].resultats_visibles,
                        listes: this.listes
                    })
                    this.listes = [{}]
                    this.listes.pop()
                }
                for (let x = 0; x < this.elections.length; x++) {  // Cache les votes sur la console pour les élections où on n'a pas afficher les résultats
                    if (this.elections[x].resultats_visibles === false) {
                        for (let j = 0; j < this.elections[x].listes.length; j++) {
                            this.elections[x].listes[j].nbr_votes = 0
                        }
                    }
                }
            }
            if (this.elections[0].resultats_visibles) {
                const info = {
                    id: this.elections[0].id
                }

                const result = await axios.post('/api/admin/elections/nbrVotant', info)
                this.totalVote = result.data.totalVote

                for (let i = 0; i < this.elections[0].listes.length; i++) {  // On calcule le pourcentage de chaques listes et on fixe le nombre de décimal à 2
                    let pourcentage = this.elections[0].listes[i].nbr_votes / this.totalVote * 100
                    if (isNaN(pourcentage)) {
                        this.elections[0].listes[i].pourcentage = 0
                    }
                    else {
                        this.elections[0].listes[i].pourcentage = pourcentage.toFixed(2)
                    }
                }
            }
        },
        showAll() {
            this.idSelected = -1
            this.electionInDetail = false
            this.noSorted = false
            this.generation = false
            this.newElectionName = ''
            this.newElectionDate = ''
            this.noSort()
        },
        async sort (typeOfSort) {
            this.elections = [{}]
            this.listes = [{}]
            this.candidats = [{}]

            const sort = {
                typeSort: typeOfSort,
                searchName: this.research
            }

            const result = await axios.post('/api/admin/elections', sort)

            this.elections.pop()
            this.listes.pop()
            this.candidats.pop()

            this.fillElection(result.data.elections)
        },
        sortByVote() {
            if (!this.sortedByVote) {
                this.sort("sortByVote")
                this.sortedByVote = true
                this.sortedByResult = false
                this.sortedBySearch = false
                this.noSorted = false
            }
        },
        sortByResult() {
            if (!this.sortedByResult) {
                this.sort("sortByResult")
                this.sortedByVote = false
                this.sortedByResult = true
                this.sortedBySearch = false
                this.noSorted = false
            }
        },
        sortBySearch() {
            this.sort("sortBySearch")
            this.sortedByVote = false
            this.sortedByResult = false
            this.noSorted = false
        },
        noSort() {
            if (!this.noSorted) {
                this.sort("noSort")
                this.sortedByVote = false
                this.sortedByResult = false
                this.noSorted = true
            }
        },
        closePopup() {
            this.wantsToDelete = false
            this.isError = false
            this.isNoError = false
        },
        async openVote(election) {
          const information = {
            id_election: election.id,
          }
          const result = await axios.post('/api/admin/elections/openVote', information)
          this.displayPopup(result.data.popup)
        },
        async closeVote(election) {
          const information = {
            id_election: election.id,
          }
          const result = await axios.post('/api/admin/elections/closeVote', information)
          this.displayPopup(result.data.popup)
        },
        async showResult(election) {
          const information = {
            id_election: election.id,
          }
          const result = await axios.post('/api/admin/elections/showResult', information)
          this.displayPopup(result.data.popup)
        },
        async hideResult(election) {
          const information = {
            id_election: election.id,
          }
          const result = await axios.post('/api/admin/elections/hideResult', information)
          this.displayPopup(result.data.popup)
        },
        displayPopup(popup) {
            this.popup = popup
            if (this.popup !== "L'admin n'est pas connecté !") {
                this.isNoError = true
            }
            else {
                this.isError = true
            }
        },
        async generateNewElection(election) {

            const informationElection = {
                oldElection: election,
                newName: this.newElectionName,
                newDate: this.newElectionDate,
            }
            const result = await axios.post('api/admin/elections/generate', informationElection)  
             this.displayPopup(result.data.popup)
        },
        popupConfirmation(election) {
            this.wantsToDelete = true
        },
        confirmation() {
            this.confirmDelete = true
            this.wantsToDelete = false
            this.deleteElection()
        },
        async deleteElection() {
            if (this.confirmDelete) {
                const information = {
                    electionToDelete: this.elections[0]
                }
                
                const result = await axios.post('api/admin/elections/delete', information)
                this.displayPopup(result.data.popup)
                this.confirmDelete = false
            }
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
    height: 300px;
    margin: 40px;
    padding: 20px;
    border-radius: 2%;
    transition: 0.4s;
    border-radius: 10px;
    -moz-box-shadow: 0px 1px 5px 0px #656565;
    -webkit-box-shadow: 0px 1px 5px 0px #656565;
    -o-box-shadow: 0px 1px 5px 0px #656565;
    box-shadow: 0px 1px 5px 0px #656565;
}

.election:hover {
    transform: scale(1.1);
    transition: 0.7s;
}

ul {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    list-style-type: none;
}

.election:hover {
    scale: 1;
    cursor: pointer;
}

.election div {
    padding-top: 10px;
    padding-bottom: 10px;
}

.liste_container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    list-style-type: none;
}

.liste {
    background: rgb(209, 208, 207);
    padding:20px;
    font-size: 20px;
    background-color: #f8f9fd;
    border-radius: 25px;
    margin-bottom: 10px;
}

.liste_candidats {
    display: block;
}

.candidat {
    list-style-type: none;
}

.overlay {
    text-align: center;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,0.7);
    transition: opacity .4s;
    visibility: hidden;
    opacity: 0;
}

.dernier {margin-bottom:20px;}

.displayPop {
    visibility: visible;
    opacity: 1;
}

.popup {
    margin: 6rem auto;
    padding: 2rem;
    background: #fff;
    border-radius: 5px;
    width: 35%;
    position: relative;
    transition: all 0s ease-in-out;
}

.cross {
    color: black;
    position: absolute;
    top: 2px;
    bottom: 0;
    right: 2px;
    width: 10px;
    background: #fff;
    border: 0px;
    font-weight: bold;
    font-size: 120%;
    transition: 0s;
}

.cross:hover {
    color: #001D6E;
}

.tile_div {
    display: flex;
    justify-content: center;
}

.tile_div a {
    display: block;
    float: left;
    height: 50px;
    width: 20%;
    margin-right: 10px;
    margin-bottom: 10px;
    text-align: center;
    line-height: 50px;
    text-decoration: none;
}

.title_div a#last {
    margin-right: 0;
}

.clear {
    clear: both;
}

.button {
    font-family: 'open sans', 'HelveticaNeue', 'Helvetica Neue', 'Helvetica-Neue', Helvetica, Arial, sans-serif;
    letter-spacing: 3px;
    font-size: 15px;
    line-height: 1.5;
    color: #fff;
    text-transform: uppercase;
    width: 100%;
    height: 50px;
    border-radius: 25px;
    background: #001D6E;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 25px;
    transition: all 0s;
    border: none;
    text-decoration: none;
}

.button:hover {
    background: #fff;
    text-decoration: none;
    color: #D60920;
    border: solid;
    border-width: 2px;
    border-color: #D60920;
    cursor: pointer;
}

.buttonPop {
    margin-top:15px;
}

.btnAction {
    width: 40%;
    margin-left: 30%;
    margin-right: 30%;
    margin-top: 20px;
}

.input {
    width: 40%;
}

.loop {
    max-height: 40px;
    margin-left: 0px;
    margin-right: 10px;
    margin-top: 5px;
    margin-bottom: 5px;
}

.loop:hover {
    cursor: pointer;
}

.return {
    width: 30%;
    display: flex;
    margin:0 auto;
}

.presentation {
    font-size: 20px;
    margin-bottom: 20px;
}

#separation {
    font-size: 20px;
    margin-left: 10px;
    margin-right: 10px;
    color:#D60920;
}

.details {
    padding : 50px;
    margin-left: 100px;
    margin-right: 100px;
    margin-bottom: 50px;
    background-color: #fff;
    -moz-box-shadow: 0px 1px 5px 0px #656565;
    -webkit-box-shadow: 0px 1px 5px 0px #656565;
    -o-box-shadow: 0px 1px 5px 0px #656565;
    box-shadow: 0px 1px 5px 0px #656565;
}

.titre {
    text-transform: uppercase;
    margin-right: 10px;
}


.voter {
    margin-top:20px;
    margin-bottom:20px;
}

.intro {
    text-align:center;
}
</style>


