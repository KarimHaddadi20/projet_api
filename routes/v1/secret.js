// secret.js
// Importation du module express pour créer une application web
import express from "express";

// Importation de la fonction expressjwt du module express-jwt pour valider les JWT
import { expressjwt } from "express-jwt";

// Création d'un middleware pour valider les JWT. Le middleware utilise une clé secrète et l'algorithme HS256 pour valider les tokens.
const auth = expressjwt({
  secret: process.env["JWT_KEY"], // La clé secrète est stockée dans les variables d'environnement
  algorithms: ["HS256"], // L'algorithme HS256 est utilisé pour valider les tokens
});

// Création d'un nouveau routeur Express
const router = express.Router();

// Définition d'une route GET /secret sur le routeur. Cette route est protégée par le middleware auth, qui valide les JWT.
// Si le JWT est valide, le client reçoit une réponse JSON avec le message "bravo, tu as accès à cette route".
// Si le JWT est invalide, une erreur est renvoyée.
router.get("/secret", auth, (req, res) => {
  res.json({ msg: "bravo, tu as accès à cette route" });
});

// Exportation du routeur pour être utilisé dans d'autres parties de l'application
export default router;