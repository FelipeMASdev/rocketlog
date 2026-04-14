import { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";

class DeliveriesController {

  async create(req: Request, res: Response) {

    // Validating the request body using Zod
    const bodySchema = z.object({
      user_id: z.string().uuid(),
      description: z.string(),
    });

    const { user_id, description } = bodySchema.parse(req.body);

    // Creating a new delivery record in the database
    await prisma.delivery.create({
      data: {
        userId: user_id,
        description,
      }
    });

    // Returning a success response
    return res.status(201).json({ message: "Delivery created" });
  }

  async index(req: Request, res: Response) {
    // Fetching all deliveries from the database
    const deliveries = await prisma.delivery.findMany({
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    // Returning the list of deliveries as a JSON response
    return res.json(deliveries);
  }

}

export { DeliveriesController }