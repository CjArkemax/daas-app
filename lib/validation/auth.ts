import {z} from "zod";

export const registerSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(8),
})
export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(1),
})
export type LoginInput = z.infer<typeof loginSchema>


// console.log(parsed);

// {
//   success: true,
//   data: {
//     email: "user@example.com",
//     password: "securePassword123"
//   }
// }


// console.log(parsed);

// {
//   success: false,
//   error: ZodError: [
//     {
//       "code": "invalid_string",
//       "validation": "email",
//       "message": "Invalid email",
//       "path": [ "email" ]
//     },
//     {
//       "code": "too_small",
//       "minimum": 8,
//       "type": "string",
//       "inclusive": true,
//       "exact": false,
//       "message": "String must contain at least 8 character(s)",
//       "path": [ "password" ]
//     }
//   ]
// }
