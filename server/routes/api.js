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

/*******************************************/
/*              PARTIE ADMIN               */
/*******************************************/

router.get('/admin/me', async (req, res) => { // S'il n'y a pas d'admin connecté, l'utilisateur est envoyé à la page de connexion admin.
  if(req.session.admin === true){
    res.json({admin: true})
    return
  }
  res.json({admin: false})
})

router.post('/admin/login', async (req, res) => { //L'admin rentre son identifiant et son mot de passe pour se connecter.
  const email = req.body.email
  const password = req.body.password
  const sql = "SELECT * FROM admins WHERE email=$1"
  const result = await client.query({
    text: sql,
    values: [email]
  })

  if(result.rowCount === 0){ // Si aucun admin ne correspond à l'email rentré 

    res.json({ popup: "L'email utilisé et/ou le mot de passe sont incorrects !"})
    return

  }

  if (! await bcrypt.compare(password, result.rows[0].password)){ // Si le mot de passe est incorrect

    res.json({connected: false, popup: "L'email et/ou le mot de passe sont incorrects !"})
    return

  }

  req.session.adminId = result.rows[0].id
  req.session.admin = true
  
  res.json({connected: true, message: 'You are now logged in as an admin.'}) // Si les données rentrées sont bonnes, l'admin est connecté.
})

router.post('/admin/logout', async (req, res) => { // L'utilisateur se déconnecte.
  const email = req.body.email
  const password = req.body.password
  req.email = ''
  req.password = ''
  req.session.adminId = null
  req.session.admin = false 
  res.json({connected: false, message: 'You just logged out.'})
})

//admin management
router.post('/admin/register', async (req, res) =>{ // Un nouvel admin est créé 
  if (req.session.admin === true){
    const email = req.body.email
    const password = req.body.password

    const sql1 = "SELECT * FROM admins WHERE email=$1"
    const result1 = await client.query({
      text: sql1,
      values: [email] // ici name et description ne sont pas concaténées à notre requête
    })

    if(result1.rowCount !== 0){
      res.json({ popup: "Cet admin existe déjà !"}) // on ne peux pas créer deux fois le meme admin.
      return
    }

    const hash = await bcrypt.hash(password, 10)

    const sql2 = "INSERT INTO admins (email, password) VALUES ($1, $2)" // Les informations sont rentrées dans la bdd
    await client.query({
      text: sql2,
      values: [email, hash]
    })

    const result2 = await client.query({text: "SELECT id, email FROM admins"})
    res.json({admin: result2.rows, popup: "L'admin a bien été créé(e) !"})
    return
  }
  res.status(400).json({message: "L'utilisateur n'a pas les droits administrateurs."})
})

router.delete('/admin/:id', async (req, res) => { // Supprimer un compte admin
  if (req.session.admin === true){
    const deleteAdmin = req.params.id
    if (deleteAdmin === req.session.adminId){
      res.status(401).json({message: "You can't delete the current admin"}) // Le compte actif ne peut pas être supprimé
      return
    }
    else if (deleteAdmin === '1') {
      const result = await client.query({text: "SELECT id, email FROM admins"})
      res.json({admin: result.rows, popup: "Vous ne pouvez pas supprimer le super admin !"}) // L'admin principal ne peux pas être supprimé.
      return      
    }
    const haveElection = "SELECT * FROM acces WHERE id_election = $1" 
    const resultHaveElection = await client.query({
      text: haveElection,
      values: [deleteAdmin]
    })
    
    if (resultHaveElection.rowCount === 0) {
      const sql = "DELETE FROM admins WHERE id=$1" // les informations sont supprimées de la bdd.
      await client.query({
        text: sql,
        values: [deleteAdmin]
      })

      const result = await client.query({text: "SELECT id, email FROM admins"})
      res.json({admin: result.rows, popup: "L'admin a bien été supprimé(e) !"})
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
      res.json({admin: result.rows, popup: "L'admin a bien été supprimé(e) !"})
      return
    }
  }
  res.status(400).json({message: "L'utilisateur n'a pas les droits administrateurs."})
})

router.get('/admin/admins', async (req, res) =>{ // Pour savoir qui est connecté parmi les admins
  if (req.session.admin === true){
    const result = await client.query({text: "SELECT id, email FROM admins"})
    res.json({currentId: req.session.adminId, administrateurs: result.rows})
    return
  }
  res.status(400).json({message: "L'utilisateur n'a pas les droits administrateurs."})
})

