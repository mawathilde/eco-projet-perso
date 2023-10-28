# Projet individuel - Contrat intelligent : Système de vote

**Le frontend n'est pas fonctionnel, pas le temps de le faire fonctionner**

J'ai également ajouté des fonctionalités supplémentaires au contrat, il y a 3 méthodes supplémentaires.

## Configuration

Pour pouvoir utiliser le projet, il faut effectuer les étapes suivantes :

```sh
npm install
```

Après avoir installé, exécutez le réseau de test de Hardhat :

```sh
npx hardhat node
```

Dans un nouveau terminal, allez dans le dossier racine du référentiel et exécutez ceci pour déployer votre contrat :

```sh
npx hardhat run scripts/deploy.js --network localhost
```

Finallement, nous pouvons exécuter le frontend avec : **(le frontend n'est pas fonctionnel, pas le temps de le faire fonctionner)**

```sh
cd frontend
npm install
npm start
```

Le contrat peut être déployé sur Metamask.

## Tests

Les tests sont complétements fonctionnels, ils permettent de tester les fonctions du contrat et de vérifier que tout fonctionne correctement.
Pour exécuter les tests, exécutez la commande suivante :

```sh
npx hardhat test
```