const express = require("express");
const app = express();
app.listen(3000, console.log("You're in!"));
app.use(express.static("public"));
