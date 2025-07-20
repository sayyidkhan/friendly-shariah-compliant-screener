import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';

const StockResultsTab = ({ stocks, onAnalyseStock }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  const filteredStocks = useMemo(() => {
    let result = stocks;
    if (searchTerm) {
      result = result.filter(stock =>
        stock.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.ticker.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filter !== 'All') {
      if (filter === 'Compliant') {
        result = result.filter(stock => stock.compliance === true);
      } else if (filter === 'Non-Compliant') {
        result = result.filter(stock => stock.compliance === false);
      }
    }
    return result;
  }, [searchTerm, filter, stocks]);

  const totalStocks = stocks.length;
  const compliantCount = stocks.filter(s => s.compliance === true).length;
  const nonCompliantCount = stocks.filter(s => s.compliance === false).length;

  const handleAnalyseStock = (stock) => {
    onAnalyseStock(stock);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 my-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground font-medium">Total Stocks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">{totalStocks}</p>
            <p className="text-muted-foreground text-sm mt-1">Stocks analyzed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground font-medium">Shariah-Compliant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-green-600">{compliantCount}</p>
            <p className="text-muted-foreground text-sm mt-1">Halal investments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground font-medium">Non-Compliant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-red-600">{nonCompliantCount}</p>
            <p className="text-muted-foreground text-sm mt-1">Non-halal investments</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Search & Filter</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Find stocks by ticker symbol or company name
              </p>
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
                <Input
                  type="text"
                  placeholder="Search by ticker or company name..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant={filter === 'All' ? 'default' : 'outline'}
                onClick={() => setFilter('All')}
                className="w-full md:w-auto"
              >
                All
              </Button>
              <Button
                variant={filter === 'Compliant' ? 'default' : 'outline'}
                onClick={() => setFilter('Compliant')}
                className="w-full md:w-auto"
              >
                Compliant
              </Button>
              <Button
                variant={filter === 'Non-Compliant' ? 'default' : 'outline'}
                onClick={() => setFilter('Non-Compliant')}
                className="w-full md:w-auto"
              >
                Non-Compliant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stock Results</CardTitle>
              <p className="text-sm text-muted-foreground">
                Showing {filteredStocks.length} of {totalStocks} stocks
              </p>
            </div>
            <a href="/shariah_stock_list.csv" download="shariah_compliant_stocks.csv">
              <Button>Download CSV</Button>
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker Symbol</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Shariah Compliance</TableHead>
                <TableHead>Analysis</TableHead>
                <TableHead>Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocks.map(stock => (
                <TableRow key={stock.ticker}>
                  <TableCell className="font-medium">{stock.ticker}</TableCell>
                  <TableCell>{stock.company_name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        stock.compliance === true
                          ? 'success'
                          : 'destructive'
                      }
                    >
                      {stock.compliance ? 'Shariah-compliant' : 'Not Shariah-compliant'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleAnalyseStock(stock)}>Analyze</Button>
                  </TableCell>
                  <TableCell>
                    <a href={stock.link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">
                      View Details
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default StockResultsTab; 