function errorHandler(statusCode, err, req, res, next){
 // console.error(err.stack);

 if(res.headerSent){
  return next(err);
 }
 
 console.log("ERROR MIDDLEWARE CALLED")
 res.status(statusCode || 500).json({
  ok: false, //set the "ok" field to flase for errors
  message: err.message,
 });
}

module.exports = errorHandler;