import express, { Express } from "express";
import cors from "cors";
import "dotenv/config";

const app: Express = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
