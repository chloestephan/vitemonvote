const express = require('express')
const router = express.Router()

const bcrypt = require('bcrypt')
const { Client } = require('pg')

const nodemailer = require('nodemailer')

const client = new Client({
  user: 'vitemonvote',
  host: 'localhost',
  password: 'NomenclatureSquad',
  database: 'vitemonvote'
})

client.connect()

module.exports = router

//Start of admin part
router.get('/admin/me', async (req, res) => {
  if(req.session.admin === true){
    res.json({admin: true})
    return
  }
  res.json({admin: false})
})

router.post('/admin/login', async (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const sql = "SELECT * FROM admins WHERE email=$1"
  const result = await client.query({
    text: sql,
    values: [email]
  })

  if(result.rowCount === 0){
    res.json({ popup: "L'email utilisé et/ou le mot de passe sont incorretes !"})
    return
  }

  if (! await bcrypt.compare(password, result.rows[0].password)){
    res.json({connected: false, popup: "L'email et/ou le mot de passe sont incorrectes !"})
    return
  }

  req.session.adminId = result.rows[0].id
  req.session.admin = true
  
  res.json({connected: true, message: 'You are now logged in as an admin.'})
})

router.post('/admin/logout', async (req, res) => {
  const email = req.body.email
  const password = req.body.password
  req.email = ''
  req.password = ''
  req.session.adminId = null
  req.session.admin = false 
  res.json({connected: false, message: 'You just logged out.'})
})

//admin management
router.post('/admin/register', async (req, res) =>{
  if (req.session.admin === true){
    const email = req.body.email
    const password = req.body.password

    const sql1 = "SELECT * FROM admins WHERE email=$1"
    const result1 = await client.query({
      text: sql1,
      values: [email] // ici name et description ne sont pas concaténées à notre requête
    })

    if(result1.rowCount !== 0){
      res.json({ popup: "Cet admin existe déjà !"})
      return
    }

    const hash = await bcrypt.hash(password, 10)

    const sql2 = "INSERT INTO admins (email, password) VALUES ($1, $2)"
    await client.query({
      text: sql2,
      values: [email, hash]
    })

    const result2 = await client.query({text: "SELECT id, email FROM admins"})
    res.json({admin: result2.rows, popup: "L'admin a bien été créée !"})
    return
  }
  res.status(400).json({message: "L'utilisateur n'a pas les droits administrateurs."})
})

router.delete('/admin/:id', async (req, res) => {
  if (req.session.admin === true){
    const deleteAdmin = req.params.id
    if (deleteAdmin === req.session.adminId){
      res.status(401).json({message: "You can't delete the current admin"})
      return
    }
    else if (deleteAdmin === '1') {
      const result = await client.query({text: "SELECT id, email FROM admins"})
      res.json({admin: result.rows, popup: "Vous ne pouvez pas supprimer le super admin !"})
      return      
    }
    const haveElection = "SELECT * FROM acces WHERE id_election = $1"
    const resultHaveElection = await client.query({
      text: haveElection,
      values: [deleteAdmin]
    })
    
    if (resultHaveElection.rowCount === 0) {
      const sql = "DELETE FROM admins WHERE id=$1"
      await client.query({
        text: sql,
        values: [deleteAdmin]
      })
  
      const result = await client.query({text: "SELECT id, email FROM admins"})
      res.json({admin: result.rows, popup: "L'admin a bien été supprimé !"})
      return
    }
    else {

      // ON DONNE TOUT AU SUPER ADMIN

      await client.query({
        text: "UPDATE acces SET id_admin = 1 WHERE id_admin = $1",
        values: [deleteAdmin]
      })

      await client.query({
        text: "UPDATE elections SET id_admin = 1 WHERE id_admin = $1",
        values: [deleteAdmin]
      })

      const sql = "DELETE FROM admins WHERE id=$1"
      await client.query({
        text: sql,
        values: [deleteAdmin]
      })

      const result = await client.query({text: "SELECT id, email FROM admins"})
      res.json({admin: result.rows, popup: "L'admin a bien été supprimé !"})
      return
    }
  }
  res.status(400).json({message: "L'utilisateur n'a pas les droits administrateurs."})
})

