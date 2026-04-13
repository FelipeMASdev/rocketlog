import { Request, Response } from 'express';
import { prisma } from "@/database/prisma";
import { hash } from 'bcrypt';
import { z } from 'zod';
import { AppError } from '@/utils/AppError';

class UsersController {

  async create(req: Request, res: Response) {
    //validating the request body using zod
    const bodySchema = z.object({
      name: z.string().trim().min(2),
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { name, email, password} = bodySchema.parse(req.body);

    //validating if there is no user with the same email in the database
    const userWithSameEmail = await prisma.user.findFirst({
      where: { email },
    });

    if (userWithSameEmail) {
      throw new AppError("User with this email already exists");
    }

    //password cryptography
    const hashedPassword = await hash(password, 8);

    //creating the user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    });

    //destructuring the user object to remove the password field
    const { password: _, ...userWithoutPassword } = user;

    //returning the created user
    return res.status(201).json( userWithoutPassword );
  }

}

export { UsersController };