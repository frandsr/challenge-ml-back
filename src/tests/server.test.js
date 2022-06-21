const supertest = require("supertest");
const Server = require("../models/server");
const server = new Server();
server.execute();
const app = server.app;
const api = supertest(app);

describe("searching items to MercadoLibre API", () => {
  test("Response is ok", async () => {
    await api.get("/api/items?q=iphone+12").expect(200);
  });

  test('Response is a list of 4 items"', async () => {
    const response = await api.get("/api/items?q=iphone+12");
    expect(response.body.items).toHaveLength(4);
  });

  test("Categories are an array of 4 strings", async () => {
    const response = await api.get("/api/items?q=iphone+12");
    expect(
      response.body.categories.every((elem) => typeof elem === "string")
    ).toBe(true);
    expect(response.body.categories).toHaveLength(4);
  });
});