router.get('/admin/admins', async (req, res) =>{
  if (req.session.admin === true){
    const result = await client.query({text: "SELECT id, email FROM admins"})
    res.json({currentId: req.session.adminId, administrateurs: result.rows})
    return
  }
  res.status(400).json({message: "L'utilisateur n'a pas les droits administrateurs."})
})

router.post('/admin/election', async(req, res) =>{
  if (req.session.admin === true){
    const nom = req.body.nom
    const date = req.body.date
    const tour = req.body.tour
    const typeElection = req.body.typeElection
    let tour_precedent = null
    if (tour !== 1){
      tour_precedent = req.body.precedent_tour
    }
    const nomListes = req.body.nomListes
    const candidats = req.body.candidats

    let sql = "INSERT INTO elections(nom, date, tour, tour_precedent, type_election, id_admin, ouvert, resultats_visibles) VALUES ($1, $2, $3, $4, $5, $6, false, false) RETURNING id_election"
    let result = await client.query({
      text: sql,
      values: [nom, date, tour, tour_precedent, typeElection, req.session.adminId]
    })

    const id_election = result.rows[0].id_election

    let code_postaux = []
    if(typeElection === "Presidentielle" || typeElection === "Europeennes"){
      sql = "SELECT code_postal FROM bureaudevote"
      result = await client.query({
        text: sql
      })

      for(let i = 0; i < result.rowCount; i++){
        code_postaux.push(result.rows[i].code_postal)
      }
    }
    if(typeElection === "Municipales"){
      code_postaux = req.body.code_postaux
      console.log({code_postal: code_postaux})
    }

    if(typeElection === "Regionales"){
      sql = "SELECT code_postal FROM bureaudevote WHERE code_postal LIKE $1"
      for(let i = 1; i < req.body.code_postaux.length; i++){
        sql += " OR code_postal LIKE $" + (i+1)
      }
      console.log({Requete_SQL: sql})

      for(let i = 0; i < req.body.code_postaux.length; i++){
        code_postaux.push(req.body.code_postaux[i] + "%")
      }
      console.log({code_postaux: code_postaux})
      result = await client.query({
        text: sql,
        values: code_postaux
      })

      code_postaux = []

      for(let i = 0; i < result.rowCount; i++){
        code_postaux.push(result.rows[i].code_postal)
      }
    }

    console.log({election: id_election})
    console.log({code_postal: code_postaux})
    for(let i = 0; i < code_postaux.length; i++){
      sql = "INSERT INTO organise VALUES ($1, $2)"
      await client.query({
        text: sql,
        values: [id_election, code_postaux[i]]
      })
      console.log("organise" + i)
      console.log({code_postal: code_postaux[i]})
    }

    for(let i = 0; i < nomListes.length; i++){
      sql = "INSERT INTO liste(nom_liste, id_election, nbr_votes) VALUES ($1, $2, $3) RETURNING id_liste"
      result = await client.query({
        text: sql,
        values: [nomListes[i], id_election, 0]
      })
      const id_liste = result.rows[0].id_liste
      console.log({id_liste: id_liste, listes: candidats, candidats: candidats[i] })
      for(let j = 0; j < candidats[i].length; j++){
        sql = "INSERT INTO candidat VALUES ($1, $2)"
        await client.query({
          text: sql,
          values: [id_liste, candidats[i][j]]
        })
      }
    }

    sql = "INSERT INTO acces VALUES ($1, $2)"
    await client.query({
      text: sql,
      values: [req.session.adminId, id_election]
    })
        
    res.json({message: "Election créée."})
    return
  }
  res.status(400).json({message: "L'utilisateur n'a pas les droits administrateurs."})
})

