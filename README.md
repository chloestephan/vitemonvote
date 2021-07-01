# Projet MasterCamp - Vite mon Vote

Récapitulatif de l'appel d'offre : "De plus en plus d’entreprises, d’organismes et d’institutions ont désormais recours au fonctionnement en distanciel. D'autres sont encore réticents et n'ont pas franchi le pas.  Ainsi le ministère de l’Intérieur ne propose pas à ce jour de solution pour voter sans se déplacer dans un bureau de vote. Permettre à tout citoyen de voter de façon fiable et sécurisée sans avoir à se déplacer dans un bureau de vote."

# Product environment 

Le projet est accessible sur serveur à l'adresse suivante : http://91.167.32.208:3000/#/ . Pour se connecter en tant qu'administrateur, vous pouvez utiliser les identifiants suivants : "admin", "admin".



Toutefois, si le lien ne fonctionne pas, il est possible de lancer le projet depuis son ordinateur en suivant les étapes suivantes : 

- télécharger le fichier .zip comprenant le projet dans sa totalité.
- Sur PgAdmin 4 pour construire la base de données associée au projet :  
    -> créer une base de données nommée "vitemonvote";  
    -> ouvrir les Query Tools associé à cette base de données;  
    -> trouver le document nommé "bdd.sql" et copier-coller son contenu dans les Query Tools;  
    -> on peut maintenant valider le script SQL en l'éxecutant.

- La base de données est maintenant créée, nous pouvons la peupler en allant directement sur Vite Mon Vote.  
    -> Pour lancer Vite Mon Vote, il faut aller trouver le dossier contenant le projet et lancer la fênetre PowerShell sur ce dossier (maj + clic droit). Ensuite, dans cette fenêtre, entrez les consignes "npm install" puis "npm start".  
    -> Enfin, entrez dans le navigateur souhaité "localhost:3000".  

- Pour peupler la base de données :
    -> Dans la partie "Admin", se connecter à l'aide des identifiants suivant : "admin", "admin".  
    -> Aller dans l'onglet "Electeurs" on nous pouvons maintenant ajouter les électeurs et les bureaux de vote dans les espaces prévus pour à l'aide des documents "electeurs.csv" et "bureaux.csv".  

- La base de données est maintenant créée et peuplée, nous pouvons donc maintenant créer des élections et les manipuler comme nous le souhaitons !

# Explorer Vite Mon Vote

Pour se connecter en tant qu'administrateur, il est possible d'utiliser les indentifiants "admin", "admin".  
Pour se connecter en tant qu'utilisateur, il est aussi possible d'utiliser les identifiants "admin", "admin".

# Contributeurs

Louis Clocher - Nicolas Cresseaux - Tristan Fievet - Maxime Leviel - Chloé Stéphan
