import { useState, useEffect, useRef } from 'react';
import CommunityEducationTab from './components/CommunityEducationTab';
import BackToTopButton from './components/features/BackToTopButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import StockResultsTab from './components/StockResultsTab';
import AnalyseStockTab from './components/AnalyseStockTab';
import './App.css';

function App() {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [activeTab, setActiveTab] = useState('education');
  const analysisCache = useRef(new Map()); // Persistent cache at App level

  useEffect(() => {
    fetch('shariah_stock_data.json')
      .then(response => response.json())
      .then(data => setStocks(data))
      .catch(error => console.error('Error fetching stock data:', error));
  }, []);

  const handleAnalyseStock = (stock) => {
    setSelectedStock(stock);
    setActiveTab('analyse');
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold">Shariah-Compliant Stock Screener</h1>
        <p className="text-muted-foreground mt-2">
          Discover halal investment opportunities with our comprehensive stock database
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="education">Community & Education</TabsTrigger>
          <TabsTrigger value="stocks">Stock Results</TabsTrigger>
          <TabsTrigger value="analyse">Analyse Stock</TabsTrigger>
        </TabsList>
        <TabsContent value="education">
          <CommunityEducationTab />
        </TabsContent>
        <TabsContent value="stocks">
          <StockResultsTab stocks={stocks} onAnalyseStock={handleAnalyseStock} />
        </TabsContent>
        <TabsContent value="analyse">
          <AnalyseStockTab stock={selectedStock} analysisCache={analysisCache} />
        </TabsContent>
      </Tabs>

      <BackToTopButton />
      <footer className="text-center mt-10 text-xs text-muted-foreground">
        <p>This tool is for informational purposes only.</p>
        <p>Always consult with a qualified Islamic finance advisor before making investment decisions.</p>
      </footer>
    </div>
  );
}

export default App;