router.post('/admin/electeurs', async(req, res) => {
  if (req.session.admin === true){
    const electeurs = req.body.electeurs
    console.log({oui: electeurs})

    const sql = "INSERT INTO electeur VALUES ($1, $2, $3, $4)"
    console.log("L218")
    for(let i = 0; i < electeurs.length; i++){
      console.log({test: electeurs[i]})
      await client.query({
        text: sql,
        values: [electeurs[i][0], electeurs[i][1], null, electeurs[i][2]]
      })
    }
    res.json({message: "Electeurs ajoutés"})
    return
  }
  res.status(400).json({message: "L'utilisateur n'a pas les droits administrateurs."})
})

router.get('/admin/electeur', async(req, res) => {
  if (req.session.admin === true){
    const num_carte_electeur = req.body.num_carte_electeur
    const email = req.body.email
    const code_postal = req.body.code_postal

    const sql = "SELECT * FROM electeur WHERE lower(num_carte_electeur) LIKE lower($1) AND lower(email) LIKE lower($2) AND code_postal LIKE $3"
    const result = await client.query({
      text: sql,
      values: [num_carte_electeur + "%", email + "%", code_postal + "%"]
    })
    console.log("EHO")
    res.json(result.rows)
    return
  }
  res.status(400).json({message: "L'utilisateur n'a pas les droits administrateurs."})
})

router.delete('/admin/electeur/:id', async (req, res) => {
  if (req.session.admin === true){
    const id = req.params.id
    const sql = "DELETE FROM electeur WHERE num_carte_electeur=$1"
    await client.query({
      text: sql,
      values: [id],
    })
    res.json({message: "Utilisateur supprimé."})
    return
  }
  res.status(400).json({message: "L'utilisateur n'a pas les droits administrateurs."})
})

router.post('/admin/bureaux', async (req, res) => {
  if (req.session.admin === true){
    const bureaux = req.body.bureaux
    const sql = "INSERT INTO bureaudevote VALUES ($1, $2) ON CONFLICT DO NOTHING"
    for(let i = 0; i < bureaux.length; i++){
      await client.query({
        text: sql,
        values: [bureaux[i], 0]
      })
    }
    res.json({popup: "Les bureaux ont bien été ajoutés !"})
    return
  }
  res.status(400).json({message: "L'utilisateur n'a pas les droits administrateurs."})
})

//End of admin part

/*******************************************/
/*              PARTIE CLIENT              */
/*******************************************/

router.get('/user/me', async (req, res) => {
  if(req.session.user === true){
    res.json({user: true})
    return
  }
  res.json({user: false})
})

router.post('/user/logout', async (req, res) => {
  const email = req.body.email
  const password = req.body.password
  req.email = ''
  req.password = ''
  req.session.userId = null
  req.session.user = false
  res.json({connected: false, message: 'You just logged out.'})
})

// Generation de password

function generateP() {
  var pass = '';
  var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 
          'abcdefghijklmnopqrstuvwxyz0123456789@#$';
  for (i = 1; i <= 10; i++) {
      var char = Math.floor(Math.random()
                  * str.length + 1);
        
      pass += str.charAt(char)
  }
  return pass;
}

// Verif si c'est un nombre

function isDigit(c) {
  return c >= '0' && c <= '9';
}

// RecupMdp

