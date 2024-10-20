const jwt  = require('jsonwebtoken');

function checkAuthToken(req,res, next){
 const authToken = req.cookies.authToken;
 const refreshToken = req.cookies.refreshToken;
 
 
 if(!authToken || !refreshToken){
  return res.status(401).json({message: 'Authentication failed: no authToken or refreshToken' , ok :false});
 }

 jwt.verify(authToken, process.env.JWT_SECRET_KEY, (err, decoded) => {
  if(err){
   //authtoken expired

   //check refresh token
   jwt.verify(refreshToken,process.env.REFRESH_TOKKEN_SECRET, (err, decoded) => {
    if(refreshErr){
     //both tokens are invalid, send an errir message and prompt for login
     return res.status(401).json({message:'Authentication failed : both token are invalid', ok: false});
    }
    else{
     const newAuthToken = jwt.sign({ userId: user._id}, process.env.JWT_SECRET_KEY,{ expiresIn: '10m'});
     const newRefreshToken = jwt.sign({ userId: user._id}, process.env.JWT_REFRESH_SECRET_KEY,{ expiresIn: '30m'});

     res.cookie('authToken', newAuthToken,{httpOnly:true});
     res.cookie('refreshToken',newRefreshToken,{httpOnly:true});

     res.userId = refreshDecoded.userId;
    }
  })
 }
  else{
   req.userId = decoded.userId;
   next();
  }
 })
}

module.exports = checkAuthToken