// Pour récupérer les élécteurs selon la région séléctionnée et leur code postal :
function codePostalRegion (region) {
  if (region === 'Bretagne') {
    return "SELECT code_postal FROM bureaudevote WHERE code_postal LIKE '22%' OR code_postal LIKE '29%' OR code_postal LIKE '35%' OR code_postal LIKE '56%'"
  }
  else if (region === 'Ile-de-France') {
    return "SELECT code_postal FROM bureaudevote WHERE code_postal LIKE '75%' OR code_postal LIKE '77%' OR code_postal LIKE '78%' OR code_postal LIKE '91%' OR code_postal LIKE '92%' OR code_postal LIKE '93%' OR code_postal LIKE '94%' OR code_postal LIKE '95%'"
  }
  else if (region === 'Normandie') {
    return "SELECT code_postal FROM bureaudevote WHERE code_postal LIKE '14%' OR code_postal LIKE '27%' OR code_postal LIKE '50%' OR code_postal LIKE '61%' OR code_postal LIKE '76%'"
  }
  else if (region === 'Hauts-de-France') {
    return "SELECT code_postal FROM bureaudevote WHERE code_postal LIKE '02%' OR code_postal LIKE '59%' OR code_postal LIKE '60%' OR code_postal LIKE '62%' OR code_postal LIKE '80%'"
  }
  else if (region === 'Grand Est') {
    return "SELECT code_postal FROM bureaudevote WHERE code_postal LIKE '08%' OR code_postal LIKE '10%' OR code_postal LIKE '51%' OR code_postal LIKE '52%' OR code_postal LIKE '54%' OR code_postal LIKE '55%' OR code_postal LIKE '57%' OR code_postal LIKE '67%' OR code_postal LIKE '68%' OR code_postal LIKE '88%'"
  }
  else if (region === 'Pays de la Loire') {
    return "SELECT code_postal FROM bureaudevote WHERE code_postal LIKE '44%' OR code_postal LIKE '49%' OR code_postal LIKE '53%' OR code_postal LIKE '72%' OR code_postal LIKE '85%'"
  }
  else if (region === 'Centre-Val de Loire') {
    return "SELECT code_postal FROM bureaudevote WHERE code_postal LIKE '18%' OR code_postal LIKE '28%' OR code_postal LIKE '36%' OR code_postal LIKE '37%' OR code_postal LIKE '41%' OR code_postal LIKE '45%'"
  }
  else if (region === 'Bourgogne-Franche-Comté') {
    return "SELECT code_postal FROM bureaudevote WHERE code_postal LIKE '21%' OR code_postal LIKE '25%' OR code_postal LIKE '39%' OR code_postal LIKE '58%' OR code_postal LIKE '70%' OR code_postal LIKE '71%' OR code_postal LIKE '89%' OR code_postal LIKE '90%'"
  }
  else if (region === 'Nouvelle-Aquitaine') {
    return "SELECT code_postal FROM bureaudevote WHERE code_postal LIKE '16%' OR code_postal LIKE '17%' OR code_postal LIKE '19%' OR code_postal LIKE '23%' OR code_postal LIKE '24%' OR code_postal LIKE '33%' OR code_postal LIKE '40%' OR code_postal LIKE '47%' OR code_postal LIKE '64%' OR code_postal LIKE '79%' OR code_postal LIKE '86%' OR code_postal LIKE '87%'"
  }
  else if (region === 'Auvergne-Rhône-Alpes') {
    return "SELECT code_postal FROM bureaudevote WHERE code_postal LIKE '01%' OR code_postal LIKE '03%' OR code_postal LIKE '07%' OR code_postal LIKE '15%' OR code_postal LIKE '26%' OR code_postal LIKE '38%' OR code_postal LIKE '42%' OR code_postal LIKE '43%' OR code_postal LIKE '63%' OR code_postal LIKE '69%' OR code_postal LIKE '73%' OR code_postal LIKE '74%'"
  }
  else if (region === 'Occitanie') {
    return "SELECT code_postal FROM bureaudevote WHERE code_postal LIKE '09%' OR code_postal LIKE '11%' OR code_postal LIKE '12%' OR code_postal LIKE '30%' OR code_postal LIKE '31%' OR code_postal LIKE '32%' OR code_postal LIKE '34%' OR code_postal LIKE '46%' OR code_postal LIKE '48%' OR code_postal LIKE '65%' OR code_postal LIKE '66%' OR code_postal LIKE '81%' OR code_postal LIKE '82%'"
  }
  else if (region === 'Provence-Alpes-Côte d\'Azur') {
    return "SELECT code_postal FROM bureaudevote WHERE code_postal LIKE '04%' OR code_postal LIKE '05%' OR code_postal LIKE '06%' OR code_postal LIKE '13%' OR code_postal LIKE '83%' OR code_postal LIKE '84%'"
  }
  else if (region === 'Corse') {
    return "SELECT code_postal FROM bureaudevote WHERE code_postal LIKE '20%'"
  }
  else if (region === 'La Réunion') {
    return "SELECT code_postal FROM bureaudevote WHERE code_postal LIKE '974%'"
  }
  else if (region === 'Mayotte') {
    return "SELECT code_postal FROM bureaudevote WHERE code_postal LIKE '976%'"
  }
  else if (region === 'Guyane') {
    return "SELECT code_postal FROM bureaudevote WHERE code_postal LIKE '973%'"
  }
  else if (region === 'Martinique') {
    return "SELECT code_postal FROM bureaudevote WHERE code_postal LIKE '972%'"
  }
  else if (region === 'Guadeloupe') {
    return "SELECT code_postal FROM bureaudevote WHERE code_postal LIKE '971%'"
  }
}