router.post('/user/register', async (req, res) => {
  const email = req.body.email
  const numCarteElec = req.body.numCarteElec
  const codePostal = req.body.codePostal
  const password = generateP()
  const hash = await bcrypt.hash(password, 10)
  
  if (numCarteElec.length !== 9) {  // On regarde si la syntaxe du num est correcte
    res.json({popup: 'Le numéro de la carte électorale est incorrect !'})                  // POPUP
    return
  }
  else {
    for (let i = 0; i < numCarteElec.length; i++) {
      if (!isDigit(numCarteElec[i])) {
        res.json({popup: 'Le numéro de la carte électorale est incorrect !'})                  // POPUP
        return
      }
    }
  }

  if (codePostal.length !== 5) {  // On regarde si la syntaxe du codePostal est correcte
    res.json({popup: 'Le code postal est incorrect !'})                  // POPUP
    return
  }
  else {
    for (let i = 0; i < codePostal.length; i++) {
      if (!isDigit(codePostal[i])) {
        res.json({popup: 'Le code postal est incorrect !'})                  // POPUP
        return
      }
    }
  }

  const splitEmail = email.split('@')  // On regarde si la syntaxe du mail est correcte

  if (splitEmail[0] === "" || splitEmail[1] === undefined || splitEmail[1] === "" || splitEmail[2] !== undefined) {
    res.json({popup: 'L\'adresse mail est incorrect !'})                  // POPUP
    return
  }

  const sqlVerif = "SELECT * FROM public.Electeur WHERE num_carte_electeur=$1 AND email=$2 AND code_postal=$3"
  const result = await client.query({
    text: sqlVerif,
    values: [numCarteElec, email, codePostal]
  })

  if (result.rowCount !== 0) {    
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'vitemonvote@gmail.com',
        pass: 'NomenclatureSquad',
      }
    })
  
    let mailOptions = {
      from: 'vitemonvote@gmail.com',
      to: email,
      subject: 'Récupération mot de passe - ViteMonVote',
      text: 'Veuillez retrouver votre mot de passe, ci-joint : ' + password
    }
  
    transporter.sendMail(mailOptions, function(err, data) {
      if (err) {
        console.log("Error occurs", err)
        res.json({popup: 'Le mail donné n\'existe pas !'})
        return
      } 
    })

    const sqlVerif = "UPDATE public.Electeur SET password=$1 WHERE num_carte_electeur=$2"
    const result = await client.query({
      text: sqlVerif,
      values: [hash, numCarteElec]
    })

    res.json({popup: 'Un mot de passe vous a été envoyé sur votre adresse mail. Veuillez le saisir pour vous connecter !'})             // POPUP
  }
  else {
    res.json({popup: 'Les informations sont incorrectes, vous n\'êtes pas enregistrés sur la liste electorale !'})
  }
})

// Login

router.post('/user/login', async (req, res) => {
  const email = req.body.email
  const password = req.body.password

  const sql = "SELECT * FROM public.Electeur WHERE email=$1"
  const result = await client.query({
    text: sql,
    values: [email]
  })

  if(result.rowCount === 0){
    res.json({ popup: 'L\'email et/ou le mot de passe sont incorrectes !'})                // POPUP
    return
  }

  if (! await bcrypt.compare(password, result.rows[0].password)){
    res.json({popup: 'L\'email et/ou le mot de passe sont incorrectes !'})                               // POPUP
    return
  }
  
  req.session.userId = result.rows[0].num_carte_electeur
  req.session.user = true

  res.json({connected: true, message: 'You are now logged in as an user.'})
})

// TRI DES ELECTIONS

router.post('/user/elections', async (req, res) => {  

  if (req.session.user) {
    const typeSort = req.body.typeSort
    const searchName = "%" + req.body.searchName + "%"


  
    if (typeSort === "noSort") {
      const sql = "SELECT * FROM public.elections NATURAL JOIN public.liste NATURAL JOIN public.candidat WHERE (ouvert = true OR resultats_visibles = true) ORDER BY id_election"
      const result = await client.query({
        text: sql,
      })
      res.json({elections: result.rows})
    }
    else if (typeSort === "sortByVote") {
      const sql = "SELECT * FROM public.elections NATURAL JOIN public.liste NATURAL JOIN public.candidat WHERE resultats_visibles = false AND ouvert = true ORDER BY id_election"
      const result = await client.query({
        text: sql,
      })
      res.json({elections: result.rows})
    }
    else if (typeSort === "sortByResult") {
      const sql = "SELECT * FROM public.elections NATURAL JOIN public.liste NATURAL JOIN public.candidat WHERE resultats_visibles = true ORDER BY id_election"
      const result = await client.query({
        text: sql,
      })
      res.json({elections: result.rows})
    }
    else if (typeSort === "sortBySearch") {
      const sql = "SELECT * FROM public.elections NATURAL JOIN public.liste NATURAL JOIN public.candidat WHERE lower(nom) like lower($1) AND (ouvert = true OR resultats_visibles = true) ORDER BY id_election"
      const result = await client.query({
        text: sql,
        values: [searchName]
      })
      res.json({elections: result.rows})
    }
    else {
      res.status(401).json({message: "Le type de tri n'est pas accepté ! "})
    }
  }
  else {
    res.status(401).json({message: "L'utilisateur n'est pas connecté ! "})
  }


})

