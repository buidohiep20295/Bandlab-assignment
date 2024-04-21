const express = require('express');
// const mongoose = require('mongoose');

const app = express();
const PORT = process.env.NODE_DOCKER_PORT || 8080;

app.get("/", function (req, res) {
    res.send("-----");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));