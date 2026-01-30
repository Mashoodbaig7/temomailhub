import mongoose from "mongoose";
import { ENV } from "../constants/index.js";

const dbConnect = async () => {
    try {
        await mongoose.connect(ENV.MONGO_URL);
        console.log("Database connected successfully");
    }
    catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};
mongoose.connection.on("open", () => {
    console.log("Database Connected Success");
});

mongoose.connection.on("error", () => {
    console.log("Database Error");
});
export default dbConnect;