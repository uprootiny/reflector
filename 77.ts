import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Bar, Scatter, AreaChart, Area, ResponsiveContainer, ScatterChart, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { AlertCircle, ArrowRight, Play, Download, Upload, Settings, Filter, RefreshCw, Save, TrendingUp, Maximize2, MinusCircle, PlusCircle, Calendar, GitBranch, Activity, Brain, Target } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const PortfolioOptimizer = ({ assets, constraints }) => {
  const [optimizationTarget, setOptimizationTarget] = useState('sharpe');
  const [riskConstraints, setRiskConstraints] = useState({
    maxDrawdown: 20,
    maxVolatility: 15,
    maxLeverage: 1.5
  });

  const optimizationResults = useMemo(() => ({
    weights: [
      { asset: 'Strategy 1', weight: 0.35, contribution: 0.42 },
      { asset: 'Strategy 2', weight: 0.25, contribution: 0.28 },
      { asset: 'Strategy 3', weight: 0.20, contribution: 0.18 },
      { asset: 'Strategy 4', weight: 0.20, contribution: 0.12 }
    ],
    metrics: {
      expectedReturn: 12.5,
      volatility: 8.2,
      sharpeRatio: 1.52,
      sortino: 2.1,
      maxDrawdown: 15.4
    },
    efficientFrontier: Array.from({ length: 20 }, (_, i) => ({
      risk: 5 + i * 0.5,
      return: 8 + Math.sqrt(i) * 2 + Math.random()
    }))
  }), []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Optimization Target</h4>
              <select 
                className="w-full p-2 border rounded"
                value={optimizationTarget}
                onChange={(e) => setOptimizationTarget(e.target.value)}
              >
                <option value="sharpe">Maximize Sharpe Ratio</option>
                <option value="return">Maximize Return</option>
                <option value="minRisk">Minimize Risk</option>
                <option value="sortino">Maximize Sortino Ratio</option>
              </select>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Risk Constraints</h4>
              <div className="space-y-2">
                {Object.entries(riskConstraints).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <label className="text-sm">{key}:</label>
                    <input
                      type="number"
                      className="w-24 p-1 border rounded"
                      value={value}
                      onChange={(e) => setRiskConstraints(prev => ({
                        ...prev,
                        [key]: parseFloat(e.target.value)
                      }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="risk" name="Risk (%)" />
                  <YAxis type="number" dataKey="return" name="Return (%)" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Efficient Frontier" data={optimizationResults.efficientFrontier} fill="#2563eb" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={optimizationResults.weights}
                    dataKey="weight"
                    nameKey="asset"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#2563eb"
                    label
                  >
                    {optimizationResults.weights.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 360 / optimizationResults.weights.length}, 70%, 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Optimized Portfolio Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(optimizationResults.metrics).map(([key, value]) => (
              <div key={key}>
                <div className="text-sm text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                <div className="text-2xl font-semibold">
                  {typeof value === 'number' ? value.toFixed(2) : value}
                  {key.includes('return') || key.includes('drawdown') ? '%' : ''}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const MachineLearningModule = () => {
  const [model, setModel] = useState('randomForest');
  const [hyperparameters, setHyperparameters] = useState({
    randomForest: {
      nEstimators: 100,
      maxDepth: 10,
      minSamplesSplit: 2
    },
    xgboost: {
      learningRate: 0.1,
      maxDepth: 6,
      nEstimators: 100
    },
    lstm: {
      layers: 2,
      units: 50,
      dropout: 0.2
    }
  });

  const featureImportance = useMemo(() => ([
    { feature: 'RSI', importance: 0.85 },
    { feature: 'MA Cross', importance: 0.72 },
    { feature: 'Volume', importance: 0.65 },
    { feature: 'Volatility', importance: 0.58 },
    { feature: 'Momentum', importance: 0.45 }
  ]), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Machine Learning Integration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Model Selection</h4>
            <select
              className="w-full p-2 border rounded"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="randomForest">Random Forest</option>
              <option value="xgboost">XGBoost</option>
              <option value="lstm">LSTM</option>
            </select>

            <div className="mt-4">
              <h4 className="font-medium mb-2">Hyperparameters</h4>
              <div className="space-y-2">
                {Object.entries(hyperparameters[model]).map(([param, value]) => (
                  <div key={param} className="flex items-center gap-2">
                    <label className="text-sm">{param}:</label>
                    <input
                      type="number"
                      className="w-24 p-1 border rounded"
                      value={value}
                      onChange={(e) => setHyperparameters(prev => ({
                        ...prev,
                        [model]: {
                          ...prev[model],
                          [param]: parseFloat(e.target.value)
                        }
                      }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Feature Importance</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureImportance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="feature" type="category" />
                  <Tooltip />
                  <Bar dataKey="importance" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RiskScenarios = () => {
  const [scenarios, setScenarios] = useState([
    { name: 'Market Crash', probability: 0.05, impact: -25.5, var: -18.2 },
    { name: 'Rate Hike', probability: 0.15, impact: -12.3, var: -8.5 },
    { name: 'Vol Spike', probability: 0.20, impact: -15.8, var: -11.2 },
    { name: 'Liquidity Crisis', probability: 0.08, impact: -20.1, var: -15.4 }
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Scenarios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Scenario</th>
                  <th className="text-right p-2">Probability</th>
                  <th className="text-right p-2">Impact (%)</th>
                  <th className="text-right p-2">VaR (%)</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((scenario) => (
                  <tr key={scenario.name} className="border-b">
                    <td className="p-2">{scenario.name}</td>
                    <td className="text-right p-2">{(scenario.probability * 100).toFixed(1)}%</td>
                    <td className="text-right p-2 text-red-600">{scenario.impact.toFixed(1)}%</td>
                    <td className="text-right p-2">{scenario.var.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={scenarios}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 30]} />
                <Radar name="Impact" dataKey="impact" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                <Radar name="VaR" dataKey="var" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Continue with more components...import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Bar, Scatter, AreaChart, Area, ResponsiveContainer, ScatterChart } from 'recharts';
import { AlertCircle, ArrowRight, Play, Download, Upload, Settings, Filter, RefreshCw, Save, TrendingUp, Maximize2, MinusCircle, PlusCircle, Calendar, GitBranch, Activity } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const FactorAnalysis = ({ results }) => {
  const factorData = useMemo(() => ([
    { factor: 'Momentum', exposure: 0.45, tStat: 3.2, significance: 0.001 },
    { factor: 'Value', exposure: -0.12, tStat: -1.1, significance: 0.27 },
    { factor: 'Size', exposure: 0.08, tStat: 0.7, significance: 0.48 },
    { factor: 'Quality', exposure: 0.32, tStat: 2.8, significance: 0.005 },
    { factor: 'Volatility', exposure: -0.25, tStat: -2.2, significance: 0.028 }
  ]), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Factor Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Factor</th>
                  <th className="text-right p-2">Exposure</th>
                  <th className="text-right p-2">t-Stat</th>
                  <th className="text-right p-2">p-value</th>
                </tr>
              </thead>
              <tbody>
                {factorData.map((factor) => (
                  <tr key={factor.factor} className="border-b">
                    <td className="p-2">{factor.factor}</td>
                    <td className={`text-right p-2 ${factor.exposure > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {factor.exposure.toFixed(2)}
                    </td>
                    <td className="text-right p-2">{factor.tStat.toFixed(2)}</td>
                    <td className="text-right p-2">{factor.significance < 0.05 ? 
                      <span className="text-green-600">{factor.significance.toFixed(3)}</span> : 
                      factor.significance.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={factorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="factor" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="exposure" fill={(entry) => entry.exposure > 0 ? '#16a34a' : '#dc2626'} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CrossValidation = ({ results }) => {
  const [folds, setFolds] = useState(5);
  const [currentFold, setCurrentFold] = useState(0);
  
  const foldResults = useMemo(() => 
    Array.from({ length: folds }, (_, i) => ({
      fold: i + 1,
      trainSharpe: 1.5 + Math.random() * 0.5,
      testSharpe: 1.2 + Math.random() * 0.5,
      trainDrawdown: -(10 + Math.random() * 5),
      testDrawdown: -(12 + Math.random() * 6)
    })), [folds]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          K-Fold Cross Validation
          <div className="flex items-center gap-2">
            <label className="text-sm">Folds:</label>
            <select 
              className="p-1 border rounded"
              value={folds}
              onChange={(e) => setFolds(parseInt(e.target.value))}
            >
              {[3, 5, 10].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={foldResults}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fold" />
                <YAxis yAxisId="sharpe" />
                <YAxis yAxisId="drawdown" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="sharpe" type="monotone" dataKey="trainSharpe" stroke="#2563eb" name="Train Sharpe" />
                <Line yAxisId="sharpe" type="monotone" dataKey="testSharpe" stroke="#16a34a" name="Test Sharpe" />
                <Bar yAxisId="drawdown" dataKey="trainDrawdown" fill="#93c5fd" name="Train Drawdown" />
                <Bar yAxisId="drawdown" dataKey="testDrawdown" fill="#86efac" name="Test Drawdown" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Training Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Average Sharpe:</span>
                  <span className="font-medium">
                    {(foldResults.reduce((acc, fold) => acc + fold.trainSharpe, 0) / folds).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average Drawdown:</span>
                  <span className="font-medium">
                    {(foldResults.reduce((acc, fold) => acc + fold.trainDrawdown, 0) / folds).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Test Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Average Sharpe:</span>
                  <span className="font-medium">
                    {(foldResults.reduce((acc, fold) => acc + fold.testSharpe, 0) / folds).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average Drawdown:</span>
                  <span className="font-medium">
                    {(foldResults.reduce((acc, fold) => acc + fold.testDrawdown, 0) / folds).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TransactionAnalysis = ({ results }) => {
  const transactionStats = useMemo(() => ({
    avgSlippage: 0.12,
    avgSpread: 0.08,
    avgImpact: 0.15,
    totalCosts: 2450,
    costPerTrade: 12.25,
    largestCost: 45.80,
    costByVolume: [
      { volume: '0-1000', avgCost: 8.5, count: 45 },
      { volume: '1000-5000', avgCost: 12.3, count: 78 },
      { volume: '5000-10000', avgCost: 15.8, count: 34 },
      { volume: '10000+', avgCost: 22.4, count: 12 }
    ]
  }), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Cost Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <div className="text-sm text-gray-600">Average Slippage</div>
            <div className="text-2xl font-semibold">{transactionStats.avgSlippage}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Average Spread</div>
            <div className="text-2xl font-semibold">{transactionStats.avgSpread}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Average Impact</div>
            <div className="text-2xl font-semibold">{transactionStats.avgImpact}%</div>
          </div>
        </div>

        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={transactionStats.costByVolume}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="volume" />
              <YAxis yAxisId="cost" />
              <YAxis yAxisId="count" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="cost" dataKey="avgCost" fill="#2563eb" name="Avg Cost ($)" />
              <Line yAxisId="count" type="monotone" dataKey="count" stroke="#16a34a" name="Trade Count" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">Total Costs</div>
            <div className="text-2xl font-semibold">${transactionStats.totalCosts}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Cost per Trade</div>
            <div className="text-2xl font-semibold">${transactionStats.costPerTrade}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Largest Cost</div>
            <div className="text-2xl font-semibold">${transactionStats.largestCost}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Continue with more components...import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Bar, Scatter, AreaChart, Area } from 'recharts';
import { AlertCircle, ArrowRight, Play, Download, Upload, Settings, Filter, RefreshCw, Save, TrendingUp, Maximize2, MinusCircle, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const IndicatorConfig = ({ indicator, onUpdate, onDelete }) => {
  return (
    <div className="p-4 border rounded-lg space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">{indicator.type}</h4>
        <button onClick={() => onDelete()} className="text-red-500 hover:text-red-700">
          <MinusCircle className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(indicator.parameters || {}).map(([key, value]) => (
          <div key={key}>
            <label className="text-sm text-gray-600">{key}</label>
            <input
              type="number"
              className="w-full p-1 border rounded"
              value={value}
              onChange={(e) => onUpdate({ ...indicator, parameters: { ...indicator.parameters, [key]: parseFloat(e.target.value) } })}
            />
          </div>
        ))}
        <div className="col-span-2">
          <label className="text-sm text-gray-600">Weight</label>
          <input
            type="number"
            className="w-full p-1 border rounded"
            value={indicator.weight}
            min="0"
            max="1"
            step="0.1"
            onChange={(e) => onUpdate({ ...indicator, weight: parseFloat(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
};

const OptimizationPanel = ({ onOptimize }) => {
  const [params, setParams] = useState({
    population: 50,
    generations: 20,
    crossoverRate: 0.8,
    mutationRate: 0.1
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-green-500 text-white rounded flex items-center gap-2 hover:bg-green-600">
          <Settings className="w-4 h-4" />
          Optimize Parameters
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Strategy Optimization</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {Object.entries(params).map(([key, value]) => (
            <div key={key}>
              <label className="text-sm text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={value}
                onChange={(e) => setParams({ ...params, [key]: parseFloat(e.target.value) })}
              />
            </div>
          ))}
          <button
            className="w-full px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => onOptimize(params)}
          >
            Start Optimization
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const WalkForwardAnalysis = ({ results }) => {
  if (!results) return null;

  const samples = Array.from({ length: 5 }, (_, i) => ({
    period: `Sample ${i + 1}`,
    inSample: Math.random() * 2 + 1,
    outOfSample: Math.random() * 2 + 0.5
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Walk-Forward Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ComposedChart data={samples} width={800} height={250}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="inSample" fill="#2563eb" name="In-Sample Sharpe" />
            <Bar dataKey="outOfSample" fill="#16a34a" name="Out-of-Sample Sharpe" />
          </ComposedChart>
        </div>
      </CardContent>
    </Card>
  );
};

const MonteCarloAnalysis = ({ results }) => {
  if (!results) return null;

  const simulations = Array.from({ length: 100 }, (_, i) => ({
    time: i,
    ...Array.from({ length: 10 }, (_, j) => ({
      [`sim${j}`]: 10000 * Math.exp(0.0002 * i + 0.0001 * i * Math.random())
    })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monte Carlo Simulations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <LineChart data={simulations} width={800} height={250}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            {Array.from({ length: 10 }, (_, i) => (
              <Line
                key={i}
                type="monotone"
                dataKey={`sim${i}`}
                stroke={`hsl(${i * 36}, 70%, 50%)`}
                dot={false}
                strokeWidth={1}
              />
            ))}
          </LineChart>
        </div>
      </CardContent>
    </Card>
  );
};

const MarketRegimeAnalysis = ({ results }) => {
  if (!results) return null;

  const regimes = [
    { name: 'Trending Bull', sharpe: 2.1, calmar: 1.8, trades: 45 },
    { name: 'Trending Bear', sharpe: 1.5, calmar: 1.2, trades: 38 },
    { name: 'Choppy', sharpe: 0.8, calmar: 0.6, trades: 62 },
    { name: 'Low Vol', sharpe: 1.2, calmar: 1.4, trades: 28 },
    { name: 'High Vol', sharpe: 1.7, calmar: 0.9, trades: 55 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by Market Regime</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Regime</th>
                <th className="text-right p-2">Sharpe</th>
                <th className="text-right p-2">Calmar</th>
                <th className="text-right p-2">Trades</th>
              </tr>
            </thead>
            <tbody>
              {regimes.map((regime) => (
                <tr key={regime.name} className="border-b">
                  <td className="p-2">{regime.name}</td>
                  <td className="text-right p-2">{regime.sharpe.toFixed(2)}</td>
                  <td className="text-right p-2">{regime.calmar.toFixed(2)}</td>
                  <td className="text-right p-2">{regime.trades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

// Add more components and features...import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Bar, Scatter } from 'recharts';
import { AlertCircle, ArrowRight, Play, Download, Upload, Settings, Filter, RefreshCw, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BacktestWorkbench = () => {
  const [activeTab, setActiveTab] = useState('strategy');
  const [data, setData] = useState([]);
  const [strategy, setStrategy] = useState('');
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [dataValidation, setDataValidation] = useState({ status: 'pending', issues: [] });
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  
  const defaultStrategy = `{
    "name": "Enhanced MA Crossover with Risk Management",
    "parameters": {
      "shortPeriod": 10,
      "longPeriod": 50,
      "stopLoss": 2,
      "takeProfit": 4,
      "maxPositionSize": 0.1,
      "riskPerTrade": 0.02
    },
    "indicators": [
      {"type": "SMA", "period": 10, "weight": 0.3},
      {"type": "EMA", "period": 21, "weight": 0.3},
      {"type": "RSI", "period": 14, "weight": 0.2},
      {"type": "MACD", "parameters": {"fast": 12, "slow": 26, "signal": 9}, "weight": 0.2}
    ],
    "filters": {
      "volatility": {"type": "ATR", "period": 14, "threshold": 1.5},
      "volume": {"type": "SMA", "period": 20, "threshold": 1.0}
    },
    "validation": {
      "requireConfirmation": true,
      "minTrades": 30,
      "minWinRate": 0.45,
      "maxDrawdown": 0.25
    }
  }`;

  const validateData = (data) => {
    const issues = [];
    // Simulate data validation
    if (data.length < 100) issues.push('Insufficient data points');
    if (data.some(d => !d.close)) issues.push('Missing price data');
    if (data.some(d => d.volume === 0)) issues.push('Zero volume detected');
    
    return {
      status: issues.length === 0 ? 'valid' : 'invalid',
      issues
    };
  };

  const calculateIndicators = (data, indicators) => {
    // Simulate indicator calculations
    return data.map(d => ({
      ...d,
      sma: Math.random() * 10,
      ema: Math.random() * 10,
      rsi: Math.random() * 100,
      macd: Math.random() * 2 - 1
    }));
  };

  const calculateRiskMetrics = (trades) => {
    return {
      var95: -2.5,
      var99: -3.8,
      expectedShortfall: -4.2,
      kellyFraction: 0.34,
      calmarRatio: 1.2,
      informationRatio: 0.85
    };
  };

  const runBacktest = () => {
    setRunning(true);
    setError(null);
    
    try {
      const strategyConfig = JSON.parse(strategy);
      
      // Simulate full backtest process
      setTimeout(() => {
        const processedData = calculateIndicators(generateSampleData(), strategyConfig.indicators);
        const validation = validateData(processedData);
        setDataValidation(validation);
        
        if (validation.status === 'valid') {
          const results = generateDetailedResults();
          setResults(results);
        } else {
          setError('Data validation failed: ' + validation.issues.join(', '));
        }
        
        setRunning(false);
      }, 2000);
    } catch (e) {
      setError('Strategy configuration error: ' + e.message);
      setRunning(false);
    }
  };

  const generateSampleData = () => {
    return Array.from({length: 250}, (_, i) => ({
      date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
      open: 100 + Math.random() * 10,
      high: 105 + Math.random() * 10,
      low: 95 + Math.random() * 10,
      close: 100 + Math.random() * 10,
      volume: 1000000 + Math.random() * 500000
    }));
  };

  const generateDetailedResults = () => {
    const equity = Array.from({length: 250}, (_, i) => ({
      date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
      value: 10000 * (1 + Math.sin(i/20) * 0.1 + i/200),
      drawdown: -(Math.random() * 5),
      underwater: Math.random() * 10
    }));

    return {
      equity,
      metrics: {
        sharpeRatio: 1.8,
        maxDrawdown: -15.2,
        winRate: 58.5,
        profitFactor: 1.65,
        ...calculateRiskMetrics([])
      },
      trades: Array.from({length: 50}, (_, i) => ({
        date: equity[i * 5].date,
        type: Math.random() > 0.5 ? 'LONG' : 'SHORT',
        entry: 100 + Math.random() * 10,
        exit: 100 + Math.random() * 10,
        pnl: (Math.random() * 2 - 1) * 1000,
        holdingPeriod: Math.floor(Math.random() * 20),
        exitReason: ['stopLoss', 'takeProfit', 'signal'][Math.floor(Math.random() * 3)]
      }))
    };
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="risk">Risk Metrics</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
        </TabsList>

        <TabsContent value="strategy" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Strategy Configuration
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <Upload className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full h-96 p-2 font-mono text-sm border rounded"
                  value={strategy || defaultStrategy}
                  onChange={(e) => setStrategy(e.target.value)}
                />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Data Validation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dataValidation.issues.map((issue, i) => (
                      <Alert key={i} variant={dataValidation.status === 'valid' ? 'default' : 'destructive'}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{issue}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Backtest Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      {['1H', '4H', '1D', '1W'].map(tf => (
                        <button
                          key={tf}
                          className={`px-3 py-1 rounded ${
                            selectedTimeframe === tf ? 'bg-blue-500 text-white' : 'bg-gray-100'
                          }`}
                          onClick={() => setSelectedTimeframe(tf)}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                    <button
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded flex items-center justify-center gap-2 hover:bg-blue-600"
                      onClick={runBacktest}
                      disabled={running}
                    >
                      {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      {running ? 'Running Backtest...' : 'Run Backtest'}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          {results && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Equity Curve & Drawdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ComposedChart data={results.equity} width={800} height={350}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="equity" />
                      <YAxis yAxisId="drawdown" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="equity" type="monotone" dataKey="value" stroke="#2563eb" name="Equity" />
                      <Bar yAxisId="drawdown" dataKey="drawdown" fill="#ef4444" name="Drawdown" />
                    </ComposedChart>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-4 gap-4">
                {Object.entries(results.metrics).map(([key, value]) => (
                  <Card key={key}>
                    <CardContent className="pt-6">
                      <div className="text-sm text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className="text-2xl font-semibold">
                        {typeof value === 'number' ? value.toFixed(2) : value}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="risk">
          {results && (
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Value at Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">VaR (95%)</div>
                        <div className="text-2xl font-semibold">{results.metrics.var95}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">VaR (99%)</div>
                        <div className="text-2xl font-semibold">{results.metrics.var99}%</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Expected Shortfall</div>
                      <div className="text-2xl font-semibold">{results.metrics.expectedShortfall}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Position Sizing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600">Kelly Fraction</div>
                      <div className="text-2xl font-semibold">{results.metrics.kellyFraction}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Optimal Position Size</div>
                      <div className="text-2xl font-semibold">
                        {(results.metrics.kellyFraction * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Underwater Plot</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <LineChart data={results.equity} width={800} height={250}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="underwater" stroke="#ef4444" />
                    </LineChart>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trades">
          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Trade History
                  <button className="px-4 py-2 border rounded flex items-center gap-2 hover:bg-gray-50">
                    <Download className="w-4 h-4" />
                    Export Trades
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="textimport React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AlertCircle, ArrowRight, Play, Download, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BacktestWorkbench = () => {
  const [data, setData] = useState([]);
  const [strategy, setStrategy] = useState('');
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  
  // Sample strategy definition
  const defaultStrategy = `{
    "name": "Moving Average Crossover",
    "parameters": {
      "shortPeriod": 10,
      "longPeriod": 50,
      "stopLoss": 2,
      "takeProfit": 4
    },
    "indicators": [
      {"type": "SMA", "period": 10, "weight": 0.6},
      {"type": "RSI", "period": 14, "weight": 0.4}
    ]
  }`;

  // Sample backtest function
  const runBacktest = () => {
    setRunning(true);
    setError(null);
    
    try {
      const strategyConfig = JSON.parse(strategy);
      // Simulate backtest calculations
      setTimeout(() => {
        const sampleResults = generateSampleResults();
        setResults(sampleResults);
        setRunning(false);
      }, 1500);
    } catch (e) {
      setError('Invalid strategy configuration');
      setRunning(false);
    }
  };

  // Generate sample backtest results
  const generateSampleResults = () => {
    const dates = Array.from({length: 100}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (100 - i));
      return date.toISOString().split('T')[0];
    });

    return {
      equity: dates.map((date, i) => ({
        date,
        value: 10000 * (1 + Math.sin(i/10) * 0.1 + i/100)
      })),
      metrics: {
        sharpeRatio: 1.8,
        maxDrawdown: -15.2,
        winRate: 58.5,
        profitFactor: 1.65
      },
      trades: [
        { date: dates[20], type: 'LONG', entry: 100, exit: 105, pnl: 500 },
        { date: dates[40], type: 'SHORT', entry: 110, exit: 105, pnl: 500 },
        { date: dates[60], type: 'LONG', entry: 102, exit: 108, pnl: 600 }
      ]
    };
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Strategy Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Strategy Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full h-64 p-2 font-mono text-sm border rounded"
              value={strategy || defaultStrategy}
              onChange={(e) => setStrategy(e.target.value)}
            />
            <div className="mt-4 flex justify-between">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2 hover:bg-blue-600"
                onClick={runBacktest}
                disabled={running}
              >
                <Play className="w-4 h-4" />
                {running ? 'Running...' : 'Run Backtest'}
              </button>
              <button
                className="px-4 py-2 border rounded flex items-center gap-2 hover:bg-gray-50"
                onClick={() => {/* Implement strategy export */}}
              >
                <Download className="w-4 h-4" />
                Export Strategy
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Sharpe Ratio</div>
                  <div className="text-2xl font-semibold">{results.metrics.sharpeRatio}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Max Drawdown</div>
                  <div className="text-2xl font-semibold text-red-500">
                    {results.metrics.maxDrawdown}%
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Win Rate</div>
                  <div className="text-2xl font-semibold">{results.metrics.winRate}%</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Profit Factor</div>
                  <div className="text-2xl font-semibold">{results.metrics.profitFactor}</div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Run backtest to see metrics
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Equity Curve */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Equity Curve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <LineChart data={results.equity} width={800} height={250}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#2563eb" />
              </LineChart>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trade List */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Trade History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-right p-2">Entry</th>
                    <th className="text-right p-2">Exit</th>
                    <th className="text-right p-2">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {results.trades.map((trade, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{trade.date}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          trade.type === 'LONG' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="text-right p-2">{trade.entry}</td>
                      <td className="text-right p-2">{trade.exit}</td>
                      <td className={`text-right p-2 ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${trade.pnl}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default BacktestWorkbench;