// NBR TOTAL VOTANT

router.post('/user/elections/nbrVotant', async (req, res) => {  

  if (req.session.user) {

    const id_election = req.body.id
    const getTotalVote = "SELECT count(*) FROM avote WHERE id_election = $1"
    const resultGetTotalVote = await client.query({
      text: getTotalVote,
      values: [id_election]
    })

    res.json({totalVote: resultGetTotalVote.rows[0].count})
  }
})

// VOTE

router.post('/user/elections/vote', async (req, res) => {   

  if (req.session.user) {
  
    // INFO NECESSAIRE

    const id_election = req.body.id_election
    const id_liste = req.body.id_liste
    const num_carte_electeur = req.session.userId

    const getCP = "SELECT code_postal FROM public.Electeur WHERE num_carte_electeur=$1"
    const resultGetCP = await client.query({
      text: getCP,
      values: [num_carte_electeur]
    })

    const code_postal = resultGetCP.rows[0].code_postal
    
    // ON VERIF SI LE VOTE EST BIEN OUVERT SINON C'EST UN HACKER T'AS VU

    const verifIsOpen = "SELECT * FROM elections WHERE id_election = $1 AND ouvert = true AND resultats_visibles = false"
    const resultVerifIsOpen = await client.query({
      text: verifIsOpen,
      values: [id_election]
    })
    
    if (resultVerifIsOpen.rowCount !== 0) {

      // ON VERIF S'IL A DEJA VOTE OU NON

      const verifAVote = "SELECT * FROM avote WHERE id_election = $1 AND num_carte_electeur = $2"
      const resultVerifAVote = await client.query({
        text: verifAVote,
        values: [id_election, num_carte_electeur]
      })

      if (resultVerifAVote.rowCount === 0) {


        // AJOUT DU VOTE DANS BUREAUDEVOTE

        const getNbrVoteBureau = "SELECT nbr_total_votants FROM bureaudevote WHERE code_postal = $1"
        const resultGetNbrVoteBureau = await client.query({
          text: getNbrVoteBureau,
          values: [code_postal]
        })

        const nbr_total_votants = resultGetNbrVoteBureau.rows[0].nbr_total_votants

        const addVoteToBureau = "UPDATE bureaudevote SET nbr_total_votants = $1 + 1 WHERE code_postal = $2"
        await client.query({
          text: addVoteToBureau,
          values: [nbr_total_votants, code_postal]
        })

        // CREATION DE LA TABLE AVOTE

        const createAVote = "INSERT INTO AVote VALUES ($1, $2)"
        await client.query({
          text: createAVote,
          values: [id_election, num_carte_electeur]
        })

        // AJOUT DU VOTE A LA LISTE

        const getNbrVoteListe = "SELECT nbr_votes FROM liste WHERE id_liste = $1 and id_election = $2"
        const resultGetNbrVoteListe = await client.query({
          text: getNbrVoteListe,
          values: [id_liste, id_election]
        })

        const nbr_votes = resultGetNbrVoteListe.rows[0].nbr_votes

        const addVoteToListe = "UPDATE liste SET nbr_votes = $1 + 1 WHERE id_liste = $2 and id_election = $3"
        await client.query({
          text: addVoteToListe,
          values: [nbr_votes, id_liste, id_election]
        })
        setTimeout(() => res.json({popup: "Le vote a été pris en compte ! Merci de votre participation !"}), 500)
      }
      else {
        setTimeout(() => res.json({popup: "Vous avez déjà voté, vous ne pouvez pas voter plusieurs fois !"}), 500)
      }
    }
    else {
      setTimeout(() => res.json({popup: "Les votes ne sont pas ouvert !"}), 500)
    }
  }
  else {
    res.status(401).json({message: "L'utilisateur n'est pas connecté ! "})
  }
})

