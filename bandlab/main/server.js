const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/routes.js');
const db = require('./config/db.js');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const PORT = process.env.NODE_DOCKER_PORT || 8080;

mongoose.connect(db.url).then(() => {
	console.log("Connected to the database!");
}).catch(err => {
	console.log("Cannot connect to the database!", err);
	process.exit();
});

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Bandlab" });
});

routes(app);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;