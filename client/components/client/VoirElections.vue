<template>
    <ul v-if="elections.length">
        <li :key="election.id" v-for="election in elections" class="election">
            <h2>{{ election.nom }}</h2>
            <div> <strong>Type d'élection : </strong> {{ election.type }}</div>
            <div>{{ election.date }}</div>
            <div>{{ election.tour }}</div>
        </li>
    </ul>
    <p v-else>Auncune élection disponible !</p>
</template>

<script>

module.exports = {
    data () {
        return {
            elections: [{
                id: "",
                nom: "",
                date: "",
                tour: "",
                type: "",
            }],
        }
    },
    mounted: async function() {
        const result = await axios.get('/api/user/voirelections')
        this.elections.pop()
        for (var i = 0; i < result.data.elections.length; i++) {
            this.elections.push({
                id: result.data.elections[i].id_election,
                nom: result.data.elections[i].nom,
                date: result.data.elections[i].date,
                tour: result.data.elections[i].tour,
                type: result.data.elections[i].type_election,
            })
        }     
    },
    methods: {
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

</style>


