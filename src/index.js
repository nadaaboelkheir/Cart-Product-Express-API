const express = require("express");
const morgan = require("morgan");

const { PORT } = require("./configs/env");
const connectDB = require("./configs/db.config");
const routes = require("./routes/index");
const cors = require("cors");

const app = express();

app.use(morgan("dev"));
app.use(cors());

app.use(express.json());
app.use('/uploads', express.static('uploads')); 
routes(app);

app.use((req, res, next) => {
  res.status(400).json({ message: "page not found " });
});

app.use((err, req, res, next) => {
  err.status = err.status || 500;

  res.status(err.status).json({
    status: err.status,
    errors: { error: err.toString() },
  });
});

connectDB()
  .then(async () => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Listenning to port ${PORT}...`));
  })
  .catch((err) => console.log("Db Connection Error: " + err));
