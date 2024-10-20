const express = require('express');
const router = express.Router();

const User = require('../Models/UserSchema')
const Movie = require('../Models/MovieSchema')
const Booking = require('../Models/BookingSchema')
const Screen = require('../Models/ScreenSchema')


const errorHandler = require('../Middlewares/errorMiddleware');
const authTokenHandler = require('../Middlewares/checkAuthToken');
const adminTokenHandler = require('../Middlewares/checkAdminToken');


function createResponse(ok, message, data) {
 return {
     ok,
     message,
     data,
 };
}

router.get('/test', async (req, res) => {
 res.json({
     message: "Movie api is working"
 })
})

// admin access
router.post('/createmovie', adminTokenHandler, async (req, res, next) => {
 try {
     const { title, description, portraitImgUrl, landscapeImgUrl, rating, genre, duration } = req.body;

     const newMovie = new Movie({ title, description, portraitImgUrl, landscapeImgUrl, rating, genre, duration })
     await newMovie.save();
     res.status(201).json({
         ok: true,
         message: "Movie added successfully"
     });
 }
 catch (err) {
     next(err); // Pass any errors to the error handling middleware
 }
})
router.post('/addcelebtomovie', adminTokenHandler, async (req, res, next) => {
 try {
     const { movieId, celebType, celebName, celebRole, celebImage } = req.body;
     const movie = await Movie.findById(movieId);
     if (!movie) {
         return res.status(404).json({
             ok: false,
             message: "Movie not found"
         });
     }
     const newCeleb = {
         celebType,
         celebName,
         celebRole,
         celebImage
     };
     if (celebType === "cast") {
         movie.cast.push(newCeleb);
     } else {
         movie.crew.push(newCeleb);
     }
     await movie.save();

     res.status(201).json({
         ok: true,
         message: "Celeb added successfully"
     });
 }
 catch (err) {
     next(err); // Pass any errors to the error handling middleware
 }
})
router.post('/createscreen', adminTokenHandler, async (req, res, next) => {
 try {
     const { name, location, seats, city, screenType } = req.body;
     const newScreen = new Screen({
         name,
         location,
         seats,
         city: city.toLowerCase(),
         screenType,
         movieSchedules: []
     });

     await newScreen.save();


     res.status(201).json({
         ok: true,
         message: "Screen added successfully"
     });
 }
 catch (err) {
     console.log(err);
     next(err); // Pass any errors to the error handling middleware
 }
})
router.post('/addmoviescheduletoscreen', adminTokenHandler, async (req, res, next) => {
 console.log("Inside addmoviescheduletoscreen")
 try {
     const { screenId, movieId, showTime, showDate } = req.body;
     const screen = await Screen.findById(screenId);
     if (!screen) {
         return res.status(404).json({
             ok: false,
             message: "Screen not found"
         });
     }

     const movie = await Movie.findById(movieId);
     if (!movie) {
         return res.status(404).json({
             ok: false,
             message: "Movie not found"
         });
     }

     screen.movieSchedules.push({
         movieId,
         showTime,
         notavailableseats: [],
         showDate
     });

     await screen.save();

     res.status(201).json({
         ok: true,
         message: "Movie schedule added successfully"
     });

 }
 catch (err) {
     next(err); // Pass any errors to the error handling middleware
 }
})

// user access
router.post('/bookticket', authTokenHandler, async (req, res, next) => {
 try {
     const { showTime, showDate, movieId, screenId, seats, totalPrice, paymentId, paymentType } = req.body;
     console.log(req.body);

     // You can create a function to verify payment id

     const screen = await Screen.findById(screenId);

     if (!screen) {
         return res.status(404).json({
             ok: false,
             message: "Theatre not found"
         });
     }



     const movieSchedule = screen.movieSchedules.find(schedule => {
         console.log(schedule);
         let showDate1 = new Date(schedule.showDate);
         let showDate2 = new Date(showDate);
         if (showDate1.getDay() === showDate2.getDay() &&
             showDate1.getMonth() === showDate2.getMonth() &&
             showDate1.getFullYear() === showDate2.getFullYear() &&
             schedule.showTime === showTime &&
             schedule.movieId == movieId) {
             return true;
         }
         return false;
     });

     if (!movieSchedule) {
         return res.status(404).json({
             ok: false,
             message: "Movie schedule not found"
         });
     }

     const user = await User.findById(req.userId);
     if (!user) {
         return res.status(404).json({
             ok: false,
             message: "User not found"
         });
     }
     console.log('before newBooking done');
     const newBooking = new Booking({ userId: req.userId, showTime, showDate, movieId, screenId, seats, totalPrice, paymentId, paymentType })
     await newBooking.save();
     console.log('newBooking done');



     movieSchedule.notAvailableSeats.push(...seats);
     await screen.save();
     console.log('screen saved');

     user.bookings.push(newBooking._id);
     await user.save();
     console.log('user saved');
     res.status(201).json({
         ok: true,
         message: "Booking successful"
     });

 }
 catch (err) {
     next(err); // Pass any errors to the error handling middleware
 }
})

router.get('/movies', async (req, res, next) => {
 try {
     const movies = await Movie.find();

     // Return the list of movies as JSON response
     res.status(200).json({
         ok: true,
         data: movies,
         message: 'Movies retrieved successfully'
     });
 }
 catch (err) {
     next(err); // Pass any errors to the error handling middleware
 }
})
router.get('/screensbycity/:city', async (req, res, next) => {
 const city = req.params.city.toLowerCase();

 try {
     const screens = await Screen.find({ city });
     if (!screens || screens.length === 0) {
         return res.status(404).json(createResponse(false, 'No screens found in the specified city', null));
     }

     res.status(200).json(createResponse(true, 'Screens retrieved successfully', screens));
 }
 catch (err) {
     next(err); // Pass any errors to the error handling middleware
 }
});
router.use(errorHandler)

module.exports = router;
