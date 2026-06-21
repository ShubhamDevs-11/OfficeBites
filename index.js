require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const xssClean = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet=require('helmet');

const logger = require('./utils/logger.js');
const connectDb = require('./config/db');
const authRoutes = require("./routes/authRoutes.js");

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.use(helmet());
app.use(mongoSanitize());
app.use(xssClean());
app.use(cookieParser(process.env.COOKIE_SECRET));

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

if(process.env.NODE_ENV != 'production'){
    app.use((req,res,next)=>{
        logger.debug(`${req.files} ${req.baseUrl}`);
        next();
    })
}
//RATE LIMITER
const globalLimiter = rateLimit({
    windowMs : parseInt(process.env.RATE_LIMIT_WINDOW_MS,10) || 15 * 60 * 1000,
    max : parseInt(process.env.RATE_LIMIT_MAX,10)|| 100,
    standardHeaders:true,
    legacyHeaders : false,
    message : {status: 'fail', message : 'Too many requests. Please try again'}
})
app.use(globalLimiter);

//DATABASE CONNECTION
const startServer = async () => {
    await connectDb();
    const server = app.listen(process.env.PORT, () => {
        logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`);
    })
}
startServer();

//Routes
app.use("/api/auth", authRoutes);