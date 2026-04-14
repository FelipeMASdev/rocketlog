import { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";
import { AppError } from "@/utils/AppError";

class DeliveryLogsController {

  async create(req: Request, res: Response) {
    // Validate request body
    const bodySchema = z.object({
      delivery_id: z.string().uuid(),
      description: z.string(),
    });

    const { delivery_id, description } = bodySchema.parse(req.body);

    // Validate if the delivery exists
    const delivery = await prisma.delivery.findUnique({
      where: { id: delivery_id },
    });

    if (!delivery) {
      throw new AppError("Delivery not found.", 404);
    }

    // Validate if the delivery is done processing
    if (delivery.status === "processing") {
      throw new AppError("Cannot add log to a delivery that is still being processed.", 400);
    }

    // Create the delivery log in the database
    await prisma.deliveryLog.create({
      data: {
        deliveryId: delivery_id,
        description,
      },
    });

    // Return a success response
    return res.status(201).json({ message: "Delivery log created successfully." });
  }

}

export { DeliveryLogsController };