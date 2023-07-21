const express = require("express");
const app = express();
const fs = require("fs");

app.get("/", (req, res) => {
  fs.readFile("data.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    res.status(200).json(JSON.parse(data));
  });
});

app.listen(3000);
