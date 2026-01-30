import express from "express";
import helmet from "helmet";
import routes from "./src/routes/index.js";
import dbConnect from "./src/config/db.js";
import cookieParser from 'cookie-parser';
import cors from "cors";
import emailCleanupService from "./src/services/emailCleanupService.js";

import { ENV } from "./src/constants/index.js";

const app = express();
app.use(helmet());
// Set body size limit to 50MB to handle large attachments with base64 encoding overhead
// Webhook controller will skip attachments based on user's plan limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser(ENV.COOKIE_SECRET));

const PORT = ENV.PORT || 8080;

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.get("/", (req, res) => {
    res.send("Hello World!");
})

app.use("/", routes);

// Initialize database and start server
const startServer = async () => {
    try {
        // Connect to database first
        await dbConnect();

        // Start email cleanup cron job after database is connected
        emailCleanupService.startCleanupCron();

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();