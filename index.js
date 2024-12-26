const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
dotenv.config();
require("./src/config/db.connection");
const app = express();
const PORT = process.env.PORT || 4000;
const authRoute = require("./src/auth/auth.route");
const adminRoute = require("./src/admin/admin.route")
const serviceRoute = require("./src/serviceManagement/serviceManagement.route")
const quoteRoute = require("./src/quote/quote.route")
const userRoute = require("./src/user/user.route")
const connectionRoute = require("./src/connection/connection.route");
const chatRoute = require("./src/chat/chat.route")
const orderRoute = require("./src/order/order.route")
const initSocketIo = require("./src/services/socket.service");
app.set("view engine", "ejs");
const viewsDir = path.join(__dirname, "./src/views");
app.set("views", viewsDir);

const staticDir = path.join(__dirname, "public");
app.use(express.static(staticDir));
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", async function (req, res) {
  return res.send(
    `Server is running at ${
      req.protocol + "://" + req.hostname + ":" + PORT
    } 🧑🏽‍🚀💻 `
  );
});

app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/service", serviceRoute);
app.use("/api/quote",quoteRoute)
app.use("/api/user",userRoute)
app.use("/api/connection",connectionRoute)
app.use("/api/chat",chatRoute)
app.use("/api/order",orderRoute)

const server = app.listen(PORT, () => {
  console.log(`Server up and running on port ${PORT}!`);
});

const io = require("socket.io")(server, { 
  pingTimeout: 60000,
  pingInterval: 25000,
  cors: {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

initSocketIo(io);