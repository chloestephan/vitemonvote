<template>

    <div>
        <h2 v-if="!inSearch">Cliquez sur une élection pour voir les détails !</h2>
        <button v-else @click="showAll" class="return">Annuler la recherche</button>

        <ul v-if="elections.length && !inSearch" class="election_container">
            <li :key="election.id" v-for="election in elections" class="election" @click="detailElection(election.id)">
                <h2>{{ election.nom }}</h2>
                <br>
                <div> <strong>Type d'élection : </strong> {{ election.type }}</div>
                <div> <strong>Date du vote : </strong> {{ election.jour }} / {{ election.mois }} / {{ election.année }}</div>
                <div> <strong>Tour : </strong> {{ election.tour }}</div>
            </li>
        </ul>
        <div v-else-if="inSearch">
            <br><br>
            <h2>{{ elections[idSelected].nom }}</h2>
            <br>
            <div> <strong>Type d'élection : </strong> {{ elections[idSelected].type }}</div>
            <div> <strong>Date du vote : </strong> {{ elections[idSelected].jour }} / {{ elections[idSelected].mois }} / {{ elections[idSelected].année }}</div>
            <div> <strong>Tour : </strong> {{ elections[idSelected].tour }}</div>
            <br>
            <ul class="liste_container">
                <li :key="liste.id_liste" v-for="liste in elections[idSelected].listes" class="liste">
                    <div> <strong>Nom de la liste : </strong> {{ liste.nom_liste }}</div>
                    <div> <strong>Nombre de vote : </strong> {{ liste.nbr_votes }}</div>
                    <div><strong>Candidat : </strong></div>
                    <ul>
                        <li :key="candidat.id" v-for="candidat in liste.candidats" class="candidat">
                            <div> {{ candidat.nom_complet }} </div>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
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
            inSearch: false,
            idSelected: -1,
        }
    },
    mounted: async function() {
        
        const result = await axios.get('/api/user/resultats')
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
            this.inSearch = true
        },
        showAll() {
            this.idSelected = -1
            this.inSearch = false
        }
    }
}

</script>

<style scoped>

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
}

.election_container {
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