router.post('/admin/election', async(req, res) =>{ // Création d'une éléction selon le choix du type d'éléction.
  if (req.session.admin === true){
    const nom = req.body.nom
    const date = req.body.date
    const tour = req.body.tour
    const typeElection = req.body.typeElection
    
    let tour_precedent = null
    if (tour !== 1){
      tour_precedent = req.body.precedent_tour
    }
    let nomListes
    let candidats
    if(typeElection!=='Referundum'){ //Si c'est un référendum, les listes seront "oui" et "non".
      nomListes = req.body.nomListes
      candidats = req.body.candidats
    }
    else{
      nomListes = ['Oui', 'Non']
    }

    const verifBureauDeVote = "SELECT * FROM bureauDeVote"
    const resultVerifBureauDeVote = await client.query({
      text: verifBureauDeVote,
    })

    if (resultVerifBureauDeVote.rowCount === 0) { // Vérification des bureaux de vote

      res.json({message: "Les bureaux de vote n'ont pas été chargés ! Veuillez les importer dans l'onglet électeurs avant de créer une élection !"})                  // POPUP
      return

    }

    if (typeElection === 'Municipales') {
      code_postal = req.body.code_postaux[0]
      if (code_postal.length !== 5) {  // On regarde si la syntaxe du codePostal est correcte
        res.json({message: 'Le code postal est incorrect !'})                  // POPUP
        return
      }
      else {
        for (let i = 0; i < code_postal.length; i++) {
          if (!isDigit(code_postal[i])) {
            res.json({message: 'Le code postal est incorrect !'})                  // POPUP
            return
          }
        }
      }
    }
    //Insertion d'une nouvelle éléction dans la bdd
    let sql = "INSERT INTO elections(nom, date, tour, tour_precedent, type_election, id_admin, ouvert, resultats_visibles) VALUES ($1, $2, $3, $4, $5, $6, false, false) RETURNING id_election"
    let result = await client.query({
      text: sql,
      values: [nom, date, tour, tour_precedent, typeElection, req.session.adminId]
    })

    const id_election = result.rows[0].id_election

    // récupération des codes postaux des élécteurs

    let code_postaux = []
    if(typeElection === "Presidentielle" || typeElection === "Europeennes" || typeElection === "Referundum"){ // Ici, tout le monde vote.
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
    }

    if(typeElection === "Regionales") { // Pour les regionales, nous avons besoin de plusieurs codes postaux dans une seule région

      sql = codePostalRegion(req.body.region)
      result = await client.query({
        text: sql,
        values: code_postaux
      })

      code_postaux = []

      for(let i = 0; i < result.rowCount; i++){
        code_postaux.push(result.rows[i].code_postal)
      }
    }
    for(let i = 0; i < code_postaux.length; i++){ // Recupere le code postal du bureau
      sql = "INSERT INTO organise VALUES ($1, $2)"
      await client.query({
        text: sql,
        values: [id_election, code_postaux[i]]
      })
    }

    for(let i = 0; i < nomListes.length; i++){ // initialisation des listes

      sql = "INSERT INTO liste(nom_liste, id_election, nbr_votes) VALUES ($1, $2, $3) RETURNING id_liste"
      result = await client.query({
        text: sql,
        values: [nomListes[i], id_election, 0]
      })
      if(typeElection!=='Referundum'){
        const id_liste = result.rows[0].id_liste
        for(let j = 0; j < candidats[i].length; j++){
          sql = "INSERT INTO candidat VALUES ($1, $2)"
          await client.query({
            text: sql,
            values: [id_liste, candidats[i][j]]
          })
        }
      }

    }

    sql = "INSERT INTO acces VALUES ($1, $2)" // Donne l'acces à une éléction à l'administrateur actuellement connecté.
    await client.query({
      text: sql,
      values: [req.session.adminId, id_election]
    })
        
    res.json({message: "L'élection a bien été créée !"})
    return
  }
  res.status(400).json({message: "L'utilisateur n'a pas les droits administrateurs."})
})

