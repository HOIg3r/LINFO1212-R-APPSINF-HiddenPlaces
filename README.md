# LINFO1212 Groupe R Projet Final

---

### Table des matières

<ol>
   <li>Introduction</li>
   <li>Thème du site web</li>
   <li>Prérequis</li>
   <li>Creer la base de données</li>
   <li>Lancer le serveur Host</li>
   <li>Lancer les test dans le CMD</li>

</ol>

### Introduction

---

Le but de ce projet etais de mettre en place un site web dynamique grâce à HTML, CSS et JavaScript, en utilisant comme
base de données [MongoDB](https://www.mongodb.com/) le tout héberger sur un server [Node.JS](https://nodejs.org/en/)

### Thème du site web

---
Notre site web a pour but de réunir les endroits à visiter au moins une fois dans sa vie. Ce site pourra aider de 
futur voyageur à trouver les meilleurs lieux à visiter dans une ville ou pays qu'ils veulent apercevoir. Ils pourront 
aussi par la même occasion visiter des lieux à découvrir autour de chez vous qui sont selon d'autres utilisateurs de 
notre site web des lieux à absolument découvrir une fois dans sa vie.

### Prérequis

---
Afin de lancer notre site web, veuillez télécharger le dossier zip et l'extraire.\
Vous pouvez ensuite installer [Node.JS](https://nodejs.org/en/) et [MongoDB](https://www.mongodb.com/) \
Notre site utilise multiple modules pour fonctionner, en voici la liste :
<ol>
    <li>@jest/globals</li>
    <li>bcryptjs</li>
    <li>body-parser</li>
    <li>consolidate</li>
    <li>express</li>
    <li>express-session</li>
    <li>fs</li>
    <li>hogan</li>
    <li>https</li>
    <li>jest</li>
    <li>mongodb</li>
    <li>nlp-js-tools-french</li>
    <li>selenium-webdriver</li>
</ol>

Pour les installer vous avez 2 solutions:

Avant tous, ouvrez un terminal et rendez vous dans le fichier `LINFO1212-R-APPSINF-HiddenPlaces` grâce a la
commande `cd..`

Ensuite, soit vous:

1) Les installer un par un avec la commande :

```bash
npm install Le_nom_du_module
```

2) tous les installer d'un coup:

    - si le fichier `package.json` se trouve bien dans le fichier ou vous etes situer vous pouvez lancer la commande
      suivante

```shell
npm install
```

### Creer la base de données

---
Avant de commencer assurer vous d'avoir installer [MongoDB](https://www.mongodb.com/) ainsi que
les [outils](https://www.mongodb.com/try/download/database-tools) et que tous soit bien dans votre PATH


1) Dans le CMD, rendez-vous dans le fichier `hiddenplaces-db` du projet avec la commande `cd ..`
2) Lancer la commande 
   ```shell
   mongod --dbpath .
   ``` 
3) Lancer un autre CMD et render vous dans le fichier `LINFO1212-R-APPSINF-HiddenPlaces` du projet et lancez ces commandes une apres l'autres
   ```shell
   mongoimport -d hiddenplaces-db -c users user.json
   ```
   ```shell
   mongoimport -d hiddenplaces-db -c places places.json
   ```
   ```shell
   mongoimport -d hiddenplaces-db -c geojson geojson.json
   ```


### Lancer le serveur Host

---
Rendez-vous dans le fichier `/app` et lancer la commande 
```shell
Node main.js
```
Vous devriez voir apparaitre le lien du site internet
```text
---- Site: https://localhost:8080/index.html ----
```
Et voila le site web est en marche vous pouvez vous rendre dessus et commencer a l'utiliser
Un compte de base existe déja:

Quand vous avez importer les fichers de la base de données nous avons crée une compte admin qui sera déja implémenter
Mais vous pouvez aussi crée votre propre compte.


| Username  | Fullname | Email               |Password|
|:---------:|:--------:|:-------------------:|:------:|
|Admin      |Admin     |Admin@HiddenPlace.com|@dmin123|


### lancer les test dans le CMD

---
Pour lancer les test il faut:

1) Installer la version de [Chrome driver](http://chromedriver.storage.googleapis.com/index.html) en fonction de la
   version de votre navigateur Google Chrome
2) Une fois téléchargé, bouger le fichier `chromedriver.exe` dans le fichier `LINFO1212-R-APPSINF-HiddenPlaces`
3) Vous pouvez aussi ajouter `chromedriver.exe` à votre PATH
4) Une fois cela fait rendez-vous dans votre CMD dans le fichier `LINFO1212-R-APPSINF-HiddenPlaces/test/`
5) Dans un autre CMD lancer le serveur du site web comme montré précédemment
6) Ensuite retourner dans le premier CMD et entrez la commande ```npm test``` dans le CMD

Voilà les tests s'effectuent et vous disent s'ils sont réussis ou pas.

Bien évidemment, vous pouvez aussi lancer les tests dans votre IDE