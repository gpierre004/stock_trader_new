// src/interfaces/jobs/MarketDataJobs.ts  
class MarketDataJobs {  
    constructor(private readonly marketDataService: IMarketDataService) {}  
  
    setupJobs(): void {  
      // Update prices every minute during market hours  
      cron.schedule('* 9-16 * * 1-5', async () => {  
        await this.marketDataService.updatePrices();  
      }, {  
        timezone: "America/New_York"  
      });  
  
      // Calculate market movers every 5 minutes  
      cron.schedule('*/5 9-16 * * 1-5', async () => {  
        await this.marketDataService.calculateMarketMovers();  
      }, {  
        timezone: "America/New_York"  
      });  
    }  
  }  