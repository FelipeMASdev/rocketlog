import { Router } from "express";
import { UsersController } from "@/controllers/users-controller";
import exp from "constants";

const usersRoutes = Router();
const usersController = new UsersController();

usersRoutes.post("/", usersController.create);

export { usersRoutes };