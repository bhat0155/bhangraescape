import { eventService } from "../services/events.service";

  jest.mock("../lib/prisma", () => ({
    prisma: {
      event: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      interest: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        count: jest.fn(),
      },
      availabilityPreference: {
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
    },
  }));

  import { prisma } from "../lib/prisma";

  const mockedPrisma = prisma as unknown as {
    event: { findUnique: jest.Mock; findMany: jest.Mock };
    interest: { findUnique: jest.Mock; upsert: jest.Mock; count: jest.Mock };
    availabilityPreference: { findMany: jest.Mock; upsert: jest.Mock };
  };

  const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
  const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("eventService.toggleInterest", () => {
    it("throws 403 when user is not a member or admin", async () => {
      const guestUser = { id: "u1", role: "GUEST" };
      await expect(
        eventService.toggleInterest(guestUser, "event1", true)
      ).rejects.toMatchObject({ status: 403 });
    });

    it("throws 404 when the event does not exist", async () => {
      mockedPrisma.event.findUnique.mockResolvedValue(null);
      const member = { id: "u1", role: "MEMBER" };
      await expect(
        eventService.toggleInterest(member, "event1", true)
      ).rejects.toMatchObject({ status: 404 });
    });

    it("throws 403 when the event is in the past", async () => {
      mockedPrisma.event.findUnique.mockResolvedValue({ id: "event1", date: pastDate });
      const member = { id: "u1", role: "MEMBER" };
      await expect(
        eventService.toggleInterest(member, "event1", true)
      ).rejects.toMatchObject({ status: 403 });
    });

    it("upserts interest and returns the updated performer count", async () => {
      mockedPrisma.event.findUnique.mockResolvedValue({ id: "event1", date: futureDate });
      mockedPrisma.interest.upsert.mockResolvedValue({});
      mockedPrisma.interest.count.mockResolvedValue(5);
      const member = { id: "u1", role: "MEMBER" };

      const result = await eventService.toggleInterest(member, "event1", true);

      expect(mockedPrisma.interest.upsert).toHaveBeenCalledWith({
        where: { eventId_userId: { eventId: "event1", userId: "u1" } },
        create: { eventId: "event1", userId: "u1", interested: true },
        update: { interested: true },
      });
      expect(result).toEqual({ interested: true, performerCount: 5 });
    });
  });

  describe("eventService.list", () => {
    it("filters to future events when status is upcoming", async () => {
      mockedPrisma.event.findMany.mockResolvedValue([]);
      await eventService.list({ status: "upcoming" } as any);

      const call = mockedPrisma.event.findMany.mock.calls[0][0];
      expect(call.where.date).toEqual({ gt: expect.any(Date) });
      expect(call.orderBy).toEqual({ date: "asc" });
    });

    it("filters to past events when status is past", async () => {
      mockedPrisma.event.findMany.mockResolvedValue([]);
      await eventService.list({ status: "past" } as any);

      const call = mockedPrisma.event.findMany.mock.calls[0][0];
      expect(call.where.date).toEqual({ lte: expect.any(Date) });
      expect(call.orderBy).toEqual({ date: "desc" });
    });

    it("adds a case-insensitive title search when search is provided", async () => {
      mockedPrisma.event.findMany.mockResolvedValue([]);
      await eventService.list({ status: "all", search: "  bhangra  " } as any);

      const call = mockedPrisma.event.findMany.mock.calls[0][0];
      expect(call.where.title).toEqual({ contains: "bhangra", mode: "insensitive" });
    });
  });

  describe("eventService.setAvailability", () => {
    const member = { id: "u1", role: "MEMBER" as const };

    it("throws 403 when the role is not member or admin", async () => {
      const guest = { id: "u1", role: "GUEST" as any };
      await expect(
        eventService.setAvailability(guest, "event1", ["MON"])
      ).rejects.toMatchObject({ status: 403 });
    });

    it("throws 404 when the event does not exist", async () => {
      mockedPrisma.event.findUnique.mockResolvedValue(null);
      await expect(
        eventService.setAvailability(member, "event1", ["MON"])
      ).rejects.toMatchObject({ status: 404 });
    });

    it("throws 403 when the event is in the past", async () => {
      mockedPrisma.event.findUnique.mockResolvedValue({ id: "event1", date: pastDate });
      await expect(
        eventService.setAvailability(member, "event1", ["MON"])
      ).rejects.toMatchObject({ status: 403 });
    });

    it("computes tallies and top two days from all preferences", async () => {
      mockedPrisma.event.findUnique.mockResolvedValue({ id: "event1", date: futureDate });
      mockedPrisma.availabilityPreference.upsert.mockResolvedValue({});
      mockedPrisma.availabilityPreference.findMany.mockResolvedValue([
        { userId: "u1", days: ["MON", "TUE"] },
        { userId: "u2", days: ["MON"] },
      ]);

      const result = await eventService.setAvailability(member, "event1", ["MON", "TUE"]);

      expect(result.myDays).toEqual(["MON", "TUE"]);
      expect(result.tallies.MON).toBe(2);
      expect(result.tallies.TUE).toBe(1);
      expect(result.topDays[0]).toEqual({ weekday: "MON", count: 2 });
    });
  });