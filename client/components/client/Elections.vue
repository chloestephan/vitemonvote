<template>

    <div>

        <!--  AFFICHAGE SELON SI UNE ELECTION EST SELECTIONNEE OU NON  -->

        <div v-if="!electionInDetail">
            <h2>Cliquez sur une élection pour voter</h2>
            <br>
            <div class="tile_div">
                <img class="loop" src="img/retour_arriere.png" @click="noSort()">
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
                <div> <strong>VOTE OUVERT</strong></div>
            </li>
        </ul>

        <!--  AFFICHAGE SI UNE ELECTION EST SELECTIONNEE  -->

        <div v-else-if="electionInDetail">
            <br><br>
            <h2>{{ elections[0].nom }}</h2>
            <hr>
            <div class="details">
                <div class="intro">
                    <div class="presentation"> <strong class="titre">Type d'élection : </strong> {{ elections[0].type }} </div><p id="separation">|</p>
                    <div class="presentation"> <strong class="titre">Date du vote : </strong> {{ elections[0].jour }} / {{ elections[0].mois }} / {{ elections[0].année }} </div><p id="separation">|</p>
                    <div class="presentation"> <strong class="titre">Tour : </strong> {{ elections[0].tour }} </div>
                    <br>
                </div>

                <!--  AFFICHAGE QUI CHANGE POUR MONTRER LES RESULT OU POUR VOTER  -->

                <div>
                    <ul class="liste_container">
                        <li :key="liste.id_liste" v-for="liste in elections[0].listes" class="liste">

                            <div v-if="elections[0].type === 'Referundum'">
                                <div> <strong>Réponse : </strong> {{ liste.nom_liste }}</div>
                                <button class="voter" @click="popupConfirmation(elections[0], liste)">VOTER</button>
                            </div>

                          <div v-else>
                                <div> <strong>Nom de la liste : </strong> {{ liste.nom_liste }}</div>
                                <div v-if="elections[0].type === 'Presidentielle'"> <strong>Candidat : </strong> </div>
                                <div v-else> <strong>Candidats : </strong> </div>
                                <ul class="liste_candidats">
                                    <li :key="candidat.id" v-for="candidat in liste.candidats" class="candidat">
                                        <div> {{ candidat.nom_complet }} </div>
                                    </li>
                                </ul>
                                <button class="voter" @click="popupConfirmation(elections[0], liste)">VOTER</button>
                            </div>

                        </li>
                    </ul>
                </div>
                
            </div>
        </div>
        
        <!--  AFFICHAGE SI AUCUNE ELECTION DISPO  -->

        <h2 v-else class="noElection">Aucune élection disponible !</h2>

        <!--  POPUP AVANT VOTE  -->

        <div :class="[{displayPop : wantsToVote}]" class="overlay">
            <div class="popup">
                <h2>ATTENTION</h2>
                <br>
                <p>Êtes-vous sur de vouloir voter ? Une fois le vote comptabilisé, il ne vous sera plus possible de le modifier !</p>
                <button @click="confirmation()" class="buttonPop">Confirmer le vote</button>
                <button @click="closePopup()" class="buttonPop">Annuler le vote</button>
            </div>
        </div>

        <!--  POPUP APRES VOTE  -->

        <div :class="[{displayPop : isError}, {displayPop : voted}]" class="overlay">
            <div class="popup">
                <h2 v-if="isError">Erreur</h2>
                <h2 v-else>A voté</h2>
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
            noSorted: true,
            idSelected: -1,
            research: '',
            popup: '',
            wantsToVote: false,
            confirmVote: false,
            idElectionVote: -1,
            idListeVote: -1,
            isError: false,
            voted: false,
        }
    },
    mounted: async function() {
        
        // FONCTION QUI RECUPERE LES INFORMATIONS DES ELECTIONS

        const sort = {
            typeSort: "noSort"
        }

        const result = await axios.post('/api/user/elections', sort)  // On récupère les infos de la BDD

        this.elections.pop()
        this.listes.pop()
        this.candidats.pop()

        this.fillElection(result.data.elections)  // On remplit le tableau élection
    },
    methods: {
        async detailElection(idElection) {

            // FONCTION POUR REMPLIR LES ELECTIONS AVEC LES INFORMATIONS DETAILLEES

            const findId = (element) => element.id === idElection // On cherche l'id de l'élection sélectionnée
            this.idSelected = this.elections.findIndex(findId)
            

            const information = {
                election: this.elections[this.idSelected]
            }

            const result = await axios.post('/api/user/elections/detailElection', information)  // On récupère les informations

            if (result.data.popup === undefined) {
                this.electionInDetail = true
                this.elections = [{}]
                this.listes = [{}]
                this.candidats = [{}]

                this.elections.pop()
                this.listes.pop()
                this.candidats.pop()

                this.fillDetailedElection(result.data.elections)  // On remplit le tableau élection
            }
            else {
                this.popup = result.data.popup
                this.isError = true
                this.showAll()
            }
        },
        fillElection(elections) {

            // FONCTION POUR REMPLIR LES ELECTIONS AVEC LES INFORMATIONS

            for (var i = 0; i < elections.length; i++) {
                var date = elections[i].date.substring(0,10).split('-')  // On split la date pour la mettre dans un bon format
            
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

            // FONCTION QUI RECUPERE LES INFORMATIONS DES ELECTIONS

            for (var i = 0; i < election.length; i++) {
                var date = election[i].date.substring(0,10).split('-')
                
                if (election.type !== "Referundum") {  // Un referundum n'a pas de candidat
                    this.candidats.push({
                        nom_complet: election[i].nom_complet
                    })
                }

                if ( (i === election.length - 1) || ( election[i].id_liste !== election[i + 1].id_liste ) ) {  // On remplit les listes avec les infos
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

                if ( (i === election.length - 1) || (election[i].id_election !== election[i + 1].id_election) ) { // On remplit l'election avec les infos
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
        },
        showAll() {

            // Annule la recherche et donc récupère les infos de toutes les élections

            this.idSelected = -1
            this.electionInDetail = false
            this.noSorted = false
            this.noSort()
        },
        async sort (typeOfSort) {

            // Recupère les infos selon un type de tri

            this.elections = [{}]
            this.listes = [{}]
            this.candidats = [{}]

            const sort = {
                typeSort: typeOfSort,
                searchName: this.research
            }

            const result = await axios.post('/api/user/elections', sort)

            this.elections.pop()
            this.listes.pop()
            this.candidats.pop()

            this.fillElection(result.data.elections)
        },
        sortBySearch() {
            this.sort("sortBySearch")
            this.noSorted = false 
        },
        noSort() {
            if (!this.noSorted) {
                this.sort("noSort")
                this.noSorted = true
            }
        },
        async vote() {

            // VOTE

            if (this.confirmVote) {
                const information = {
                    id_election: this.idElectionVote,
                    id_liste: this.idListeVote,
                }
                const result = await axios.post('/api/user/elections/vote', information)  // Va update les infos sur la bdd pour prendre en compte le vote

                this.popup = result.data.popup

                if (this.popup === "Le vote a été pris en compte ! Merci de votre participation !") {  // Popup de confirmation ou d'erreur
                    this.voted = true
                }
                else if (this.popup !== undefined) {
                    this.isError = true
                }
                this.confirmVote = false
            }
            this.showAll()  // annule la recherche
        },
        closePopup() {
            this.wantsToVote = false
            this.isError = false
            this.voted = false
            this.showAll()
        },
        popupConfirmation(election, liste) {  // Popup de confirmation avant de voter
            this.wantsToVote = true
            this.idElectionVote = election.id
            this.idListeVote = liste.id_liste
        },
        confirmation() {  // Confirmation de l'envie de voter
           this.confirmVote = true
           this.wantsToVote = false
           this.vote()
        },
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

.intro {
    display:flex;
    justify-content: center;
    align-content:center;
    margin: 0 auto;
}

.voter {
    margin-top:20px;
    margin-bottom:20px;
}

</style>


