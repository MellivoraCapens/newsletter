import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import { errorHandler } from "./middleware/error";
import users from "./routes/users";
import auth from "./routes/auth";
import post from "./routes/post";
import comment from "./routes/comment";
import search from "./routes/search";

connectDB();

const app: express.Application = express();

const whitelist = [
  process.env.CLIENT_URL,
  `${process.env.CLIENT_URL}/home`,
  `${process.env.CLIENT_URL}/me`,
  `${process.env.CLIENT_URL}/post/:id`,
];
var corsOptions = {
  credentials: true,
  origin: function (origin: any, callback: any) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));
/* app.use(cors({ origin: "*" })); */
app.use(cookieParser());

const PORT = process.env.PORT;

app.use(express.json());

app.use("/newsletter/api/v1/user", users);
app.use("/newsletter/api/v1/auth", auth);
app.use("/newsletter/api/v1/post", post);
app.use("/newsletter/api/v1/comment", comment);
app.use("/newsletter/api/v1/search", search);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
