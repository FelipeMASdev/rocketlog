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

    // Validate if already delivered to prevent adding logs if true
    if (delivery.status === "delivered") {
      throw new AppError("This order has already been delivered.", 400);
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

  async show(req: Request, res: Response) {
    // Validate request params
    const paramsSchema = z.object({
      delivery_id: z.string().uuid(),
    });

    const { delivery_id} = paramsSchema.parse(req.params);

    // Validate if the delivery exists
    const delivery = await prisma.delivery.findUnique({
      where: { id: delivery_id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        logs: true,
      },
    });

    if (!delivery) {
      throw new AppError("Delivery not found.", 404);
    }

    // Authorization check: ensure customers can only view their own deliveries
    if ( req.user?.role === "customer" && req.user?.id !== delivery?.userId) {
      throw new AppError(
        "Unauthorized access. The customer can only view their own deliveries.", 401
      );
    }

    // Return the delivery information
    return res.json(delivery);
  }

}

export { DeliveryLogsController };