<template>

    <div>
        <!--  AFFICHAGE SELON SI UNE ELECTION EST SELECTIONNEE OU NON  -->
        <div v-if="!electionInDetail">
            <h2>Cliquez sur une élection pour voter ou pour voir les résultats !</h2>
            <button @click="sortByVote">TRIER PAR VOTE DISPONIBLES</button>
            <button @click="sortByResult">TRIER PAR RESULTATS DISPONIBLES</button>
        </div>
        
        <button v-else @click="showAll" class="return">Annuler la recherche</button>

        <!--  AFFICHAGE SI DES ELECTIONS SONT DISPO  -->

        <ul v-if="elections.length && !noSort && sortVote" class="election_container">
            <div :key="election.id" v-for="election in elections">
                <li v-if="!election.resultats_visibles" class="election" @click="detailElection(election.id)">

                    <h2>{{ election.nom }}</h2>
                    <br>
                    <div> <strong>Type d'élection : </strong> {{ election.type }}</div>
                    <div> <strong>Date du vote : </strong> {{ election.jour }} / {{ election.mois }} / {{ election.année }}</div>
                    <div> <strong>Tour : </strong> {{ election.tour }}</div>
                    <div><strong>VOTE DISPONIBLES</strong></div>
                      
                </li>
            </div>
        </ul>

        <ul v-else-if="elections.length && !electionInDetail" class="election_container">
            <li :key="election.id" v-for="election in elections" class="election" @click="detailElection(election.id)">
                <h2>{{ election.nom }}</h2>
                <br>
                <div> <strong>Type d'élection : </strong> {{ election.type }}</div>
                <div> <strong>Date du vote : </strong> {{ election.jour }} / {{ election.mois }} / {{ election.année }}</div>
                <div> <strong>Tour : </strong> {{ election.tour }}</div>

                <!--  AFFICHAGE SELON LA DISPO DES RESULT OU DES VOTES  -->

                <div v-if="election.resultats_visibles"><strong>RESULTATS DISPONIBLES</strong></div>
                <div v-else><strong>VOTE DISPONIBLES</strong></div>
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

            <ul class="liste_container" v-if="elections[idSelected].resultats_visibles">
                <li :key="liste.id_liste" v-for="liste in elections[idSelected].listes" class="liste">
                    <div> <strong>Nom de la liste : </strong> {{ liste.nom_liste }}</div>
                    <div> <strong>Nombre de vote : </strong> {{ liste.nbr_votes }}</div>
                    <div> <strong>Candidat : </strong> </div>
                    <ul>
                        <li :key="candidat.id" v-for="candidat in liste.candidats" class="candidat">
                            <div> {{ candidat.nom_complet }} </div>
                        </li>
                    </ul>
                </li>
            </ul>

            <ul class="liste_container" v-else>
                <li :key="liste.id_liste" v-for="liste in elections[idSelected].listes" class="liste">
                    <div> <strong>Nom de la liste : </strong> {{ liste.nom_liste }}</div>
                    <div> <strong>Candidat : </strong> </div>
                    <ul>
                        <li :key="candidat.id" v-for="candidat in liste.candidats" class="candidat">
                            <div> {{ candidat.nom_complet }} </div>
                        </li>
                    </ul>
                    <button>VOTER</button>
                </li>
            </ul>

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
            idSelected: -1,
            noSort: true,
            sortVote: false,
            sortResult: false,
        }
    },
    mounted: async function() {
        
        const result = await axios.get('/api/user/voirelections')
        this.elections.pop()
        this.listes.pop()
        this.candidats.pop()

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
    methods: {
        async detailElection(idElection) {
            const findId = (element) => element.id === idElection
            this.idSelected = this.elections.findIndex(findId)
            this.electionInDetail = true
        },
        showAll() {
            this.idSelected = -1
            this.electionInDetail = false
        },
        sortByVote() {
            this.noSort = false
            this.sortResult = false
            this.sortVote = true
        },
        sortByResult() {
            this.noSort = false
            this.sortResult = true
            this.sortVote = false
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


</style>


