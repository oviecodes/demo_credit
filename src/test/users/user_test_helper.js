const Image = require("../models/Images");

const initialImages = [
  {
    title: "brown_cat.png",
    url: "https://cats.png",
    description: "An image about a brown cat ...",
  },
  {
    title: "another_img.png",
    url: "https://another.png",
    description: "Another image about a brown cat ...",
  },
];

const nonExistingId = async () => {
  const image = new Image({ content: "willremovethissoon", date: new Date() });
  await image.save();
  await image.remove();

  return image._id.toString();
};

const imagesInDb = async () => {
  const images = await Image.find({});
  return images.map((note) => note.toJSON());
};

module.exports = {
  initialImages,
  nonExistingId,
  imagesInDb,
};
