import { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";
import { AppError } from "@/utils/AppError";
import { compare } from "bcrypt";
import { authConfig } from "@/configs/auth"
import { sign } from "jsonwebtoken";

class SessionsController {

  async create(req: Request, res: Response) {

    // Validating the request body using Zod
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),   
    });

    const { email, password } = bodySchema.parse(req.body);
    
    // Finding the user in the database using Prisma
    const user = await prisma.user.findFirst({
      where: { email },
    });

    // Authenticating the user
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const passwordMatch = await compare (password, user.password);

    if (!passwordMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    // Generating a JWT token for the authenticated user
    const { secret, expiresIn} = authConfig.jwt;
      const token = sign({ role: user.role ?? "customer" }, secret, {
        subject: user.id,
        expiresIn,
      })

    //
    const { password: _, ...userWithoutPassword } = user; 

    //Returning the auth token in the response
    return res.json({ token, user: userWithoutPassword });
  }

}

export { SessionsController };