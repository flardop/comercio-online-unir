// Server creation and configuration
import http from "node:http";
import app from "./src/app.js";

import {pool} from "./src/config/db.js";


try{
    await pool.getConnection();
    console.log("Connection to the database has been established successfully.");

    // await sequelize.sync(); // Synchronize the models with the database
    console.log("Database synchronized successfully.");
} catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit the process with an error code
}

// Server creation
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT);

// Listeners
server.on("listening", () => {
    console.log(`Server listening on port ${PORT}`);
});

server.on("error", (error) => {
    console.log(error);
});