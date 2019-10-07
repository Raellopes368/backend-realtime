require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const redisClient = require('async-redis').createClient({
  password: process.env.DB_KEY,
});
const redisClient = require('async-redis').createClient(process.env.REDIS_URL);
const app = express();
redisClient.set("teste", "teste");

const server = require("http").Server(app);
const io = require("socket.io")(server);

io.on("connection", async (socket) => {
  const { user_id } = socket.handshake.query;
  const { contt_id } = socket.handshake.query;
  console.log(user_id, "\n", contt_id);
  let data = new Date();
  redisClient.set(`USER_ID-${user_id}`, socket.id);
  redisClient.set(`UV-${user_id}`, "");
  if (contt_id) {
    const ContatoId = await redisClient.get(`USER_ID-${contt_id}`);
    const HourContato = await redisClient.get(`UV-${contt_id}`);
    if (HourContato && HourContato !== "") {
      socket.to(ContatoId).emit('Situation', "Online");
    } else if (HourContato) {
      socket.to(ContatoId).emit('Situation', HourContato);
    }



  }
  socket.on("Situation", async datas => {
    const { data, contt_id } = datas;
    const ContatoId = await redisClient.get(`USER_ID-${contt_id}`);
    if (ContatoId) {
      socket.to(ContatoId).emit('Situation', data);
    }
  })


  socket.on("disconnect", async sock => {
    const ContatoId = await redisClient.get(`USER_ID-${contt_id}`);
    const hour = data.getHours() + ":" + data.getMinutes();
    redisClient.set(`UV-${user_id}`, hour);
    socket.to(ContatoId).emit('Situation', hour);
  })
});
/**
 * Database setup
 */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  "/files",
  express.static(path.resolve(__dirname, "..", "tmp", "uploads"))
);

app.use(require("./routes"));

server.listen(process.env.PORT || 3333, () => console.log("Servidor ativo"));
