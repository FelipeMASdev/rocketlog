import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/database/prisma";

describe('UsersController', () => {
  let userId: string | undefined;

  afterAll(async () => {
    if (!userId) { return; }
    await prisma.user.delete({ where: { id: userId, }, });
    userId = undefined;
  });

  it("should create a new user successfully", async () => {
    const response = await request(app).post('/users').send({
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password123"
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe("John Doe");

    userId = response.body.id;
  });

  it("should throw an error when creating a user with an existing email", async () => {
    const response = await request(app).post('/users').send({
      name: "John Duplicate",
      email: "john.doe@example.com",
      password: "password123"
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("User with this email already exists");
  });

  it("should throw a validation error when email is invalid", async () => {
    const response = await request(app).post('/users').send({
      name: "John Doe",
      email: "invalid-email.com",
      password: "password123"
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation error");
  });

});