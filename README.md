  

## API Endpoints  

### Authentication  
- POST `/api/register` - User registration  
- POST `/api/login` - User login  

### Market Data  
- GET `/api/companies` - List all companies  
- GET `/api/stock-prices` - Get historical stock prices  
- POST `/api/stocks/update-prices` - Update stock prices  

### Watchlist  
- GET `/api/watchlist` - Get user's watchlist  
- POST `/api/watchlist` - Add stock to watchlist  

### Transactions  
- GET `/api/transactions` - Get user's transactions  
- POST `/api/transactions` - Create new transaction  

## Scheduled Tasks  
The application includes automated tasks:  
- Stock price updates (Market hours: 9:30 AM - 4:00 PM ET)  
- Market movers calculation (Every 5 minutes during market hours)  
- Watchlist updates (4:00 PM ET daily)  

## Data Models  

### Company  
- ticker (PK)  
- name  
- sector  
- industry  
- active  

### StockPrice  
- ticker (FK)  
- date  
- open/high/low/close  
- volume  
- adjusted_close  

### Transaction  
- purchase_id (PK)  
- ticker  
- quantity  
- type  
- price  
- portfolio_id  

### Watchlist  
- ticker  
- date_added  
- metrics  
- signals  

## Contributing  
1. Fork the repository  
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)  
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)  
4. Push to the branch (`git push origin feature/AmazingFeature`)  
5. Open a Pull Request  

## License  
This project is licensed under the ISC License.  

## Acknowledgments  
- Yahoo Finance API for real-time market data  
- PostgreSQL for robust data storage  
- Sequelize team for the excellent ORM  
# Start production server  
npm start  

# Start development server with hot reload  
npm run dev  

# Database migrations  
npm run migrate  
npm run migrate:undo  
npm run migrate:undo:all  

# Seed database  
npm run seed  

# Run tests  
npm test  


# Install dependencies  
npm install  

# Install dev dependencies  
npm install --save-dev  

# Create the database first if it doesn't exist  
npx sequelize-cli db:create  

# Run migrations  
npx sequelize-cli db:migrate  

Manual update of stock prices: curl -X POST http://localhost:3001/api/stocks/update-market-data

Manual update of companies: http://localhost:3001/api/stocks/refresh-sp500

For full history: curl -X POST "http://localhost:3001/api/stocks/update-market-data?historical=true"

For day update: curl -X POST http://localhost:3001/api/stocks/update-market-data