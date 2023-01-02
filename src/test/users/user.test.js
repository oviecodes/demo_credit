const supertest = require("supertest");
const knex = require("../../../knexfile");
const Knex_func = require("knex");
const app = require("../..app");
// const Image = require("../models/Images");
const { initialImages, nonExistingId, imagesInDb } = require("./test_helper");

const db = Knex_func(knex[process.env.NODE_ENV]);

const api = supertest(app);

beforeEach(async () => {
  db("users").truncate();
  db("cards").truncate();
  //create an array of promises
  const images = initialImages.map((el) => Image.create(el));
  //Promise.all resolves when all promise passed to it are fufilled, runs in parallel
  await Promise.all(images);
  // //runs in order
  // for (let image of initialImages) {
  //     await Image.create(image)
  // }
}, 100000);

describe("when there is initially some notes saved", () => {
  test("Image are returned as json", async () => {
    await api
      .get("/Images/market")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  }, 100000);

  test("there are 2 Image", async () => {
    const response = await api.get("/Images/market");

    expect(response.body).toHaveLength(initialImages.length);
  }, 100000);

  test("The first image is about a cat", async () => {
    const response = await api.get("/Images/market");

    expect(response.body[0].title).toBe(initialImages[0].title);
  }, 100000);

  test("Image title array should have the title of the second image", async () => {
    const response = await api.get("/Images/market");

    const titles = response.body.map((img) => img.title);
    expect(titles).toContain(initialImages[1].title);
  }, 100000);
});

describe("where there is authentication error", () => {
  test("return error for post without authentication", async () => {
    const newImage = {
      title: "Queen_Amadaila",
      url: "https://starwars.com.",
      description:
        "A nice picture of the beautiful senator Amadaila when she was the queen of Naboo",
    };

    await api.post("/Images").send(newImage).expect(401, {});

    const imagesAtEnd = await imagesInDb();
    expect(imagesAtEnd).toHaveLength(initialImages.length);

    const allTitle = imagesAtEnd.map((el) => el.title);
    expect(allTitle).not.toContain("Queen_Amadaila");
  });

  test("unauthenticated user cannot view a particular image", async () => {
    const images = await imagesInDb();
    const imageToView = images[0].id;
    await api.get(`/images/${imageToView}`).expect(401);
  });
});

describe("when an required field is not provided", () => {
  test("image missing a required property is not added to db", async () => {
    const newImage = {
      title: "Queen_Amadaila",
      description:
        "A nice picture of the beautiful senator Amadaila when she was the queen of Naboo",
    };

    try {
      await Image.create(newImage);
    } catch (e) {
      const el = "do nothing";
    }

    const imagesAtEnd = await imagesInDb();
    expect(imagesAtEnd).toHaveLength(initialImages.length);
  });
});

afterAll(() => {
  return mongoose.connection.close();
});
