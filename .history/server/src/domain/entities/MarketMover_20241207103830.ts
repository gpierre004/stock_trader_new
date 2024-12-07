// src/domain/entities/MarketMover.ts  
interface MarketMover {  
      id?: number;  
      ticker: string;  
      signalType: string;  
      value: number;  
      changePercent: number;  
      volume: number;  
      date: Date;  
    }  