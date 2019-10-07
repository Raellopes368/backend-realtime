const routes = require("express").Router();
const multer = require("multer");
const multerConfig = require("./config/multer");


routes.post("/posts", multer(multerConfig).single("file"), async (req, res) => {
  const { originalname: name, size, key, location: url = "" } = req.file;
  console.log(req.file);
  const post = {
    name,
    size,
    key,
    url
  };

  return res.json(post);
});

routes.get("/", (req, res) => {
  res.send(`Hello `)
})

module.exports = routes;
