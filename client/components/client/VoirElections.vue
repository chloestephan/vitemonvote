<template>
    <ul v-if="elections.length">
        <li :key="election.id" v-for="election in elections" class="election">
            <h2>{{ election.nom }}</h2>
            <br>
            <div> <strong>Type d'élection : </strong> {{ election.type }}</div>
            <div> <strong>Date du vote : </strong> {{ election.jour }} / {{ election.mois }} / {{ election.année }}</div>
            <div> <strong>Tour : </strong> {{ election.tour }}</div>
        </li>
    </ul>
    <h2 v-else class="noElection">Aucune élection disponible !</h2>
</template>

<script>

module.exports = {
    data () {
        return {
            elections: [{}],
        }
    },
    mounted: async function() {
        
        const result = await axios.get('/api/user/voirelections')
        this.elections.pop()

        for (var i = 0; i < result.data.elections.length; i++) {
            var date = result.data.elections[i].date.substring(0,10).split('-')
            
            this.elections.push({
                id: result.data.elections[i].id_election,
                nom: result.data.elections[i].nom,
                année: date[0],
                mois: date[1],
                jour: date[2],
                tour: result.data.elections[i].tour,
                type: result.data.elections[i].type_election,
            })
        }     
    },
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

</style>


