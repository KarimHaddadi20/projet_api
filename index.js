import express from "express";
import cors from 'cors';
import { PrismaClient } from '@prisma/client';


const app = express();

const prisma = new PrismaClient();




app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5500"],
    credentials: true,
  })
);



const port = 3005;


// server.listen instead of app.listen
server.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
