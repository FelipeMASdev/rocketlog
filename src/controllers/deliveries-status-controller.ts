import { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";

class DeliveriesStatusController {
  async update(req: Request, res: Response) {
    // Validate request parameters and body
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const bodySchema = z.object({
      status: z.enum(["processing", "shipped", "delivered"]),
    });

    const { id } = paramsSchema.parse(req.params);
    const { status } = bodySchema.parse(req.body);

    // Update the delivery status in the database
    await prisma.delivery.update({
      data: { status },
      where: { id },
    });

    // Create a log entry for the status update
    await prisma.deliveryLog.create({
      data: {
        deliveryId: id,
        description: status,
      },
    });

    // Return a success response
    return res.json({ message: "Delivery status updated successfully." });
  }
}

export { DeliveriesStatusController };