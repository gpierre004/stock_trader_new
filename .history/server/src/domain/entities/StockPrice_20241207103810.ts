// src/domain/entities/StockPrice.ts  
interface StockPrice {  
      id?: number;  
      ticker: string;  
      date: Date;  
      open: number;  
      high: number;  
      low: number;  
      close: number;  
      volume: number;  
      adjustedClose: number;  
    }  