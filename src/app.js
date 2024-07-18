import express from 'express';
import 'express-async-errors'
const app = express();
import { config } from 'dotenv';
import morgan from 'morgan'
config()
import authRoutes from 'api/routes/auth-routes'
import dealsRoutes from 'api/routes/deals-routes'
import { mongoDBConnect } from 'db/dbConnect'
import bodyParser from 'body-parser';
import cors from 'cors';
import { notFound, errorHandler } from 'middleware/errorMiddleware'

app.use(cors());
app.use(morgan('dev'))
//connect to DB
mongoDBConnect();

//use body parser
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json());
app.use('/dummyEndpoint', (req, res, next) => {
  res.send("Hello World working!!")
})
// set up routes
app.use('/auth', authRoutes);
app.use('/deals', dealsRoutes);
app.use(notFound)
app.use(errorHandler)

export default app;