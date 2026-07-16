import express from "express";
import cors from "cors";

// routes imports
import performancesRoutes from "./routes/performancesRoutes.ts";
import rankingsRoutes from "./routes/rankingsRoutes.ts";
import playersRoutes from "./routes/playersRoutes.ts";
import matchesRoutes from "./routes/matchesRoutes.ts";

const app = express();

app.use(cors({ origin: "http://localhost:4321" }));
app.use(express.json());

// routes
app.use("/api/performances", performancesRoutes);
app.use("/api/rankings", rankingsRoutes);
app.use("/api/players", playersRoutes);
app.use("/api/matches", matchesRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("SIGINT", () => {
  console.log("Shutting down server...");
  process.exit();
});