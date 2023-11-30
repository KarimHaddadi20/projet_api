//RegisterValidator.js

import { z } from "zod";

const RegisterValidator = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  password: z
    .string()
});

export default RegisterValidator;
