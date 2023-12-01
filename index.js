// index.js

import express from "express";
import cors from 'cors';
import 'dotenv/config';
import fs from "fs";
import v1Router from "./routes/v1.js";
import router from "./routes/v1.js";



const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 3000;

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5500"],
    credentials: true,
  })
);
app.use("/v1", v1Router);

app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ msg: "Ton JWT est invalide !" });
  }

  console.log("erreur", "err");

  return res.status(err.status).json({ message: err.message });
});





app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
