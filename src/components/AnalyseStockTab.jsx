import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';

const genAI = new GoogleGenerativeAI(process.env.VITE_GOOGLE_GEMINI_API_KEY);

const AnalyseStockTab = ({ stock, analysisCache }) => {
  const [analysisData, setAnalysisData] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const analysisTabs = [
    { id: 'overview', emoji: "📋", title: "Overview", description: "Quick summary and compliance status" },
    { id: 'company', emoji: "🏢", title: "Company Info", description: "Business model and operations" },
    { id: 'business', emoji: "📊", title: "Business Analysis", description: "Shariah compliance evaluation" },
    { id: 'financial', emoji: "💰", title: "Financial Ratios", description: "Key financial metrics" },
    { id: 'investment', emoji: "🎯", title: "Investment Guide", description: "Recommendations and risks" },
    { id: 'summary', emoji: "✨", title: "Final Report", description: "Complete analysis summary" }
  ];

  const loadingSteps = [
    { emoji: "🔍", title: "Searching Company Data", message: "Did you know? Islamic finance is worth over $3.7 trillion globally!" },
    { emoji: "🏢", title: "Analyzing Business Model", message: "Fun fact: The first Islamic bank was established in Egypt in 1963." },
    { emoji: "💰", title: "Processing Financial Ratios", message: "Shariah compliance requires debt-to-assets ratio below 33%." },
    { emoji: "📊", title: "Evaluating Shariah Compliance", message: "Islamic finance prohibits Riba (interest), Gharar (uncertainty), and Haram activities." },
    { emoji: "🎯", title: "Generating Investment Analysis", message: "Malaysia leads the global Islamic finance market with 23.6% share." },
    { emoji: "✨", title: "Finalizing Report", message: "Shariah-compliant stocks often show lower volatility during market downturns." }
  ];

  const generateAnalysis = async (forceRegenerate = false) => {
    if (!stock) return;
    
    const cacheKey = stock.ticker;
    
    // Check cache first (unless force regenerate)
    if (!forceRegenerate && analysisCache.current.has(cacheKey)) {
      setAnalysisData(analysisCache.current.get(cacheKey));
      return;
    }
    
    setLoading(true);
    setLoadingStep(0);
    setAnalysisData({}); // Clear previous analysis
    
    try {
      // Check if API key is available
      if (!process.env.VITE_GOOGLE_GEMINI_API_KEY) {
        throw new Error('Google Gemini API key is not configured');
      }
      
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      // Step 1: Initial setup
      setLoadingStep(1);
      setLoadingMessage(loadingSteps[0].message);
      
      // Step 1: Run independent analyses in parallel
      const companyInfoPrompt = `Search for and provide current information about ${stock.company_name} (${stock.ticker}). Include:

1. **Company Overview**: What does the company do? What are their main products/services?
2. **Business Model**: How do they make money? What are their revenue streams?
3. **Recent News**: Any recent developments, partnerships, or business changes?
4. **Industry Classification**: What sector/industry are they in?
5. **Geographic Operations**: Where do they operate? Any international presence?

Please provide factual, up-to-date information in markdown format.`;

      const financialAnalysisPrompt = `Analyze the financial ratios for ${stock.company_name} (${stock.ticker}) based on this data:
${JSON.stringify(stock, null, 2)}

Current compliance status: **${stock.compliance ? 'SHARIAH COMPLIANT' : 'NON-COMPLIANT'}**

Analyze these key Shariah screening ratios:

1. **Debt-to-Assets Ratio** (should be < 33%):
   - Calculate and explain the ratio
   - Assess compliance with threshold
   
2. **Interest Income to Total Revenue** (should be < 5%):
   - Analyze interest-bearing income sources
   - Assess compliance level
   
3. **Cash and Interest-Bearing Securities**:
   - Review liquid assets composition
   - Assess Shariah compliance
   
4. **Overall Financial Health**:
   - Debt structure analysis
   - Financial stability assessment

Explain why the stock is classified as ${stock.compliance ? 'COMPLIANT' : 'NON-COMPLIANT'} based on these metrics.`;

      const investmentAnalysisPrompt = `Provide investment analysis for ${stock.company_name} (${stock.ticker}):

**Current Status**: ${stock.compliance ? 'SHARIAH COMPLIANT' : 'NON-COMPLIANT'}

1. **Investment Recommendation**:
   - Should Shariah-conscious investors consider this stock?
   - Risk factors specific to Shariah compliance
   - Opportunities and potential concerns
   
2. **Monitoring Requirements**:
   - What should investors watch for?
   - Key metrics to track
   - Red flags to monitor
   
3. **Purification Requirements** (if applicable):
   - Any income that needs to be purified?
   - How to handle non-compliant income
   
4. **Future Outlook**:
   - Trends that might affect compliance
   - Business direction assessment`;

      // Step 1: Company information
      setLoadingStep(2);
      setLoadingMessage(loadingSteps[1].message);
      
      const companyInfoResult = await model.generateContent(companyInfoPrompt);
      const companyInfo = await companyInfoResult.response.text();
      
      // Step 2: Business analysis (depends on company info)
      setLoadingStep(3);
      setLoadingMessage(loadingSteps[2].message);
      
      const businessAnalysisPrompt = `Based on this company information:
${companyInfo}

And this stock data: ${JSON.stringify(stock, null, 2)}

Analyze the business activities of ${stock.company_name} (${stock.ticker}) for Shariah compliance:

1. **Core Business Activities**: Break down their main business operations
2. **Prohibited Activities Check**: Check for involvement in:
   - Alcohol production/distribution
   - Gambling/gaming
   - Pork/non-halal food
   - Tobacco
   - Conventional banking/insurance
   - Adult entertainment
   - Weapons manufacturing
3. **Business Model Assessment**: Is their revenue model Shariah-compliant?
4. **Supply Chain Considerations**: Any concerns in their business relationships?

Format in markdown with clear headers.`;

      const businessAnalysisResult = await model.generateContent(businessAnalysisPrompt);
      const businessAnalysis = await businessAnalysisResult.response.text();
      
      // Step 3: Financial analysis
      setLoadingStep(4);
      setLoadingMessage(loadingSteps[3].message);
      
      const financialAnalysisResult = await model.generateContent(financialAnalysisPrompt);
      const financialAnalysis = await financialAnalysisResult.response.text();
      
      // Step 4: Investment analysis
      setLoadingStep(5);
      setLoadingMessage(loadingSteps[4].message);
      
      const investmentAnalysisResult = await model.generateContent(investmentAnalysisPrompt);
      const investmentAnalysis = await investmentAnalysisResult.response.text();
      
      // Step 5: Final cleanup and flow optimization
      setLoadingStep(6);
      setLoadingMessage(loadingSteps[5].message);
      
      const cleanupPrompt = `You are provided with multiple analysis sections for ${stock.company_name} (${stock.ticker}). Please create a comprehensive, well-flowing Shariah compliance analysis by combining and optimizing these sections:

**Company Information:**
${companyInfo}

**Business Activities Analysis:**
${businessAnalysis}

**Financial Analysis:**
${financialAnalysis}

**Investment Analysis:**
${investmentAnalysis}

**Stock Status:** ${stock.compliance ? 'SHARIAH COMPLIANT' : 'NON-COMPLIANT'}

Create a polished, professional analysis with:
1. Smooth information flow between sections
2. Remove any redundancy or repetition
3. Ensure consistency in tone and conclusions
4. Add connecting sentences between sections
5. Organize into clear, logical sections with proper markdown formatting
6. Include emojis for section headers for visual appeal
7. Ensure all analysis supports the compliance status: ${stock.compliance ? 'COMPLIANT' : 'NON-COMPLIANT'}

Format as a complete, professional Shariah compliance report with proper headers, bullet points, and formatting.`;

      const cleanupResult = await model.generateContent(cleanupPrompt);
      const finalAnalysis = await cleanupResult.response.text();
      
      // Create overview section
      const overviewData = `# 📋 Quick Overview
## ${stock.company_name} (${stock.ticker})

### Current Status: ${stock.compliance ? '✅ SHARIAH COMPLIANT' : '❌ NON-COMPLIANT'}

### Key Highlights
- **Compliance Status**: ${stock.compliance ? 'Shariah Compliant' : 'Non-Compliant'}
- **Analysis Date**: ${new Date().toLocaleDateString()}
- **Industry**: Based on company research
- **Risk Level**: To be determined from financial analysis

### Quick Actions
- Navigate through tabs to explore detailed analysis
- Review financial ratios for compliance metrics
- Check investment recommendations for next steps`;

      // Store all analysis data by sections
      const analysisResults = {
        overview: overviewData,
        company: `# 🏢 Company Information\n\n${companyInfo}`,
        business: `# 📊 Business Activities Analysis\n\n${businessAnalysis}`,
        financial: `# 💰 Financial Ratios Analysis\n\n${financialAnalysis}`,
        investment: `# 🎯 Investment Analysis\n\n${investmentAnalysis}`,
        summary: `# ✨ Complete Analysis Report\n\n${finalAnalysis}\n\n---\n\n## ⚠️ Important Disclaimer\nThis analysis is based on available data and general Shariah screening principles. For definitive rulings, please consult with qualified Shariah scholars. Investment decisions should be made after thorough due diligence and consideration of your personal financial situation.\n\n*Analysis generated on ${new Date().toLocaleDateString()} using AI-powered research and Shariah compliance screening.*`
      };
      
      // Cache the result
      analysisCache.current.set(cacheKey, analysisResults);
      setAnalysisData(analysisResults);
      setActiveTab('overview'); // Start with overview
      
    } catch (error) {
      console.error('Error fetching analysis:', error);
      const errorMessage = error.message.includes('API key') 
        ? 'API key is not configured properly. Please check your environment variables.'
        : error.message.includes('quota') || error.message.includes('limit')
        ? 'API quota exceeded. Please try again later.'
        : `Failed to fetch analysis: ${error.message}. Please try again.`;
      
      setAnalysisData({
        overview: `# ❌ Analysis Error\n\n${errorMessage}`
      });
      setActiveTab('overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateAnalysis();
  }, [stock]);

  if (!stock) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Stock Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please select a stock to analyze from the "Stock Results" tab.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex-1">
            Shariah Compliance Analysis for {stock.company_name} ({stock.ticker})
          </CardTitle>
          {Object.keys(analysisData).length > 0 && !loading && (
            <Button 
              onClick={() => generateAnalysis(true)} 
              disabled={loading}
              variant="outline"
              size="sm"
              className="ml-4 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8">
            {/* Main progress section */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4 animate-bounce">
                {loadingSteps[loadingStep - 1]?.emoji || "🔍"}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {loadingSteps[loadingStep - 1]?.title || "Initializing..."}
              </h3>
              <div className="inline-flex items-center gap-2 text-gray-600 mb-4">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing {stock.company_name}...
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Analysis Progress</span>
                <span className="text-sm text-gray-500">{Math.round((loadingStep / 6) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(loadingStep / 6) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Step indicators */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {loadingSteps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300 ${
                    index < loadingStep 
                      ? 'bg-green-50 border border-green-200' 
                      : index === loadingStep - 1
                      ? 'bg-blue-50 border border-blue-200 animate-pulse'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`text-lg transition-all duration-300 ${
                    index < loadingStep ? 'grayscale-0' : index === loadingStep - 1 ? 'grayscale-0' : 'grayscale'
                  }`}>
                    {step.emoji}
                  </div>
                  <span className={`text-xs font-medium ${
                    index < loadingStep ? 'text-green-700' : index === loadingStep - 1 ? 'text-blue-700' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < loadingStep && (
                    <div className="ml-auto text-green-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Fun fact */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">💡</div>
              <p className="text-sm text-gray-700 font-medium">
                {loadingMessage}
              </p>
            </div>
          </div>
        ) : Object.keys(analysisData).length > 0 ? (
          <div className="max-w-none">
            {/* Tab Navigation - Grid Layout */}
            <div className="mb-6">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {analysisTabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    disabled={!analysisData[tab.id]}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-lg transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 border-2 border-blue-500 shadow-md'
                        : analysisData[tab.id]
                        ? 'bg-green-50 border-2 border-green-200 hover:border-green-300 hover:shadow-sm'
                        : 'bg-gray-50 border-2 border-gray-200 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {/* Emoji */}
                    <div className={`text-2xl transition-all duration-300 ${
                      activeTab === tab.id ? 'scale-110' : analysisData[tab.id] ? 'grayscale-0' : 'grayscale'
                    }`}>
                      {tab.emoji}
                    </div>
                    
                    {/* Title */}
                    <div className={`text-sm font-medium text-center ${
                      activeTab === tab.id ? 'text-blue-700' : analysisData[tab.id] ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {tab.title}
                    </div>
                    
                    {/* Description */}
                    <div className={`text-xs text-center leading-tight ${
                      activeTab === tab.id ? 'text-blue-600' : analysisData[tab.id] ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {tab.description}
                    </div>
                    
                    {/* Status Indicator */}
                    {analysisData[tab.id] && (
                      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                        activeTab === tab.id ? 'bg-blue-500' : 'bg-green-400'
                      }`}></div>
                    )}
                    
                    {/* Active Indicator */}
                    {activeTab === tab.id && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {(() => {
                try {
                  const currentContent = analysisData[activeTab];
                  if (!currentContent) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-4">⏳</div>
                        <p>This section is being analyzed...</p>
                      </div>
                    );
                  }

                  return (
                    <ReactMarkdown
                      components={{
                        h1: ({children}) => (
                          <h1 className="text-2xl font-bold mt-8 mb-4 text-gray-900 border-b-2 border-blue-500 pb-2">
                            {children}
                          </h1>
                        ),
                        h2: ({children}) => (
                          <h2 className="text-xl font-bold mt-6 mb-3 text-blue-800 border-b border-gray-300 pb-2">
                            {children}
                          </h2>
                        ),
                        h3: ({children}) => (
                          <h3 className="text-lg font-semibold mt-4 mb-2 text-blue-700">
                            {children}
                          </h3>
                        ),
                        ul: ({children}) => (
                          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                            {children}
                          </ul>
                        ),
                        ol: ({children}) => (
                          <ol className="list-decimal list-inside space-y-2 ml-4 mb-4">
                            {children}
                          </ol>
                        ),
                        li: ({children}) => (
                          <li className="text-gray-700 leading-relaxed">
                            {children}
                          </li>
                        ),
                        p: ({children}) => (
                          <p className="mb-4 text-gray-800 leading-relaxed">
                            {children}
                          </p>
                        ),
                        strong: ({children}) => (
                          <strong className="font-bold text-gray-900">
                            {children}
                          </strong>
                        ),
                        em: ({children}) => (
                          <em className="italic text-gray-700">
                            {children}
                          </em>
                        ),
                        blockquote: ({children}) => (
                          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4">
                            {children}
                          </blockquote>
                        ),
                        code: ({children}) => (
                          <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
                            {children}
                          </code>
                        ),
                        pre: ({children}) => (
                          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                            {children}
                          </pre>
                        ),
                      }}
                    >
                      {currentContent}
                    </ReactMarkdown>
                  );
                } catch (error) {
                  console.error('ReactMarkdown rendering error:', error);
                  return (
                    <div className="p-4 bg-red-50 border border-red-200 rounded">
                      <h3 className="text-red-800 font-semibold mb-2">Error rendering analysis</h3>
                      <p className="text-red-700 text-sm mb-2">There was an issue displaying this section.</p>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No analysis available.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyseStockTab;
