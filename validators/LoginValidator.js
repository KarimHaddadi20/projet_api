//LoginValidator.js


import { z } from "zod";

const LoginValidator = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default LoginValidator;
