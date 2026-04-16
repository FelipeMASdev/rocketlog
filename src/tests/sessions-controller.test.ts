import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/database/prisma";

describe('SessionsController', () => {
  let userId: string | undefined;

  afterAll(async () => {
    if (!userId) { return; }
    await prisma.user.delete({ where: { id: userId, }, });
    userId = undefined;
  });

  it("should authenticate a user and return a access token", async () => {
    const userResponse = await request(app).post('/users').send({
      name: "Jane Doe",
      email: "jane.doe@example.com",
      password: "password123"
    });
    userId = userResponse.body.id;

    const sessionResponse = await request(app).post('/sessions').send({
      email: "jane.doe@example.com",
      password: "password123"
    });

    expect(sessionResponse.status).toBe(200);
    expect(sessionResponse.body.token).toEqual(expect.any(String));
  });
});