router.post('/admin/electeurs', async(req, res) => { // Importer des élécteurs
  if (req.session.admin === true){
    const electeurs = req.body.electeurs
    
    const sql = "INSERT INTO electeur VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING"// Insert dans la bdd l'identifiant, le mail et le code postal de l'élécteur
    for(let i = 0; i < electeurs.length; i++){

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

router.post('/admin/electeur', async(req, res) => { // Rechercher un élécteur
  if (req.session.admin === true){
    const num_carte_electeur = req.body.num_carte_electeur
    const email = req.body.email
    const code_postal = req.body.code_postal
    
    // Requete SQL pour retrouver un élécteur
    const sql = "SELECT * FROM electeur WHERE lower(num_carte_electeur) LIKE lower($1) AND lower(email) LIKE lower($2) AND code_postal LIKE $3"
    const result = await client.query({
      text: sql,
      values: [num_carte_electeur + "%", email + "%", code_postal + "%"]
    })
    res.json(result.rows)
    return
  }
  res.status(400).json({message: "L'utilisateur n'a pas les droits administrateurs."})
})

router.delete('/admin/electeur/:id', async (req, res) => { // Supprimer un élécteur
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

router.post('/admin/bureaux', async (req, res) => { // Importer les bureaux de vote
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

router.post('/admin/elections', async (req, res) => { // Récuperation des informations de la bdd pour l'affichage des éléctions

  if (req.session.admin) {
    const typeSort = req.body.typeSort
    const searchName = "%" + req.body.searchName + "%"
    const id_admin = req.session.adminId

    if (typeSort === "noSort") { // Pas d'ordre
      const sql = "SELECT * FROM public.elections WHERE id_admin = $1 ORDER BY id_election"
      const result = await client.query({
        text: sql,
        values: [id_admin]
      })
      res.json({elections: result.rows})
    }
    else if (typeSort === "sortBySearch") { // Rehercher une éléction
      const sql = "SELECT * FROM public.elections WHERE lower(nom) like lower($1) AND id_admin = $2 ORDER BY id_election"
      const result = await client.query({
        text: sql,
        values: [searchName, id_admin]
      })
      res.json({elections: result.rows})
    }
    else if (typeSort === "sortByVote") { // Trier par vote
      const sql = "SELECT * FROM public.elections WHERE resultats_visibles = false AND id_admin = $1 ORDER BY id_election"
      const result = await client.query({
        text: sql,
        values: [id_admin]
      })
      res.json({elections: result.rows})
    }
    else if (typeSort === "sortByResult") { // Trier par résultats
      const sql = "SELECT * FROM public.elections WHERE resultats_visibles = true AND id_admin = $1 ORDER BY id_election"
      const result = await client.query({
        text: sql,
        values: [id_admin]
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

router.post('/admin/elections/detailElection', async (req, res) => { //Afficher l'éléction en détail

  if (req.session.admin) {
    const election = req.body.election
    const id_admin = req.session.adminId

    if (election.type === "Referundum") { // Affichage différent si l'éléction est un référendum
      const sql = "SELECT * FROM public.elections NATURAL JOIN public.liste WHERE id_admin = $1 AND id_election = $2 ORDER BY nbr_votes DESC"
      const result = await client.query({
        text: sql,
        values: [id_admin, election.id]
      })
      res.json({elections: result.rows})
    }
    else if (election.type !== undefined) {
      const sql = "SELECT * FROM public.elections NATURAL JOIN public.liste NATURAL JOIN public.candidat WHERE id_admin = $1 AND id_election = $2 ORDER BY nbr_votes DESC"
      const result = await client.query({
        text: sql,
        values: [id_admin, election.id]
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

router.post('/admin/elections/openVote', async (req, res) => { // Ouvrir les votes sur une élection

  if (req.session.admin) {

    const id_election = req.body.id_election
    const type = req.body.type_election
    const tour = req.body.tour_election
    const nom = req.body.nom_election

    const sql = "UPDATE elections SET ouvert = true, resultats_visibles = false WHERE id_election = $1"
    const result = await client.query({
      text: sql,
      values: [id_election]
    })

    // On recherche les mails des élécteurs afin de leur annoncer l'ouverture de l'élection

    let getEmail = ""

    if (type === 'Presidentielle' || type === 'Referundum' || type === 'Europeennes') {
      getEmail = "SELECT email FROM electeur"
    }
    else {
      const getCodePostal = "SELECT code_postal_bureau FROM organise WHERE id_election = $1"
      const resultGetCodePostal = await client.query({
        text: getCodePostal,
        values: [id_election]
      })
      code_postaux = resultGetCodePostal.rows
  
      getEmail = "SELECT email FROM electeur WHERE "
  
      for (let i = 0; i < code_postaux.length; i++) {
        getEmail += "code_postal = '" + code_postaux[i].code_postal_bureau + "' "
        if (i !== code_postaux.length - 1) {
          getEmail += "OR "
        }
      }    
    }
  
    const resultGetEmail = await client.query({
      text: getEmail,
    })

    email = resultGetEmail.rows

    for (let i = 0; i < email.length; i++) {
      
      const splitEmail = email[i].email.split('@')  // On regarde si la syntaxe du mail est correcte

      if (!(splitEmail[0] === "" || splitEmail[1] === undefined || splitEmail[1] === "" || splitEmail[2] !== undefined)) {
        let transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: 'vitemonvote@gmail.com',
            pass: 'E8PFMEgb#nS#',
          }
        })

        // Syntaxe du mail, puis envoi du mail
      
        let mailOptions = {
          from: 'vitemonvote@gmail.com',
          to: email[i].email,
          subject: 'Ouverture des votes - ViteMonVote',
          text: "Nous tenons à vous dire que l'élection : " + nom + " est ouverte, vous pouvez dès maintenant voter sur notre site."
        }
      
        transporter.sendMail(mailOptions, function(err, data) {
          if (err) {
            console.log("Error occurs", err)
            res.json({popup: 'Le mail donné n\'existe pas !'})
            return
          } 
        })
      }
    }
    res.json({popup: "Les votes sont ouverts pour cette élection !"})
  }
  else {
    res.status(401).json({popup: "L'admin n'est pas connecté !"})
  }
})

router.post('/admin/elections/closeVote', async (req, res) => { // Fermeture de l'élection

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

router.post('/admin/elections/showResult', async (req, res) => { // Affichage des résultats de l'élection

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

router.post('/admin/elections/nbrVotant', async (req, res) => { // Retourne le nombre de personnes ayant voté sur une élection

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

router.post('/admin/elections/hideResult', async (req, res) => { // Cacher les résultats

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

router.post('/admin/elections/delete', async (req, res) => { // Supprimer une élection

  if (req.session.admin) {

    const electionToDelete = req.body.electionToDelete

    // ON SUPPRIME LES CANDIDATS

    if (electionToDelete.type !== 'Referundum') {
      for (let i = 0; i < electionToDelete.listes.length; i++) {

        let deleteCandidat = "DELETE FROM candidat where id_liste = $1"
        await client.query({
          text: deleteCandidat,
          values: [electionToDelete.listes[i].id_liste]
        })

      }
    }

    // ON SUPRRIME LES LISTES

    let deleteListe = "DELETE FROM liste where id_election = $1"
    await client.query({
      text: deleteListe,
      values: [electionToDelete.id]
    })

    // ON SUPPRIME LES AVOTE

    let deleteVote = "DELETE FROM avote where id_election = $1"
    await client.query({
      text: deleteVote,
      values: [electionToDelete.id]
    })

    // ON SUPPRIME LES ORGANISE

    let deleteOrganise = "DELETE FROM organise where id_election = $1"
    await client.query({
      text: deleteOrganise,
      values: [electionToDelete.id]
    })

    // ON SUPPRIME LES ACCES

    let deleteAcces = "DELETE FROM acces where id_election = $1"
    await client.query({
      text: deleteAcces,
      values: [electionToDelete.id]
    })

    // ON SUPPRIME L'ELECTION

    let deleteElection = "DELETE FROM elections where id_election = $1"
    await client.query({
      text: deleteElection,
      values: [electionToDelete.id]
    })

    res.json({popup: "L'élection a bien été supprimée !"})
  }
  else {
    res.status(401).json({popup: "L'admin n'est pas connecté !"})
  }
})

router.post('/admin/elections/generate', async (req, res) => {

  if (req.session.admin) {

    // CREATION DE LA NOUVELLE ELECTION

    const oldElection = req.body.oldElection
    const newName = req.body.newName
    const newDate = req.body.newDate
    const newTour = oldElection.tour + 1
    const previousTour = oldElection.tour
    const type = oldElection.type
    const id_admin = req.session.adminId

    const getTotalVote = "SELECT count(*) FROM avote WHERE id_election = $1"
    const resultGetTotalVote = await client.query({
      text: getTotalVote,
      values: [oldElection.id]
    })

    const totalVote = resultGetTotalVote.rows[0].count

    if (oldElection.type === "Presidentielle" || oldElection.type === "Regionales" || oldElection.type === "Municipales") {

      for (let i = 0; i < oldElection.listes.length; i++) {
        if (totalVote <= oldElection.listes[i].nbr_votes * 2) {
          res.json({popup: "Nous ne pouvons pas créer un 2nd tour, il y a déjà un gagnant dans cette élection !"})
          return
        }
      }

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

      if (oldElection.type === "Presidentielle") {
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
      }
      else if (oldElection.type === "Regionales" || oldElection.type === "Municipales") {

        for(let i = 0; i < oldElection.listes.length; i++) {

          if (totalVote / 10 <= oldElection.listes[i].nbr_votes) {

            // Création de la liste

            let createListe = "INSERT INTO liste (nom_liste, id_election, nbr_votes) VALUES ($1, $2, 0)"
            await client.query({
              text: createListe,
              values: [oldElection.listes[i].nom_liste, id_election]
            })

            let getIdListe = "SELECT id_liste FROM liste WHERE nom_liste = $1 AND id_election = $2 AND nbr_votes = 0"
            let resultGetIdListe = await client.query({
              text: getIdListe,
              values: [oldElection.listes[i].nom_liste, id_election]
            })

            let id_liste = resultGetIdListe.rows[0].id_liste

            for (let j = 0; j < oldElection.listes[i].candidats.length; j++) {
              let createCandidat = "INSERT INTO candidat (id_liste, nom_complet) VALUES ($1, $2)"
              await client.query({
                text: createCandidat,
                values: [id_liste, oldElection.listes[i].candidats[j].nom_complet]
              })
            }
          }
        }
      }
      res.json({popup: "Le 2nd tour de l'éléction a été créé !"})
    }
  }
  else {
    res.status(401).json({popup: "L'admin n'est pas connecté !"})
  }
})

/*******************************************/
/*              PARTIE CLIENT              */
/*******************************************/

router.get('/user/me', async (req, res) => { // On vérifie si l'user est connecté ; s'il ne l'est pas, il est renvoyé à la page de connexion
  if(req.session.user === true){
    res.json({user: true})
    return
  }
  res.json({user: false})
})

router.post('/user/logout', async (req, res) => { // Déconnexion de l'utilisateur
  const email = req.body.email
  const password = req.body.password
  req.email = ''
  req.password = ''
  req.session.userId = null
  req.session.user = false
  res.json({connected: false, message: 'You just logged out.'})
})

// Generation de password

function generateP() { // Mot de passe aléatoire qui sera envoyé par mail
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
  let codePostal = req.body.codePostal
  const password = generateP()
  const hash = await bcrypt.hash(password, 10)
  
  if (numCarteElec.length !== 9) {  // On regarde si la syntaxe du num est correcte
    res.json({popup: 'Les informations données sont incorrectes !'})                  // POPUP
    return
  }
  else {
    for (let i = 0; i < numCarteElec.length; i++) {
      if (!isDigit(numCarteElec[i])) {
        res.json({popup: 'Les informations données sont incorrectes !'})                  // POPUP
        return
      }
    }
  }

  if (codePostal.length !== 5) {  // On regarde si la syntaxe du codePostal est correcte
    res.json({popup: 'Les informations données sont incorrectes !'})                  // POPUP
    return
  }
  else {
    for (let i = 0; i < codePostal.length; i++) {
      if (!isDigit(codePostal[i])) {
        res.json({popup: 'Les informations données sont incorrectes !'})                  // POPUP
        return
      }
    }
  }

  const splitEmail = email.split('@')  // On regarde si la syntaxe du mail est correcte

  if (splitEmail[0] === "" || splitEmail[1] === undefined || splitEmail[1] === "" || splitEmail[2] !== undefined) {
    res.json({popup: 'Les informations données sont incorrectes !'})                  // POPUP
    return
  }

  codePostal += '%'

  const sqlVerif = "SELECT * FROM public.Electeur WHERE num_carte_electeur=$1 AND email=$2 AND code_postal like $3"
  const result = await client.query({
    text: sqlVerif,
    values: [numCarteElec, email, codePostal]
  })

  // Création du mail, puis envoi du mail

  if (result.rowCount !== 0) {    
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'vitemonvote@gmail.com',
        pass: 'E8PFMEgb#nS#',
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

router.post('/user/login', async (req, res) => { // Connexion de l'utilisateur
  const email = req.body.email
  const password = req.body.password

  const sql = "SELECT * FROM public.Electeur WHERE email=$1"
  const result = await client.query({
    text: sql,
    values: [email]
  })

  if(result.rowCount === 0){
    res.json({ popup: "L'email utilisé et/ou le mot de passe sont incorrects !"})                // POPUP
    return
  }

  if (! await bcrypt.compare(password, result.rows[0].password)){
    res.json({ popup: "L'email utilisé et/ou le mot de passe sont incorrects !"})                // POPUP
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
  
    if (typeSort === "noSort") { // Pas de tri
      const sql = "SELECT * FROM public.elections NATURAL JOIN organise INNER JOIN electeur on code_postal_bureau = code_postal WHERE ouvert = true AND num_carte_electeur = $1 ORDER BY id_election"
      const result = await client.query({
        text: sql,
        values: [req.session.userId],
      })
      res.json({elections: result.rows})
    }
    else if (typeSort === "sortBySearch") { // Recherche d'une élection
      const sql = "SELECT * FROM public.elections NATURAL JOIN organise INNER JOIN electeur on code_postal_bureau = code_postal WHERE lower(nom) like lower($1) AND ouvert = true AND num_carte_electeur = $2 ORDER BY id_election"
      const result = await client.query({
        text: sql,
        values: [searchName, req.session.userId]
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

router.post('/user/elections/detailElection', async (req, res) => {  // Comme pour le coté admin, affichage des détails de l'élection en cliquant dessus.

  if (req.session.user) {
    const election = req.body.election

    const getAvote = "SELECT * FROM avote WHERE id_election = $1 AND num_carte_electeur = $2"
    const resultGetAvote = await client.query({
      text: getAvote,
      values: [election.id, req.session.userId]
    })

    if (resultGetAvote.rowCount !== 0) { // Si l'utilisateur tente de voter alors qu'il l'a déjà fait :
      res.json({popup: "Vous avez déjà voté, vous ne pouvez pas voter plusieurs fois !"})
      return
    }

    if (election.type === "Referundum") { // Affichage d'un référendum
      const sql = "SELECT * FROM public.elections NATURAL JOIN public.liste WHERE id_election = $1"
      const result = await client.query({
        text: sql,
        values: [election.id]
      })
      res.json({elections: result.rows})
    }
    else if (election.type !== undefined) { // Affichages des autres élections
      const sql = "SELECT * FROM public.elections NATURAL JOIN public.liste NATURAL JOIN public.candidat WHERE id_election = $1"
      const result = await client.query({
        text: sql,
        values: [election.id]
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

// VOTE

router.post('/user/elections/vote', async (req, res) => { // Ce qu'il se passe lorsque l'utilisateur clique sur voter :

  if (req.session.user) {
  
    if (req.session.userId === '111111111') {
      setTimeout(() => res.json({popup: "Vous ne pouvez pas voter avec le compte administrateur"}), 500)
      return
    }

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
    
    // ON VERIF SI LE VOTE EST BIEN OUVERT SINON C'EST UN HACKER

    const verifIsOpen = "SELECT * FROM elections WHERE id_election = $1 AND ouvert = true AND resultats_visibles = false"
    const resultVerifIsOpen = await client.query({
      text: verifIsOpen,
      values: [id_election]
    })
    
    if (resultVerifIsOpen.rowCount !== 0) {

      // IL FAUT VOIR S'IL PEUT VOTER SELON SON CP

      const verifCodePostal = "SELECT * FROM organise WHERE id_election = $1 AND code_postal_bureau = $2"
      const resultVerifCodePostal = await client.query({
        text: verifCodePostal,
        values: [id_election, code_postal]
      })

      if (resultVerifCodePostal.rowCount === 0) {
        setTimeout(() => res.json({popup: "Vous ne pouvez pas voter pour cette élection, vous n'habitez pas dans la bonne région, le bon département !"}), 500)
        return
      }

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

// TRI DES RESULTATS

router.post('/resultats', async (req, res) => {  

    const typeSort = req.body.typeSort
    const searchName = "%" + req.body.searchName + "%"
  
    if (typeSort === "noSort") {
      const sql = "SELECT * FROM public.elections WHERE resultats_visibles = true ORDER BY id_election"
      const result = await client.query({
        text: sql,
      })
      res.json({elections: result.rows})
    }
    else if (typeSort === "sortBySearch") {
      const sql = "SELECT * FROM public.elections WHERE lower(nom) like lower($1) AND resultats_visibles = true ORDER BY id_election"
      const result = await client.query({
        text: sql,
        values: [searchName]
      })
      res.json({elections: result.rows})
    }
    else {
      res.status(401).json({message: "Le type de tri n'est pas accepté ! "})
    }


})

router.post('/resultats/detailElection', async (req, res) => {  // Affichage des résultats pour l'utilisateur

    const election = req.body.election

    if (election.type === "Referundum") {
      const sql = "SELECT * FROM public.elections NATURAL JOIN public.liste WHERE id_election = $1  ORDER BY nbr_votes DESC"
      const result = await client.query({
        text: sql,
        values: [election.id]
      })
      res.json({elections: result.rows})
    }
    else if (election.type !== undefined) {
      const sql = "SELECT * FROM public.elections NATURAL JOIN public.liste NATURAL JOIN public.candidat WHERE id_election = $1 ORDER BY nbr_votes DESC"
      const result = await client.query({
        text: sql,
        values: [election.id]
      })
      res.json({elections: result.rows}) 
    }
    else {
      res.status(401).json({message: "Le type de tri n'est pas accepté ! "})
    }
})

// NBR TOTAL VOTANT

router.post('/resultats/nbrVotant', async (req, res) => {  // Retourne le nombre de votants

  const id_election = req.body.id
  const type_election = req.body.type

  const getTotalVote = "SELECT count(*) FROM avote WHERE id_election = $1" // Compte le nombre de personnes ayant voté
  const resultGetTotalVote = await client.query({
    text: getTotalVote,
    values: [id_election]
  })

  const totalVote = resultGetTotalVote.rows[0].count

  if (type_election === 'Presidentielle' || type_election === 'Referundum' || type_election === 'Europeennes') { // Compte le nombre total d'electeurs
    let getTotalVotants = "SELECT count(*) FROM ELECTEUR"
    const resultGetTotalVotants = await client.query({
      text: getTotalVotants,
    })
    const totalVotants = resultGetTotalVotants.rows[0].count
    const abstention = ( (totalVotants - totalVote) / totalVotants ) * 100

    res.json({totalVote: totalVote, abstention: abstention})
    return
  }
  else {
    const getCodePostal = "SELECT code_postal_bureau FROM organise WHERE id_election = $1" // Compte le nombre d'élécteurs correspondant à une élection
    const resultGetCodePostal = await client.query({
      text: getCodePostal,
      values: [id_election]
    })
    code_postaux = resultGetCodePostal.rows

    let getTotalVotants = "SELECT count(*) FROM electeur WHERE "

    for (let i = 0; i < code_postaux.length; i++) {
      getTotalVotants += "code_postal = '" + code_postaux[i].code_postal_bureau + "' "
      if (i !== code_postaux.length - 1) {
        getTotalVotants += "OR "
      }
    }
    const resultGetTotalVotants = await client.query({
      text: getTotalVotants,
    })
    const totalVotants = resultGetTotalVotants.rows[0].count
    const abstention = ( (totalVotants - totalVote) / totalVotants ) * 100 // Genere l'abstention
    
    res.json({totalVote: totalVote, abstention: abstention})
    return
  }
})