<template>
    <ul v-if="elections.length" class="election_container">
        <li :key="election.id" v-for="election in elections" class="election">
            <h2>{{ election.nom }}</h2>
            <br>
            <div> <strong>Type d'élection : </strong> {{ election.type }}</div>
            <div> <strong>Date du vote : </strong> {{ election.jour }} / {{ election.mois }} / {{ election.année }}</div>
            <div> <strong>Tour : </strong> {{ election.tour }}</div>
            <br>
            <ul class="liste_container">
                <li :key="liste.id_liste" v-for="liste in election.listes" class="liste">
                    <div> <strong>Nom de la liste : </strong> {{ liste.nom_liste }}</div>
                    <div> <strong>Nombre de vote : </strong> {{ liste.nbr_votes }}</div>
                </li>
            </ul>
        </li>
    </ul>
    <h2 v-else class="noElection">Aucun résultat disponible !</h2>
</template>

<script>

module.exports = {
    data () {
        return {
            elections: [{}],
            listes: [{}],
        }
    },
    mounted: async function() {
        
        const result = await axios.get('/api/user/resultats')
        this.elections.pop()
        this.listes.pop()

        for (var i = 0; i < result.data.elections.length; i++) {
            var date = result.data.elections[i].date.substring(0,10).split('-')
            
            this.listes.push({
                id_election: result.data.elections[i].id_election,
                id_liste: result.data.elections[i].id_liste,
                nom_liste: result.data.elections[i].nom_liste,
                nbr_votes: result.data.elections[i].nbr_votes,
            })

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
                console.log(this.listes)
                this.listes = [{}]
                this.listes.pop()
            }
        }
    },
}

</script>

<style scoped>

.election {
    background: #FFF;
    width: 600px;
    height: 500px;
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
    background: rgb(179, 175, 167);
}

</style>


