class MarketDataController {
  constructor(marketDataService) {
    this.marketDataService = marketDataService;
  }

  async getMarketOverview(req, res) {
    try {
      const { tickers } = req.query;
      const tickerArray = tickers ? tickers.split(',') : null;
      const overview = await this.marketDataService.getMarketOverview(tickerArray);
      res.json(overview);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMarketMovers(req, res) {
    try {
      const { type, limit, tickers } = req.query;
      const tickerArray = tickers ? tickers.split(',') : null;
      const movers = await this.marketDataService.getTopMovers(type, Number(limit), tickerArray);
      res.json(movers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getBullishStocks(req, res) {
    try {
      const { tickers } = req.query;
      const tickerArray = tickers ? tickers.split(',') : null;
      const bullishStocks = await this.marketDataService.getBullishStocks(tickerArray);
      res.json(bullishStocks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getBuySellSignals(req, res) {
    try {
      const { tickers } = req.query;
      const tickerArray = tickers ? tickers.split(',') : null;
      const signals = await this.marketDataService.getBuySellSignals(tickerArray);
      res.json(signals);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMomentumAnalysis(req, res) {
    try {
      const { tickers } = req.query;
      const tickerArray = tickers ? tickers.split(',') : null;
      const momentum = await this.marketDataService.getMomentumAnalysis(tickerArray);
      res.json(momentum);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = { MarketDataController };
