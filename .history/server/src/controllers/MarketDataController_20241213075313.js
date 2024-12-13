class MarketDataController {
  constructor(marketDataService) {
    this.marketDataService = marketDataService;
  }

  async getMarketOverview(req, res) {
    try {
      const overview = await this.marketDataService.getMarketOverview();
      res.json(overview);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMarketMovers(req, res) {
    try {
      const { type, limit } = req.query;
      const movers = await this.marketDataService.getTopMovers(type, Number(limit));
      res.json(movers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getBullishStocks(req, res) {
    try {
      const bullishStocks = await this.marketDataService.getBullishStocks();
      res.json(bullishStocks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getBuySellSignals(req, res) {
    try {
      const signals = await this.marketDataService.getBuySellSignals();
      res.json(signals);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMomentumAnalysis(req, res) {
    try {
      const momentum = await this.marketDataService.getMomentumAnalysis();
      res.json(momentum);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = { MarketDataController };
