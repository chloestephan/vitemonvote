<template>
  <div>
    <div class="site-container">

        <h1 class="description">Comment voter sur Vite Mon Vote ?</h1>
        <hr>

        <div class="limiter">
          <div class='some-page-wrapper'>
            <div class='row'>
              <div class='column'>
                <div class='blue-column'>
                  <img src="\img/ou_voter.png" alt="Photo montrant où se situe le bouton 'Voter' sur notre site, en haut a droite de la page."/>
                </div>
              </div>
              <div class='column'>
                <div class='green-column'>
                  <h2>Où voter ?</h2>
                  <p>Pour voter, il vous suffit de vous rendre dans la page "Voter", qui est accessible grâce au bouton "Voter" en haut à droite de chaque page de Vite Mon Vote.</p>
                </div>
              </div>
            </div>
          </div>

          <div class='some-page-wrapper'>
            <div class='row'>
              <div class='column'>
                <div class='blue-column'>
                  <img src="\img/recup_mdp.png" alt="Image d'une carte électorale française tenue devant une urne d'un bureau de vote."/>
                </div>
              </div>
              <div class='column'>
                <div class='green-column'>
                  <h2>Première étape : récupérez vos identifiants.</h2>
                  <p>Vous êtes reconnu(e) en tant que personne pouvant voter par les informations suivantes : votre numéro d'électeur sur votre carte électorale,
                      votre code postal et votre adresse email. Nous nous assurons ensuite que vous êtes en effet sur nos listes électorales
                      et pouvez donc voter. Une fois cette validation faite, vous recevez vos identifiants de connexion par email. 
                  </p>
                </div>
            </div>
          </div>

          <div class='some-page-wrapper'>
            <div class='row'>
              <div class='column'>
                <div class='blue-column'>
                  <img src="\img/se_connecter.png" alt="Image d'une carte électorale française tenue devant une urne d'un bureau de vote."/>
                </div>
              </div>
              <div class='column'>
                <div class='green-column'>
                  <h2>Deuxième étape : se connecter.</h2>
                  <p>Vous n'avez plus à vous déplacer aux bureaux de vote, à attendre et à respecter scrupuleusement les règles afin de ne pas annuler votre vote. Vous pouvez voter confortablement depuis chez vous, et ce en toute sécurité.</p>
                </div>
            </div>
          </div>

          <div class='some-page-wrapper'>
            <div class='row'>
              <div class='column'>
                <div class='blue-column'>
                   <img src="\img/selectionVote.png" alt="Image d'une carte électorale française tenue devant une urne d'un bureau de vote."/>
                </div>
              </div>
              <div class='column'>
                <div class='green-column'>
                  <h2>Troisième étape : Sélectionner l'élection</h2>
                  <p>Vous pouvez sélectionner pour quelle élection vous souhaitez voter.</p>
                </div>
            </div>
          </div>

          <div class='some-page-wrapper'>
            <div class='row'>
              <div class='column'>
                <div class='blue-column'>
                   <img src="\img/voter.png" alt="Image d'une carte électorale française tenue devant une urne d'un bureau de vote."/>
                </div>
              </div>
              <div class='column'>
                <div class='green-column'>
                  <h2>Quatrième étape : Voter !</h2>
                  <p>Vous pouvez finalement choisir pour quelle liste vous souhaitez voter.</p>
                </div>
            </div>
          </div>

          <div class='some-page-wrapper'>
            <div class='row'>
              <div class='column'>
                <div class='blue-column'>
                  <img src="\img/consulter_resultats.png" alt="Image d'une carte électorale française tenue devant une urne d'un bureau de vote."/></div>
              </div>
              <div class='column'>
                <div class='green-column'>
                  <h2>Dernière étape : consulter les résultats.</h2>
                  <p>Vous pouvez ensuite revenir une fois l'élection terminée pour consulter ses résultats via la page "Résultats".</p>
                </div>
              </div>
          </div>
        </div>
    </div>
  </div>
</template>

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
  align-items: center;
}

.row:after {
  content: "";
  display: table;
  clear: both;
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
