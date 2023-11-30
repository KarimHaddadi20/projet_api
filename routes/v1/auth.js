//auth.js

// Importation des modules nécessaires
import express from "express";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import RegisterValidator from "../../validators/RegisterValidator.js";
import LoginValidator from "../../validators/LoginValidator.js";
import { expressjwt } from "express-jwt";



const auth = expressjwt({
  secret: process.env["JWT_KEY"],
  algorithms: ["HS256"],
});


// Initialisation de PrismaClient pour interagir avec la base de données

// Initialisation du routeur Express
const router = express.Router();
router.use(express.urlencoded({ extended: true }));
const prisma = new PrismaClient();


// Définition de la route POST "/register"
router.post("/register", async (req, res, next) => {

  // Route POST pour l'enregistrement des utilisateurs
  let data;
  try {
    // Validation des données de la requête
    data = RegisterValidator.parse(req.body);
  } catch (error) {
    // En cas d'erreur de validation, renvoie une réponse avec le statut 400 et les détails de l'erreur
    return res.status(400).json({ errors: error.issues });
  }


  // Extraction des données validées
  const { email, firstName, lastName, password, picture } = data;

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
      firstName,
      lastName,
      picture,
      password: hashedPassword,
    },
  });

  // Renvoie une réponse avec le statut 201 et les détails de l'utilisateur créé
  res.status(201).json({
    id: entry.id,
    email: entry.email,
    firstName: entry.firstName,
    lastName: entry.lastName,
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

router.post('/snippet', auth, async (req, res) => {
  // Extract snippet details from request body
  const { content, language, categoryId } = req.body;
  // Validate the data here...

  // Save the snippet to the database
  const snippet = await prisma.snippet.create({
    data: {
      content: content,
      language: language,
      categoryId: parseInt(categoryId),
      userId: parseInt(categoryId),
    },
  });
  console.log(snippet)

  // Respond with the created snippet
  res.status(201).json(snippet);
});

// Définition de la route GET "/snippets"
router.get("/snippet", auth, async (req, res, next) => {
  // Extraction de 'category' et 'page' des paramètres de requête
  const { category, page = 1 } = req.query;

  // Définition du nombre de snippets par page
  const pageSize = 10;

  // Calcul du nombre de snippets à ignorer
  const skip = (page - 1) * pageSize;
  console.log(skip)
  // Récupération des snippets de la base de données
  const snippets = await prisma.snippet.findMany({
    where: {
      category: {
        name: category
      },
    },
    skip: skip,
    take: pageSize,
    include: {
      category: true,
    },
  });

  // Renvoi des snippets récupérés dans la réponse
  res.json(snippets);
});

// // Route PUT pour mettre à jour une catégorie existante
// router.put("/category/:id", async (req, res) => {
//   // Extract category details from request body
//   const { name } = req.body;

//   // Extract category ID from route parameters
//   const { id } = req.params;

//   // Update the category in the database
//   const category = await prisma.category.update({
//     where: {
//       id: parseInt(id),
//     },
//     data: {
//       name: name,
//     },
//   });

//   // Respond with the updated category
//   res.json(category);
// });



// Route PUT pour mettre à jour un snippet existant pour modifier le contenu, le langage et la catégorie
router.put("/snippet/:id", auth, async (req, res) => {
  // Extract snippet details from request body
  const { content, language, categoryId, } = req.body;

  // Extract snippet ID from route parameters
  const { id } = req.params;

  // Update the snippet in the database
  const snippet = await prisma.snippet.update({
    where: {
      id: parseInt(id),
    },
    data: {
      content: content,
      language: language,
      categoryId: parseInt(categoryId),
      userId: parseInt(categoryId),
    },
  });

  // Respond with the updated snippet
  res.json(snippet);
});


router.delete("/snippet/:id", auth, async (req, res) => {
  // Extract snippet ID from route parameters
  const { id } = req.params;

  // Check if the snippet exists
  const snippet = await prisma.snippet.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!snippet) {
    return res.status(404).json({ error: "Snippet not found" });
  }

  // Delete the snippet from the database
  const deletedSnippet = await prisma.snippet.delete({
    where: {
      id: parseInt(id),
    },
  });

  // Respond with the deleted snippet
  res.json(deletedSnippet);
});

router.post("/category", async (req, res) => {
  // Extract category name from request body
  const { name } = req.body;

  // Save the category to the database
  const category = await prisma.category.create({
    data: {
      name: name,
    },
  });

  // Respond with the created category
  res.status(201).json(category);
});


// Route GET pour lister toutes les catégories
router.get("/category", async (req, res) => {
  // Fetch all categories from the database
  const category = await prisma.category.findMany();

  // Respond with the fetched categories
  res.json(category);
});


// Route PUT pour modifier une catégorie existante
router.put("/category/:id", auth, async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  const category = await prisma.category.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name: name,
    },
  });
  res.json(category);
});

// Route DELETE pour supprimer une catégorie existante
router.delete("/category/:id", auth, async (req, res) => {
  const { id } = req.params;
  const category = await prisma.category.delete({
    where: {
      id: parseInt(id),
    },
  });
  res.json(category);
});
// Le routeur est exporté pour être utilisé dans d'autres fichiers.
export default router;
