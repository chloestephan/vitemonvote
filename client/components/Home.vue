<template>
  <div>
    <div class="site-container">

        <div class="rang">

          <h1 class="description">Qu'est-ce que Vite mon Vote ?</h1>
          <hr>

          <div class='some-page-wrapper'>
            <div class='row'>
              <div class='column'>
                <div class='blue-column'>
                  <img src="\img/bureaudevote.jpg" alt="Image d'une enveloppe de vote étant déposée dans une urne dans un bureau de vote."/>
                </div>
              </div>
              <div class='column'>
                <div class='green-column'>
                  <h2>Votez d'où vous voulez, quand vous voulez.</h2>
                  <p>Vous pouvez voter en seulement quelques clics grâce au lien de connexion qui vous est envoyé par mail. En effet, ce lien vous fait part de vos 
                    identifiants de connexion afin de voter en toute sécurité et anonymement.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class='some-page-wrapper'>
            <div class='row'>
              <div class='column'>
                <div class='blue-column'>
                  <h2>Votez d'où vous voulez, quand vous voulez.</h2>
                  <p>Vous pouvez voter en seulement quelques clics grâce au lien de connexion qui vous est envoyé par mail. En effet, ce lien vous fait part de vos 
                    identifiants de connexion afin de voter en toute sécurité et anonymement.
                  </p>
                </div>
              </div>
              <div class='column'>
                <div class='green-column'>
                  <img src="\img/bureaudevote.jpg" alt="Image d'une enveloppe de vote étant déposée dans une urne dans un bureau de vote."/>
                </div>
              </div>
            </div>
          </div>

          <div class='some-page-wrapper'>
            <div class='row'>
              <div class='column'>
                <div class='blue-column'>
                  <img src="\img/droitcitoyen.jpg" alt="Image d'une carte électorale française tenue devant une urne d'un bureau de vote."/>
                </div>
              </div>
              <div class='column'>
                <div class='green-column'>
                  <h2>Facilite la procédure de vote.</h2>
                  <p>Vous n'avez plus à vos déplacer aux bureaux de vote, à attendre et à respecter scrupuleusement les règles afin de ne pas annuler votre vote. Vous pouvez voter confortablement depuis chez vous, et ce en toute sécurité.</p>
                </div>
              </div>
            </div>
          </div>

          <div class='some-page-wrapper'>
            <div class='row'>
              <div class='column'>
                <div class='blue-column'>
                  <h2>Centralise avec sécurité les résultats des élections.</h2>
                  <p>Les résultats sont récupérés et vérifiés directement via Vite Mon Vote. Ainsi, les résultats sont comptés bien plus rapidement et accessibles facilement via la même plateforme que sur laquelle vous avez voté !</p>
                </div>
              </div>
              <div class='column'>
                <div class='green-column'>
                  <img src="\img/resultats.png" alt="Image d'une carte électorale française tenue devant une urne d'un bureau de vote."/>
                </div>
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
        test: null,
    }
  },
  methods: {
  }
}
</script>

<style scoped>
.some-page-wrapper {
  margin: 15px;
}

.row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
}

.column {
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  flex: 1;
  width: 80%;
  margin-left: 10%;
  margin-right: 10%;
}

.double-column {
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  flex: 2;
}

.column p {
  font-size: 18px;
  line-height: 1.55;
  font-weight: 300;
  text-align: justify;
  display: flex;
  height: 150px;
  align-items: center;
}

.row:after {
  content: "";
  display: table;
  clear: both;
}

.blue-column {
}

.green-column {
}

hr {
  height:2px;
  border-width:0;
  color:#D60920;
  background-color:#D60920;
  margin-top: 20px;
  margin-bottom: 30px;
  margin-left: 40%;
  width: 20%;
}

</style>