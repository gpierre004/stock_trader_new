CREATE OR REPLACE VIEW stock_performance_comparison AS
WITH recent_performance AS (
    SELECT 
        ticker,
        date,
        close,
        MAX(close) OVER (PARTITION BY ticker) AS latest_close,
        MIN(close) OVER (PARTITION BY ticker) AS min_close_30d,
        MAX(close) OVER (PARTITION BY ticker) AS max_close_30d,
        FIRST_VALUE(close) OVER (PARTITION BY ticker ORDER BY date) AS start_close_30d,
        FIRST_VALUE(close) OVER (PARTITION BY ticker ORDER BY date DESC) AS end_close_30d
    FROM stock_prices
    WHERE date >= (SELECT MAX(date) - INTERVAL '30 days' FROM stock_prices)
)
SELECT DISTINCT
    ticker,
    latest_close,
    start_close_30d,
    end_close_30d,
    min_close_30d,
    max_close_30d,
    ROUND((end_close_30d / start_close_30d - 1) * 100, 2) AS thirty_day_return,
    ROUND((max_close_30d / min_close_30d - 1) * 100, 2) AS thirty_day_range,
    CASE 
        WHEN (end_close_30d / start_close_30d - 1) * 100 > 10 THEN 'Strong Positive'
        WHEN (end_close_30d / start_close_30d - 1) * 100 > 5 THEN 'Moderate Positive'
        WHEN (end_close_30d / start_close_30d - 1) * 100 < -10 THEN 'Strong Negative'
        WHEN (end_close_30d / start_close_30d - 1) * 100 < -5 THEN 'Moderate Negative'
        ELSE 'Neutral'
    END AS performance_trend
FROM recent_performance;


CREATE OR REPLACE VIEW stock_volume_trend AS
WITH volume_stats AS (
    SELECT 
        ticker,
        date,
        volume,
        AVG(volume) OVER (PARTITION BY ticker ORDER BY date 
            ROWS BETWEEN 30 PRECEDING AND CURRENT ROW) AS avg_daily_volume_last_30d,
        AVG(volume) OVER (PARTITION BY ticker ORDER BY date 
            ROWS BETWEEN 90 PRECEDING AND 60 PRECEDING) AS avg_daily_volume_prior_30d
    FROM stock_prices
    WHERE date >= (SELECT MAX(date) - INTERVAL '90 days' FROM stock_prices)
)
SELECT 
    ticker,
    ROUND(AVG(avg_daily_volume_last_30d), 0) AS current_avg_daily_volume,
    ROUND(AVG(avg_daily_volume_prior_30d), 0) AS prior_avg_daily_volume,
    ROUND((AVG(avg_daily_volume_last_30d) / AVG(avg_daily_volume_prior_30d) - 1) * 100, 2) AS volume_change_percentage,
    CASE 
        WHEN AVG(avg_daily_volume_last_30d) > AVG(avg_daily_volume_prior_30d) * 1.5 THEN 'Significant Volume Increase'
        WHEN AVG(avg_daily_volume_last_30d) > AVG(avg_daily_volume_prior_30d) * 1.2 THEN 'Moderate Volume Increase'
        WHEN AVG(avg_daily_volume_last_30d) < AVG(avg_daily_volume_prior_30d) * 0.8 THEN 'Moderate Volume Decrease'
        WHEN AVG(avg_daily_volume_last_30d) < AVG(avg_daily_volume_prior_30d) * 0.5 THEN 'Significant Volume Decrease'
        ELSE 'Stable Volume'
    END AS volume_trend
FROM volume_stats
GROUP BY ticker;


-- 6. Consolidated Trading Signals View
CREATE OR REPLACE VIEW trading_signals AS
SELECT 
    m.ticker,
    m.latest_close,
    m.thirty_day_momentum,
    m.ninety_day_momentum,
    m.momentum_trend,
    v.volume_trend,
    vol.volatility_category,
    p.performance_trend,
    sr.support_level_25,
    sr.resistance_level_75,
    CASE 
        WHEN m.momentum_trend = 'Strong Bullish' AND 
             v.volume_trend = 'Significant Volume Increase' AND 
             vol.volatility_category = 'Low Volatility' 
        THEN 'STRONG BUY'
        
        WHEN m.momentum_trend = 'Moderate Bullish' AND 
             v.volume_trend = 'Moderate Volume Increase'
        THEN 'BUY'
        
        WHEN m.momentum_trend = 'Strong Bearish' AND 
             v.volume_trend = 'Significant Volume Decrease'
        THEN 'STRONG SELL'
        
        WHEN m.momentum_trend = 'Moderate Bearish' AND 
             v.volume_trend = 'Moderate Volume Decrease'
        THEN 'SELL'
        
        ELSE 'HOLD'
    END AS overall_signal
FROM stock_momentum m
JOIN stock_volume_trend v ON m.ticker = v.ticker
JOIN stock_volatility vol ON m.ticker = vol.ticker
JOIN stock_performance_comparison p ON m.ticker = p.ticker
JOIN stock_support_resistance sr ON m.ticker = sr.ticker;

-- 3. Volatility Analysis View
CREATE OR REPLACE VIEW stock_volatility AS
SELECT 
    ticker,
    ROUND(AVG(high - low), 2) AS avg_daily_range,
    ROUND(STDDEV(close), 2) AS price_standard_deviation,
    ROUND(AVG(high - low) / AVG(close) * 100, 2) AS volatility_percentage,
    CASE 
        WHEN STDDEV(close) / AVG(close) * 100 > 15 THEN 'High Volatility'
        WHEN STDDEV(close) / AVG(close) * 100 > 10 THEN 'Moderate Volatility'
        WHEN STDDEV(close) / AVG(close) * 100 < 5 THEN 'Low Volatility'
        ELSE 'Normal Volatility'
    END AS volatility_category
FROM stock_prices
WHERE date >= (SELECT MAX(date) - INTERVAL '90 days' FROM stock_prices)
GROUP BY ticker;

-- 1. Price Momentum View (30-day and 90-day price changes)
CREATE OR REPLACE VIEW stock_momentum AS
WITH recent_prices AS (
    SELECT 
        ticker,
        MAX(CASE WHEN date = (SELECT MAX(date) FROM stock_prices) THEN close END) AS latest_close,
        MAX(CASE WHEN date = (SELECT MAX(date) - INTERVAL '30 days' FROM stock_prices) THEN close END) AS close_30d_ago,
        MAX(CASE WHEN date = (SELECT MAX(date) - INTERVAL '90 days' FROM stock_prices) THEN close END) AS close_90d_ago
    FROM stock_prices
    GROUP BY ticker
)
SELECT 
    ticker,
    latest_close,
    close_30d_ago,
    close_90d_ago,
    ROUND((latest_close / close_30d_ago - 1) * 100, 2) AS thirty_day_momentum,
    ROUND((latest_close / close_90d_ago - 1) * 100, 2) AS ninety_day_momentum,
    CASE 
        WHEN (latest_close / close_30d_ago - 1) * 100 > 10 THEN 'Strong Bullish'
        WHEN (latest_close / close_30d_ago - 1) * 100 > 5 THEN 'Moderate Bullish'
        WHEN (latest_close / close_30d_ago - 1) * 100 < -10 THEN 'Strong Bearish'
        WHEN (latest_close / close_30d_ago - 1) * 100 < -5 THEN 'Moderate Bearish'
        ELSE 'Neutral'
    END AS momentum_trend
FROM recent_prices;
