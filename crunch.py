import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import numpy as np
from pathlib import Path
import json
from dataclasses import dataclass, asdict
from typing import Dict, Any

@dataclass
class MarketData:
    symbol: str
    start_date: str
    end_date: str
    interval: str = "1d"
    data: Optional[pd.DataFrame] = None

class DataAcquisition:
    def __init__(self, cache_dir: str = "./data"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        
    def get_historical_data(self, symbol: str, start_date: str, 
                           end_date: str, interval: str = "1d") -> MarketData:
        """Get historical market data with caching and fallbacks"""
        cache_file = self.cache_dir / f"{symbol}_{interval}_{start_date}_{end_date}.json"
        
        try:
            # Try cache first
            if cache_file.exists():
                with open(cache_file, 'r') as f:
                    data = json.load(f)
                    return MarketData(**data)
            
            # Try Yahoo Finance
            try:
                yf_data = yf.download(
                    symbol,
                    start=start_date,
                    end=end_date,
                    interval=interval
                )
                
                # Validate data
                if yf_data.empty:
                    raise ValueError(f"No data available for {symbol}")
                
                market_data = MarketData(
                    symbol=symbol,
                    start_date=start_date,
                    end_date=end_date,
                    interval=interval,
                    data=yf_data
                )
                
                # Cache the data
                with open(cache_file, 'w') as f:
                    json.dump(asdict(market_data), f)
                
                return market_data
            
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to fetch data from Yahoo Finance: {str(e)}"
                )
                
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Data acquisition failed: {str(e)}"
            )

class BacktestReport:
    def __init__(self):
        self.results = {
            'metrics': {},
            'parameters': {},
            'performance': {},
            'errors': []
        }
    
    def add_metric(self, name: str, value: Any):
        """Add a metric to the report"""
        self.results['metrics'][name] = value
    
    def add_parameter(self, name: str, value: Any):
        """Add a parameter to the report"""
        self.results['parameters'][name] = value
    
    def add_error(self, error: str):
        """Add an error to the report"""
        self.results['errors'].append(error)
    
    def generate_report(self) -> Dict:
        """Generate the final report"""
        return self.results

class TopologyAnalyzer:
    def __init__(self, epsilon: float = 1.0, max_dim: int = 2):
        self.vr = VietorisRipsComplex(epsilon, max_dim)
        self.ph = PersistentHomology()
        self.data_acquisition = DataAcquisition()
        self.report = BacktestReport()
    
    def analyze_market_data(self, symbol: str, 
                           start_date: str, 
                           end_date: str,
                           epsilon: float = 1.0) -> Dict:
        """Analyze market data with comprehensive reporting"""
        try:
            # Get market data
            market_data = self.data_acquisition.get_historical_data(
                symbol, start_date, end_date
            )
            
            # Validate data
            if market_data.data is None or market_data.data.empty:
                raise ValueError("No valid market data available")
            
            # Create point cloud
            points = self._create_point_cloud(market_data.data)
            
            # Build complex and calculate persistence
            self.vr.build_complex(points)
            diagrams = self.ph.calculate_persistence(self.vr.complex)
            
            # Generate report
            self._generate_analysis_report(
                symbol, start_date, end_date, epsilon, diagrams
            )
            
            return self.report.generate_report()
            
        except Exception as e:
            self.report.add_error(f"Analysis failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Analysis failed: {str(e)}"
            )
    
    def _create_point_cloud(self, data: pd.DataFrame) -> np.ndarray:
        """Create point cloud from market data"""
        windows = []
        for i in range(len(data)-self.vr.max_dim):
            window = data['Close'].iloc[i:i+self.vr.max_dim].values
            normalized = (window - window.mean()) / window.std()
            windows.append(normalized)
        return np.array(windows)
    
    def _generate_analysis_report(self, symbol: str, start_date: str,
                                 end_date: str, epsilon: float,
                                 diagrams: List[List[Tuple[float, float]]]):
        """Generate comprehensive analysis report"""
        self.report.add_parameter('symbol', symbol)
        self.report.add_parameter('date_range', f"{start_date} to {end_date}")
        self.report.add_parameter('epsilon', epsilon)
        
        # Add persistence metrics
        for dim, diagram in enumerate(diagrams):
            if diagram:
                persistence = [death - birth for birth, death in diagram]
                self.report.add_metric(
                    f'avg_persistence_dim_{dim}',
                    np.mean(persistence)
                )
                self.report.add_metric(
                    f'max_persistence_dim_{dim}',
                    np.max(persistence)
                )
                self.report.add_metric(
                    f'num_features_dim_{dim}',
                    len(diagram)
                )

def main():
    """Main entry point for the application"""
    app = FastAPI(
        title="Topology Analysis API",
        description="API for financial topology analysis",
        version="1.0.0"
    )
    
    analyzer = TopologyAnalyzer()
    
    @app.post("/analyze")
    async def analyze(data: MarketData):
        return analyzer.analyze_market_data(
            data.symbol,
            data.start_date,
            data.end_date,
            data.interval
        )
    
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    main()