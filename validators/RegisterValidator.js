import { z } from "zod";

const RegisterValidator = z.object({
  firstname: z.string().min(1).max(255),
  lastname: z.string().min(1).max(255),
  email: z.string().email(),
  password: z
    .string()
    .min(6)
    .regex(new RegExp(/[0-9]/), {
      message: "le mdp doit contenir au moins un chiffre",
    })
    .regex(new RegExp(/[A-Z]/), {
      message: "le mdp doit contenir au moins une majuscule",
    })
    .regex(new RegExp(/[a-z]/), {
      message: "le mdp doit contenir au moins une minuscule",
    }),
});

export default RegisterValidator;
