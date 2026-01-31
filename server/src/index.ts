import "dotenv/config";
import express from "express";
import cors from "cors";
import { languageRouter } from "./routes/language.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.use("/api/v1", languageRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export { app };

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
