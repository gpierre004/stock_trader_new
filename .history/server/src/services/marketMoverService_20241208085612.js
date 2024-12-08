// src/services/marketMoverService.js  
const { MarketMover, StockPrice, Company } = require('../models');  
const { Op } = require('sequelize');  
const logger = require('../utils/logger');

class MarketMoverService {  
    static async calculateMarketMovers() {  
        try {  
            const today = new Date();  
            today.setHours(0, 0, 0, 0);  

            // Get today's prices  
            const currentPrices = await StockPrice.findAll({  
                where: {  
                    date: {  
                        [Op.gte]: today  
                    }  
                },  
                include: [{  
                    model: Company,
                    as: 'company',
                    where: { active: true },  
                    attributes: ['sector']  
                }],  
                raw: false  
            });  

            const movers = [];  
            const VOLUME_THRESHOLD = 1.5; // 50% above average  
            const PRICE_CHANGE_THRESHOLD = 5; // 5% change  

            for (const price of currentPrices) {  
                try {
                    // Get previous day's price  
                    const prevPrice = await StockPrice.findOne({  
                        where: {  
                            ticker: price.ticker,  
                            date: {  
                                [Op.lt]: today  
                            }  
                        },  
                        order: [['date', 'DESC']],  
                        raw: true  
                    });  

                    if (!prevPrice) {
                        logger.warn(`No previous price found for ticker: ${price.ticker}`);
                        continue;
                    }

                    // Calculate price change  
                    const priceChange = ((price.close - prevPrice.close) / prevPrice.close) * 100;  

                    // Calculate volume change  
                    const avgVolume = await this.calculateAverageVolume(price.ticker);  
                    const volumeChange = price.volume / avgVolume;  

                    // Add to movers if meets criteria  
                    if (Math.abs(priceChange) >= PRICE_CHANGE_THRESHOLD || volumeChange >= VOLUME_THRESHOLD) {  
                        movers.push({  
                            ticker: price.ticker,  
                            signal_type: priceChange > 0 ? 'TOP_GAINER' : 'TOP_LOSER',  
                            value: price.close,  
                            change_percent: priceChange,  
                            volume: price.volume,  
                            date: today  
                        });  
                    }
                } catch (tickerError) {
                    // Log the error for the specific ticker but continue processing
                    logger.error(`Error processing ticker ${price.ticker}: ${tickerError.message}`);
                    continue;
                }  
            }  

            // Update market_movers table  
            await MarketMover.destroy({  
                where: {  
                    date: today  
                }  
            });  

            if (movers.length > 0) {  
                await MarketMover.bulkCreate(movers);  
            }  

            return {  
                processed: currentPrices.length,  
                movers: movers.length  
            };  
        } catch (error) {  
            logger.error('Error calculating market movers:', error);  
            throw error;  
        }  
    }  

    static async calculateAverageVolume(ticker, days = 30) {  
        try {
            const volumes = await StockPrice.findAll({  
                where: { ticker },  
                attributes: ['volume'],  
                order: [['date', 'DESC']],  
                limit: days,  
                raw: true  
            });  

            if (volumes.length === 0) {
                logger.warn(`No volume data found for ticker: ${ticker}`);
                return 0;
            }

            return volumes.reduce((acc, curr) => acc + curr.volume, 0) / volumes.length;
        } catch (error) {
            logger.error(`Error calculating average volume for ${ticker}:`, error);
            return 0;
        }
    }  

    static async getTopMovers(type = null, limit = 20) {  
        try {  
            const today = new Date();  
            today.setHours(0, 0, 0, 0);  

            return await MarketMover.findAll({  
                where: {  
                    date: today,  
                    ...(type && { signal_type: type })  
                },  
                order: [['change_percent', 'DESC']],  
                limit,  
                include: [{  
                    model: Company,  
                    attributes: ['name', 'sector']  
                }]  
            });  
        } catch (error) {  
            logger.error('Error fetching top movers:', error);  
            throw error;  
        }  
    }  
}  

module.exports = MarketMoverService;