// POUR ADMIN ZEBI

router.post('/admin/elections', async (req, res) => {  

  if (req.session.admin) {
    const typeSort = req.body.typeSort
    const searchName = "%" + req.body.searchName + "%"
    const id_admin = req.session.adminId
  
    if (typeSort === "noSort") {
      const sql = "SELECT * FROM public.elections NATURAL JOIN public.liste NATURAL JOIN public.candidat WHERE resultats_visibles = false AND id_admin = $1 ORDER BY id_election"
      const result = await client.query({
        text: sql,
        values: [id_admin]
      })
      res.json({elections: result.rows})
    }
    else if (typeSort === "sortBySearch") {
      const sql = "SELECT * FROM public.elections NATURAL JOIN public.liste NATURAL JOIN public.candidat WHERE lower(nom) like lower($1) AND resultats_visibles = false AND id_admin = $2 ORDER BY id_election"
      const result = await client.query({
        text: sql,
        values: [searchName, id_admin]
      })
      res.json({elections: result.rows})
    }
    else {
      res.status(401).json({message: "Le type de tri n'est pas accepté ! "})
    }
  }
  else {
    res.status(401).json({message: "L'utilisateur n'est pas connecté ! "})
  }


})

router.post('/admin/resultats', async (req, res) => {  

  if (req.session.admin) {
    const typeSort = req.body.typeSort
    const searchName = "%" + req.body.searchName + "%"
    const id_admin = req.session.adminId
  
    if (typeSort === "noSort") {
      const sql = "SELECT * FROM public.elections NATURAL JOIN public.liste NATURAL JOIN public.candidat WHERE resultats_visibles = true AND id_admin = $1 ORDER BY id_election"
      const result = await client.query({
        text: sql,
        values: [id_admin]
      })
      res.json({elections: result.rows})
    }
    else if (typeSort === "sortBySearch") {
      const sql = "SELECT * FROM public.elections NATURAL JOIN public.liste NATURAL JOIN public.candidat WHERE lower(nom) like lower($1) AND resultats_visibles = true AND id_admin = $2 ORDER BY id_election"
      const result = await client.query({
        text: sql,
        values: [searchName, id_admin]
      })
      res.json({elections: result.rows})
    }
    else {
      res.status(401).json({message: "Le type de tri n'est pas accepté ! "})
    }
  }
  else {
    res.status(401).json({message: "L'utilisateur n'est pas connecté ! "})
  }
})

router.post('/admin/elections/openVote', async (req, res) => {   

  if (req.session.admin) {

    const id_election = req.body.id_election
    const sql = "UPDATE elections SET ouvert = true, resultats_visibles = false WHERE id_election = $1"
    const result = await client.query({
      text: sql,
      values: [id_election]
    })
    res.json({popup: "Les votes sont ouverts pour cette élection !"})
  }  
  else {
    res.status(401).json({popup: "L'admin n'est pas connecté !"})
  }
})

router.post('/admin/elections/closeVote', async (req, res) => {   

  if (req.session.admin) {

    const id_election = req.body.id_election
    const sql = "UPDATE elections SET ouvert = false, resultats_visibles = false WHERE id_election = $1"
    const result = await client.query({
      text: sql,
      values: [id_election]
    })
    res.json({popup: "Les votes sont fermés pour cette élection !"})
  }  
  else {
    res.status(401).json({popup: "L'admin n'est pas connecté !"})
  }
})

