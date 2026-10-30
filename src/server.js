require("dotenv").config();
const path = require("path");
const express = require("express");
const app = express();
const configEngine = require("./config/viewEngine");
configEngine(app);
const webRoutes = require("./routes/routes");
app.use("/", webRoutes);
const port = process.env.PORT;
const hostname = process.env.HOST_NAME;
const connection = require("./config/database");
const { startCronjob } = require("./services/cronjob");
app.listen(port, hostname, () => {
  console.log(`server running at ${hostname}:${port}`);
  startCronjob();
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("[UNHANDLED REJECTION]:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[UNCAUGHT EXCEPTION]:", err);
});
