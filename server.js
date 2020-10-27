const express = require("express");
const cors = require("cors");

const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 8081;

app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.set("view engine", "ejs");

app.get("/spotify-auth", (req, res) => {
    res.send("Hello World");
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
