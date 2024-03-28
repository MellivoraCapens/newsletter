import express from "express";
import "dotenv/config";
import cors from "cors";
import { connectDB } from "./config/db";
import { errorHandler } from "./middleware/error";
import users from "./routes/users";
import auth from "./routes/auth";
import post from "./routes/post";
import comment from "./routes/comment";

connectDB();

const app: express.Application = express();
app.use(cors());

const PORT = process.env.PORT;

app.use(express.json());

app.use("/newsletter/api/v1/user", users);
app.use("/newsletter/api/v1/auth", auth);
app.use("/newsletter/api/v1/post", post);
app.use("/newsletter/api/v1/comment", comment);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
