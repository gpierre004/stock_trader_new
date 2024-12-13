module.exports = {  
    DAYS_THRESHOLD: 90,  
    PRICE_DROP_THRESHOLD: 0.25,  
    RECOVERY_THRESHOLD: 0.70,  
    VOLUME_INCREASE_THRESHOLD: 1.5,  
    WATCH_LIST_THRESHOLD: 0.25,  
    TREND_PERIOD: 1080,  
    JWT_EXPIRY: '24h',  
    RATE_LIMIT: {  
      windowMs: 15 * 60 * 1000,  
      max: 100  
    }  
  };
