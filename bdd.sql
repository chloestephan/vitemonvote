------------------------------------------------------------
--        Script Postgre 
------------------------------------------------------------

CREATE TYPE TypeElection AS ENUM ('Municipales','Cantonales','Regionales','Legislatives','Presidentielle','Europeennes','Referundum');


------------------------------------------------------------
-- Table: Admins
------------------------------------------------------------

CREATE TABLE public.Admins(
	id         SERIAL ,
	email      VARCHAR (50) NOT NULL ,
	password   VARCHAR NOT NULL  ,
	CONSTRAINT Admins_PK PRIMARY KEY (id)
)WITHOUT OIDS;


-------------------------------------------------------------
-- Table: Electeur
-------------------------------------------------------------

CREATE TABLE public.Electeur(
        num_carte_electeur Varchar (50) NOT NULL ,
        email            Varchar (50) NOT NULL ,
        password         Varchar ,
        code_postal       Varchar (50) NOT NULL 
	,CONSTRAINT Electeur_PK PRIMARY KEY (num_carte_electeur)
)WITHOUT OIDS;

------------------------------------------------------------
-- Table: Elections
------------------------------------------------------------

CREATE TABLE public.Elections(
	id_election      SERIAL ,
	nom		         VARCHAR (50) NOT NULL ,
	date             DATE NOT NULL ,
	tour             INT NOT NULL ,
	tour_precedent   INT NULL ,
	type_election    TYPEELECTION NOT NULL  ,
	id_admin         INT NOT NULL ,
	ouvert           BOOL NOT NULL ,
	resultats_visibles  BOOL NOT NULL ,

	CONSTRAINT Elections_PK PRIMARY KEY (id_election) ,
	CONSTRAINT elections_Admin_FK FOREIGN KEY (id_admin) REFERENCES public.Admins(id) ,
	CONSTRAINT elctions_elections_FK FOREIGN KEY (id_election) REFERENCES public.Elections(id_election)
)WITHOUT OIDS;


------------------------------------------------------------
-- Table: Liste
------------------------------------------------------------

CREATE TABLE public.Liste(
	id_liste          SERIAL ,
	nom_liste   VARCHAR (50) NOT NULL  ,
	id_election   INT  NOT NULL ,
	nbr_votes   INT  NOT NULL  ,

	CONSTRAINT Liste_PK PRIMARY KEY (id_liste)

	,CONSTRAINT Liste_BureauDeVote_FK FOREIGN KEY (id_election) REFERENCES public.Elections(id_election)
)WITHOUT OIDS;


------------------------------------------------------------
-- Table: Candidat
------------------------------------------------------------

CREATE TABLE public.Candidat(
	id_liste      INT NOT NULL ,
	nom_complet   VARCHAR (50) NOT NULL  ,
	CONSTRAINT Candidat_PK PRIMARY KEY (id_liste, nom_complet)
)WITHOUT OIDS;


------------------------------------------------------------
-- Table: BureauDeVote
------------------------------------------------------------

CREATE TABLE public.BureauDeVote(
	code_postal       Varchar (50) NOT NULL ,
	nbr_total_votants   INT  NOT NULL  ,
	CONSTRAINT BureauDeVote_PK PRIMARY KEY (code_postal)
)WITHOUT OIDS;


------------------------------------------------------------
-- Table: AVote
------------------------------------------------------------

CREATE TABLE public.AVote(
	id_election   INT NOT NULL ,
	num_carte_electeur   Varchar (50) NOT NULL ,
	CONSTRAINT Votants_PK PRIMARY KEY (id_election,num_carte_electeur)

	,CONSTRAINT Votants_Elections_FK FOREIGN KEY (id_election) REFERENCES public.Elections(id_election)
	,CONSTRAINT Votants_Electeur0_FK FOREIGN KEY (num_carte_electeur) REFERENCES public.Electeur(num_carte_electeur)
)WITHOUT OIDS;


------------------------------------------------------------
-- Table: Organise
------------------------------------------------------------

CREATE TABLE public.Organise(
	id_election   INT  NOT NULL ,
	code_postal_bureau     Varchar (50)  NOT NULL  ,
	CONSTRAINT Organise_PK PRIMARY KEY (id_election,code_postal_bureau)

	,CONSTRAINT Organise_Elections_FK FOREIGN KEY (id_election) REFERENCES public.Elections(id_election)
	,CONSTRAINT Organise_BureauDeVote0_FK FOREIGN KEY (code_postal_bureau) REFERENCES public.BureauDeVote(code_postal)
)WITHOUT OIDS;

------------------------------------------------------------
-- Table: Acces
------------------------------------------------------------

CREATE TABLE public.Acces(
	id_admin   INT  NOT NULL ,
	id_election     INT  NOT NULL  ,
	CONSTRAINT Acces_PK PRIMARY KEY (id_admin,id_election)

	,CONSTRAINT Acces_Elections_FK FOREIGN KEY (id_election) REFERENCES public.Elections(id_election)
)WITHOUT OIDS;

INSERT INTO admins(email, password) VALUES ('admin', '$2b$10$OwYLLwN.wross8t4LYhbjOaYCfa158eUxF2t/5YE0adZNHlI4otSe');
INSERT INTO Electeur(num_carte_electeur, email, password, code_postal) VALUES ('111111111', 'admin','$2b$10$OwYLLwN.wross8t4LYhbjOaYCfa158eUxF2t/5YE0adZNHlI4otSe', '75002');