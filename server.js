const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 8081;

app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.set("view engine", "ejs");

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true}, function(error) {
    if (error) console.log("Error connecting: ", error);
});
const connection = mongoose.connection;

connection.once("open", () => {
    console.log("MongoDB connection established successfully");
});

app.get("/", (req, res) => {
    res.send("Hello");
});

const userRouter = require("./routes/users");
app.use("/users", userRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
