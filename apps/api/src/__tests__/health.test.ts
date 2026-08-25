import request from 'supertest';
import { app } from '../app';

 jest.mock("../lib/prisma", () => ({
    prisma: { $queryRaw: jest.fn().mockResolvedValue([{ "?column?": 1 }]) },
  }));

  jest.mock("nanoid", () => ({
    nanoid: jest.fn(),
  }));

  jest.mock("@auth/core/jwt", () => ({
    decode: jest.fn(),
  }));

  describe("GET /health", () => {
    it("returns ok: true when the DB check succeeds", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ ok: true });
    });
  });

  