router.post('/admin/elections/showResult', async (req, res) => {   

  if (req.session.admin) {

    const id_election = req.body.id_election
    const sql = "UPDATE elections SET ouvert = false, resultats_visibles = true WHERE id_election = $1"
    const result = await client.query({
      text: sql,
      values: [id_election]
    })
    res.json({popup: "Les résultats sont visibles pour cette élection !"})
  }  
  else {
    res.status(401).json({popup: "L'admin n'est pas connecté !"})
  }
})

router.post('/admin/elections/nbrVotant', async (req, res) => {  

  if (req.session.admin) {

    const id_election = req.body.id
    const getTotalVote = "SELECT count(*) FROM avote WHERE id_election = $1"
    const resultGetTotalVote = await client.query({
      text: getTotalVote,
      values: [id_election]
    })

    res.json({totalVote: resultGetTotalVote.rows[0].count})
  }
})

router.post('/admin/resultats/hideResult', async (req, res) => {   

  if (req.session.admin) {

    const id_election = req.body.id_election
    const sql = "UPDATE elections SET ouvert = false, resultats_visibles = false WHERE id_election = $1"
    const result = await client.query({
      text: sql,
      values: [id_election]
    })
    res.json({popup: "Les résultats sont cachés pour cette élection !"})
  }  
  else {
    res.status(401).json({popup: "L'admin n'est pas connecté !"})
  }
})

router.post('/admin/resultats/generate', async (req, res) => {   

  if (req.session.admin) {

    // CREATION DE LA NOUVELLE ELECTION

    const oldElection = req.body.oldElection
    const newName = req.body.newName
    const newDate = req.body.newDate
    const newTour = oldElection.tour + 1
    const previousTour = oldElection.tour
    const type = oldElection.type
    const id_admin = req.session.adminId

    const createElection = "INSERT INTO elections (nom, date, tour, tour_precedent, type_election, id_admin, ouvert, resultats_visibles) VALUES ($1, $2, $3, $4, $5, $6, false, false)"
    await client.query({
      text: createElection,
      values: [newName, newDate, newTour, previousTour, type, id_admin]
    })

    // CREATION DES LISTES QUI ONT GAGNE LE PREMIER TOUR

    const getIdElection = "SELECT id_election FROM elections WHERE nom = $1 AND date = $2 AND tour = $3"
    const result = await client.query({
      text: getIdElection,
      values: [newName, newDate, newTour]
    })

    const id_election = result.rows[0].id_election

    for(let j = 0; j < 2; j++) {
      let maxVote = -1
      for (let i = 0; i < oldElection.listes.length; i++) {
        if (maxVote < oldElection.listes[i].nbr_votes) {
          maxVote = oldElection.listes[i].nbr_votes  // On récupère les 2 qui ont eu le plus de vote
        }
      }
  
      let index = (element) => element.nbr_votes === maxVote
      let position = oldElection.listes.findIndex(index)
      
      // Création de la liste

      let createListe = "INSERT INTO liste (nom_liste, id_election, nbr_votes) VALUES ($1, $2, 0)"
      await client.query({
        text: createListe,
        values: [oldElection.listes[position].nom_liste, id_election]
      })

      let getIdListe = "SELECT id_liste FROM liste WHERE nom_liste = $1 AND id_election = $2 AND nbr_votes = 0"
      let resultGetIdListe = await client.query({
        text: getIdListe,
        values: [oldElection.listes[position].nom_liste, id_election]
      })

      let id_liste = resultGetIdListe.rows[0].id_liste

      let createCandidat = "INSERT INTO candidat (id_liste, nom_complet) VALUES ($1, $2)"
      await client.query({
        text: createCandidat,
        values: [id_liste, oldElection.listes[position].candidats[0].nom_complet]
      })

      oldElection.listes.splice(position, 1)
    }

    // CREATION DES CANDIDATS

    res.json({popup: "Le 2nd tour de l'éléction présidentielle a été créée !"})
  }
  else {
    res.status(401).json({popup: "L'admin n'est pas connecté !"})
  }
})