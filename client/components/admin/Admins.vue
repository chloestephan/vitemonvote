<template>
  <div class="site-container">
        <div class="limiter">
            <div class="container">
                <div>
                    <h2>Ajouter un administrateur</h2>
                    <hr>
                    <div>
                        <form @submit.prevent="ajouterAdmin">
                            <input type="text" v-model="email" placeholder="Entrez l'adresse mail" required>
                            <input type="text" v-model="password" placeholder="Entrez le mot de passe" required>

                            <button type="submit">Ajouter</button>
                        </form>
                    </div>
                </div>
            <div>
                <h2>Liste des administrateurs</h2>
                <hr>
                <div v-for="administrateur in administrateurs" :key="administrateur.id" class="admin">
                    <p id="email">{{administrateur.email}}</p>
                    <p v-if="administrateur.id !== currentAdmin" class="crossDelADmin" @click="deleteAdmin(administrateur)">✖️</p>
                </div>
            </div>

            <div :class="[{displayPop : isError}, {displayPop : isNoError}]" class="overlay">
                <div class="popup">
                    <h2 v-if="isError">Erreur</h2>
                    <h2 v-else>Confirmation</h2>
                    <br>
                    <p>{{ popup }}</p>
                    <button v-on:click="closePopup" class="crossPopup">
                        X
                    </button>
                </div>
            </div>

        </div>
    </div>
  </div>
</template>


<script>
module.exports = {
    data () {
        return {
            administrateurs: null,
            currentAdmin: null,
            isError: false,
            isNoError: false,
            popup: '',
            email: '',
            password: '',
        }
    },

    created: async function(){
        const result = await axios.get('/api/admin/admins')
        this.administrateurs = result.data.administrateurs
        this.currentAdmin = result.data.currentId
    },

    methods: {
        async deleteAdmin(administrateur){
            const result = await axios.delete('/api/admin/' + administrateur.id)
            this.administrateurs = result.data.admin
            this.popup = result.data.popup

            if (this.popup === "L'admin a bien été supprimé !") {
                this.isNoError = true
            }
            else if (!(this.popup === undefined)) {
                this.isError = true
            }
        },
        async ajouterAdmin(){
            if(this.email !== '' && this.password !== ''){
                const admin = {
                    email: this.email,
                    password: this.password,
                }

                const result = await axios.post('/api/admin/register', admin)
                this.administrateurs = result.data.admin
                this.popup = result.data.popup

                if (this.popup === "L'admin a bien été créé !") {
                    this.isNoError = true
                }
                else if (!(this.popup === undefined)) {
                    this.isError = true
                }
            }
        },
        closePopup() {
            this.isError = false
            this.isNoError = false
        },
    }
}
</script>

<style scoped>

    :root {
        box-sizing: border-box;
    }


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
        display: block;
        border: 0;
        border-radius: 3em;
        border-top: 2px solid #D60920;
        margin-top: 10px;
        margin-bottom: 10px;
        width: 10%;
        margin: auto;
    }

    .admin:last-child {
        margin-bottom: 20px;
    }

    .admin {
        max-width: 480px;
        padding: 15px;
        margin-left: auto;
        margin-right: auto;
        margin-top: 50px;
        margin-top: 25px;
        border-radius: 10px;
        border-width: 100%;
        background-color: #fff;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        -moz-box-shadow: 0px 1px 5px 0px #656565;
        -webkit-box-shadow: 0px 1px 5px 0px #656565;
        -o-box-shadow: 0px 1px 5px 0px #656565;
        box-shadow: 0px 1px 5px 0px #656565;
    }

    .admin p #id {
        text-decoration: bold;
    }

    .crossDelADmin:hover{
        cursor: pointer;
    }

    .id {
        text-decoration: bold;
    }

/* ------ MEDIA QUERIES ------ */


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

.crossPopup {
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
}

.crossPopup:hover {
    color: #001D6E;
}

h2 {
    color: #001D6E;
    font-family: Poppins-Bold;
    font-size: 30px;
}

</style>