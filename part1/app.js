const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoute = require("./routes/userRoute");

const app = express();
app.use(express.json());
app.use(cors());

const DB =
  "mongodb+srv://jth:aadusRhzQqnw1HAU@cluster0.i4px3.mongodb.net/backendTest?retryWrites=true&w=majority";

const connect = async () => {
  try {
    await mongoose.connect(DB);
  } catch (err) {
    throw err;
  }
};

mongoose.connection.on("disconnect", () =>
  console.log("mongoDB disconnected!")
);

mongoose.connection.on("connect", () => console.log("mongoDB connected!"));

app.use("/api", userRoute);

const PORT = 3001;

app.listen(PORT, () => {
  connect();
  console.log(`Listening on port ${PORT}`);
});
