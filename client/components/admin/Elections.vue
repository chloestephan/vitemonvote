<template>

    <div>
        <!--  AFFICHAGE SELON SI UNE ELECTION EST SELECTIONNEE OU NON  -->
        <div v-if="!electionInDetail">
            <h2>Choisissez une élection pour la modifier</h2>
            <br>
            <img class="loop" src="img/retour_arriere.png" @click="noSort()">
            <input type="text" v-model="research" placeholder="Par exemple : Paris, Marseille..." required>
            <img src="img/loupe.png" @click="sortBySearch()" class="loupeLogo">
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
            </li>
        </ul>

        <!--  AFFICHAGE SI UNE ELECTION EST SELECTIONNEE  -->

        <div v-else-if="electionInDetail">
            <br><br>
            <h2>{{ elections[idSelected].nom }}</h2>
            <br>
            <div> <strong>Type d'élection : </strong> {{ elections[idSelected].type }}</div>
            <div> <strong>Date du vote : </strong> {{ elections[idSelected].jour }} / {{ elections[idSelected].mois }} / {{ elections[idSelected].année }}</div>
            <div> <strong>Tour : </strong> {{ elections[idSelected].tour }}</div>
            <br>

            <!--  AFFICHAGE QUI CHANGE POUR MONTRER LES RESULT OU POUR VOTER  -->

            <ul class="liste_container">
                <li :key="liste.id_liste" v-for="liste in elections[idSelected].listes" class="liste">
                    <div> <strong>Nom de la liste : </strong> {{ liste.nom_liste }}</div>
                    <div> <strong>Candidat : </strong> </div>
                    <ul>
                        <li :key="candidat.id" v-for="candidat in liste.candidats" class="candidat">
                            <div> {{ candidat.nom_complet }} </div>
                        </li>
                    </ul>
                </li>
            </ul>
            <button>Ouvrir les votes</button>
            <button>Fermer les votes</button>
            <button>Afficher les résultats</button>
            <button>Cacher les résultats</button>
        </div>
        
        <!--  AFFICHAGE SI AUCUNE ELECTION DISPO  -->

        <h2 v-else class="noElection">Aucun résultat disponible !</h2>

    </div>

</template>

<script>

module.exports = {
    data () {
        return {
            elections: [{}],
            listes: [{}],
            candidats: [{}],
            electionInDetail: false,
            noSorted: true,
            idSelected: -1,
            research: '',
            popup: '',
            isError: false,
            voted: false,
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

        this.fillElection(result)
    },
    methods: {
        async detailElection(idElection) {
            const findId = (element) => element.id === idElection
            this.idSelected = this.elections.findIndex(findId)
            this.electionInDetail = true
        },
        fillElection(result) {
            for (var i = 0; i < result.data.elections.length; i++) {
                var date = result.data.elections[i].date.substring(0,10).split('-')
                
                this.candidats.push({
                    nom_complet: result.data.elections[i].nom_complet
                })

                if ( (i === result.data.elections.length - 1) || ( result.data.elections[i].id_liste !== result.data.elections[i + 1].id_liste ) ) {
                    this.listes.push({
                        id_election: result.data.elections[i].id_election,
                        id_liste: result.data.elections[i].id_liste,
                        nom_liste: result.data.elections[i].nom_liste,
                        nbr_votes: result.data.elections[i].nbr_votes,
                        candidats: this.candidats
                    })
                    this.candidats = [{}]
                    this.candidats.pop()
                }

                if ( (i === result.data.elections.length - 1) || (result.data.elections[i].id_election !== result.data.elections[i + 1].id_election) ) {
                    this.elections.push({
                        id: result.data.elections[i].id_election,
                        nom: result.data.elections[i].nom,
                        année: date[0],
                        mois: date[1],
                        jour: date[2],
                        tour: result.data.elections[i].tour,
                        type: result.data.elections[i].type_election,
                        resultats_visibles: result.data.elections[i].resultats_visibles,
                        listes: this.listes
                    })
                    this.listes = [{}]
                    this.listes.pop()
                }
            }
        },
        showAll() {
            this.idSelected = -1
            this.electionInDetail = false
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

            this.fillElection(result)
        },
        async sortBySearch() {
              this.sort("sortBySearch")
              this.noSorted = false
        },
        async noSort() {
            if (!this.noSorted) {
                this.sort("noSort")
                this.noSorted = true
            }
        },
        closePopup() {
            this.wantsToVote = false
            this.isError = false
            this.voted = false
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
    height: 250px;
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
    scale: 1.05;
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

#button {
    transition: 0s;
}

.loupeLogo {
    height: 30px;
    width: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all .4s;
    border: none;
    text-decoration: none;
    margin: 10px;
}

.loupeLogo:hover {
    cursor: pointer;
}

</style>


