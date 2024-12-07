const rateLimit = require('express-rate-limit');  
const { RATE_LIMIT } = require('../../config/constants');  

const limiter = rateLimit({  
  windowMs: RATE_LIMIT.windowMs,  
  max: RATE_LIMIT.max  
});  

module.exports = limiter;  