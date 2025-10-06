const express = require("express");
const app = express();
const mongoose = require("mongoose");

const cors = require("cors");

const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const adminRouter = require("./routes/adminRoutes");
const eventRouter = require("./routes/eventRoutes");
// const checkInRouter = require("./routes/checkInRoutes")

dotenv.config();
console.log("in index - ", process.env.MONGO_ATLAS_URI);
//database url
mongoose
    .connect(process.env.MONGO_ATLAS_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("MongoDB Connected Successfully ✅");
    })
    .catch((err) => {
        console.log("MongoDB Connection Error:", err);
    });

require("./models/admin");
require("./models/event");

app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

app.use(cookieParser());

// Configure CORS to allow all origins in development
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use("/", adminRouter);
app.use("/", eventRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(err.status || 500).json({
        msg: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

app.get("/", (req, res) => {
    res.send("Event Management micro services API.");
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server Running on🚀: ${process.env.PORT}`);
});
