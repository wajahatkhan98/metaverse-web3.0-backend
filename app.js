const express = require("express");
const app = new express();
const cors = require("cors");

const path = require("path");

// const timeOut = require("connect-timeout");
const errorMiddleware = require("./middlewares/errors");
app.use(cors());
app.use(express.json());

const PersonRouter = require("./routes/PersonRoutes");

app.use(PersonRouter);
app.use(errorMiddleware);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

module.exports = app;
