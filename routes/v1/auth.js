// Importation des modules nécessaires
import express from "express";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import RegisterValidator from "../../validators/RegisterValidator.js";
import LoginValidator from "../../validators/LoginValidator.js";

// Initialisation de PrismaClient pour interagir avec la base de données
const prisma = new PrismaClient();

// Initialisation du routeur Express
const router = express.Router();


// Route POST pour l'enregistrement des utilisateurs
router.post("/register", async (req, res, next) => {
  let data;
  try {
    // Validation des données de la requête
    data = RegisterValidator.parse(req.body);
  } catch (error) {
    // En cas d'erreur de validation, renvoie une réponse avec le statut 400 et les détails de l'erreur
    return res.status(400).json({ errors: error.issues });
  }


  // Extraction des données validées
  const { email, firstname, lastname, password } = data;

  // Vérification de l'existence de l'utilisateur
  const existingUser = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  // Si l'utilisateur existe déjà, renvoie une erreur
  if (existingUser) {
    return next(createError(400, "User already exists"));
  }


  // Hachage du mot de passe
  const SALT = 10;
  const hashedPassword = bcrypt.hashSync(password, SALT);


  // Création de l'utilisateur
  const entry = await prisma.user.create({
    data: {
      email,
      firstname,
      lastname,
      picture,
      password: hashedPassword,
    },
  });

  // Renvoie une réponse avec le statut 201 et les détails de l'utilisateur créé
  res.status(201).json({
    id: entry.id,
    email: entry.email,
    firstname: entry.firstName,
    lastname: entry.lastName,
    picture: entry.picture,
  });
});

// Route POST pour la connexion des utilisateurs
router.post("/login", async (req, res, next) => {
  let data;
  try {
    // Validation des données de la requête
    data = LoginValidator.parse(req.body);
  } catch (error) {
    // En cas d'erreur de validation, renvoie une réponse avec le statut 400 et les détails de l'erreur
    return res.status(400).json({ errors: error.issues });
  }

  // Extraction des données validées
  const { email, password } = data;

  // Recherche de l'utilisateur
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });



  // Si l'utilisateur n'existe pas (c'est-à-dire si 'user' est null ou undefined),
  // une erreur est créée avec le statut 403 et le message "Wrong email or password",
  // puis passée à la fonction 'next' pour être traitée par le gestionnaire d'erreurs.
  if (!user) {
    return next(createError(403, "Wrong email or password"));
  }

  // Le mot de passe fourni dans la requête est comparé au mot de passe haché de l'utilisateur
  // trouvé dans la base de données. 'bcrypt.compareSync' renvoie 'true' si les mots de passe correspondent, 
  // et 'false' sinon.  
  const isGoodPassword = bcrypt.compareSync(password, user.password);



  // Si le mot de passe ne correspond pas (c'est-à-dire si 'isGoodPassword' est 'false'),
  // une erreur est créée avec le statut 403 et le message "Wrong email or password",
  // puis passée à la fonction 'next' pour être traitée par le gestionnaire d'erreurs.
  if (!isGoodPassword) {
    return next(createError(403, "Wrong email or password"));
  }

  // Si l'email et le mot de passe sont corrects, un token JWT est créé et renvoyé dans la réponse.
  // Le token est signé avec la clé secrète 'JWT_KEY' (stockée dans les variables d'environnement) 
  // et a une durée de validité de 30 minutes.
  res.json({
    token: jwt.sign(
      // payload
      {
        name: "Luke Skywalker",
      },
      // clef pour signer le token
      process.env["JWT_KEY"],
      // durée du token
      {
        expiresIn: "30m",
      }
    ),
  });
});



// Le routeur est exporté pour être utilisé dans d'autres fichiers.
export default router;
