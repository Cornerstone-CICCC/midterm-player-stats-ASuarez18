import express from "express";
import cors from "cors";

// routes imports
// import todosRoutes from "./routes/todosRoutes.ts";

const app = express();

app.use(cors({ origin: "http://localhost:4321" }));
app.use(express.json());

// routes
// app.use("/todos", todosRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("SIGINT", () => {
  console.log("Shutting down server...");
  process.exit();
});