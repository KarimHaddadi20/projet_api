//v1.js

// Importation du module Express. Express est un framework pour construire des applications web sur Node.js.
import express from "express";

// Importation du routeur d'authentification, qui gère les routes d'authentification de l'API.
import authRouter from "./v1/auth.js";

// Importation du routeur secret, qui gère les routes secrètes de l'API.
import secretRouter from "./v1/secret.js";

// Création d'un nouveau routeur Express. Un routeur est un objet qui permet de définir plusieurs routes dans une seule application Express.
const router = express.Router();

// Attachement du routeur d'authentification à la route "/auth". Cela signifie que toutes les requêtes commençant par "/auth" seront gérées par authRouter.
router.use("/auth", authRouter);

// Attachement du routeur secret à la route "/secret". Cela signifie que toutes les requêtes commençant par "/secret" seront gérées par secretRouter.
router.use("/secret", secretRouter);

// Exportation du routeur. Cela permet à d'autres fichiers de l'application d'importer et d'utiliser ce routeur.
export default router;