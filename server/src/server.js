require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
});



//what is grateful shutdown? Grateful shutdown is a technique used in server applications to ensure that the server can shut down gracefully when it receives termination signals (like SIGTERM or SIGINT). Instead of abruptly terminating, the server will stop accepting new requests, finish processing any ongoing requests, and then close the server before exiting the process. This helps prevent data loss and ensures a smoother shutdown process.
// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received — shutting down gracefully");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received — shutting down");
  server.close(() => process.exit(0));
});