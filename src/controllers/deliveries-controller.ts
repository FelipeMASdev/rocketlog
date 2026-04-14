import { Request, Response } from "express";

class DeliveriesController {
  async create(req: Request, res: Response) {
    return res.json({ message: "Delivery created" });
  }
}

export { DeliveriesController }