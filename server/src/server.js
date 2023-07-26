const express = require("express");
const app = express();
const fs = require("fs");

app.get("/api", (req, res) => {
  fs.readFile("data.json", "utf-8", (err, data) => {
    if (err) {
      res.status(500).json({ message: err });
      return;
    }
    data = JSON.parse(data);
    const size = 6;
    let { page } = req.query;
    if (!page) {
      page = 1;
    }
    const skip = (parseInt(page) - 1) * size;
    let hotels = [];
    for (let i = skip; hotels.length < size; i++) {
      if (!data[i]) break;
      hotels.push(data[i]);
    }
    console.log(hotels);
    res.status(200).json({
      page: parseInt(page),
      totalSize: data.length,
      hotels: hotels,
    });
  });
});

app.listen(5000, () => console.log("Listening on 5000"));
