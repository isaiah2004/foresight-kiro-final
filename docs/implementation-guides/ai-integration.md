# AI Integration Guide

## Purpose
This guide provides instructions for integrating AI features into the Foresight financial planning application using the Vercel AI SDK.

## Overview

The AI integration in Foresight is designed for Phase 2 of the application and will provide:
- Intelligent financial insights and recommendations
- Natural language interaction with financial data
- Automated goal creation and modification
- Custom graph generation and analysis

## Vercel AI SDK Setup

### Installation
```bash
npm install ai @ai-sdk/openai @ai-sdk/anthropic
npm install -D @types/node
```

### Environment Configuration
Add to `.env.local`:
```bash
# AI Configuration
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL_PROVIDER=openai # or anthropic
AI_MODEL_NAME=gpt-4-turbo # or claude-3-sonnet
```

### Basic AI Route Setup
```typescript
// app/api/ai/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: {
      getPortfolio: {
        description: 'Get user investment portfolio data',
        parameters: {
          type: 'object',
          properties: {
            userId: { type: 'string' }
          }
        },
        execute: async ({ userId }) => {
          // Fetch portfolio data
          return await getInvestmentPortfolio(userId);
        }
      }
    }
  });

  return result.toAIStreamResponse();
}
```

## AI Tools and Functions

### Financial Data Access Tools

#### Portfolio Management
```typescript
// lib/ai/tools/portfolio-tools.ts
export const portfolioTools = {
  getInvestmentPortfolio: {
    description: 'Fetch complete investment portfolio with current values',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        includePerformance: { type: 'boolean', default: true }
      }
    },
    execute: async ({ userId, includePerformance }) => {
      const portfolio = await db.investment.findMany({
        where: { userId },
        include: { 
          priceHistory: includePerformance 
        }
      });
      
      return {
        investments: portfolio,
        totalValue: calculatePortfolioValue(portfolio),
        performance: includePerformance ? calculatePerformance(portfolio) : null
      };
    }
  },

  getBuckets: {
    description: 'Get budget buckets and allocation information',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        category: { 
          type: 'string', 
          enum: ['essentials', 'lifestyle', 'savings', 'sinking-fund', 'all'],
          default: 'all'
        }
      }
    },
    execute: async ({ userId, category }) => {
      const buckets = await getBudgetBuckets(userId, category);
      return {
        buckets,
        totalAllocated: buckets.reduce((sum, b) => sum + b.amount, 0),
        utilizationRate: calculateUtilization(buckets)
      };
    }
  }
};
```

#### Performance Analytics
```typescript
// lib/ai/tools/analytics-tools.ts
export const analyticsTools = {
  getPerformanceOverTime: {
    description: 'Get investment performance data over specified time period',
    parameters: {
      type: 'object',
      properties: {
        symbols: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Array of investment symbols to analyze'
        },
        timeframe: {
          type: 'string',
          enum: ['1M', '3M', '6M', '1Y', '2Y', '5Y'],
          default: '1Y'
        }
      }
    },
    execute: async ({ symbols, timeframe }) => {
      const performanceData = await getHistoricalPerformance(symbols, timeframe);
      return {
        symbols,
        timeframe,
        data: performanceData,
        summary: calculatePerformanceSummary(performanceData)
      };
    }
  },

  getIncomeDistribution: {
    description: 'Analyze income sources and distribution patterns',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        period: { type: 'string', enum: ['monthly', 'quarterly', 'yearly'] }
      }
    },
    execute: async ({ userId, period }) => {
      const incomeData = await getIncomeAnalysis(userId, period);
      return {
        sources: incomeData.sources,
        distribution: incomeData.distribution,
        trends: incomeData.trends,
        recommendations: generateIncomeRecommendations(incomeData)
      };
    }
  }
};
```

### Data Modification Tools

#### Goal Management
```typescript
// lib/ai/tools/goal-tools.ts
export const goalTools = {
  createSavingGoal: {
    description: 'Create a new saving goal or pot',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        name: { type: 'string' },
        targetAmount: { type: 'number' },
        deadline: { type: 'string', format: 'date' },
        category: { 
          type: 'string',
          enum: ['pot', 'saving-fund', 'other']
        },
        linkedBudgetCategory: {
          type: 'string',
          enum: ['essentials', 'lifestyle', 'savings', 'sinking-fund']
        }
      },
      required: ['userId', 'name', 'targetAmount', 'category']
    },
    execute: async (params) => {
      const goal = await createGoal(params);
      return {
        success: true,
        goal,
        message: `Created ${params.category} "${params.name}" with target of ${formatCurrency(params.targetAmount)}`
      };
    }
  },

  modifySavingGoal: {
    description: 'Modify existing saving goal parameters',
    parameters: {
      type: 'object',
      properties: {
        goalId: { type: 'string' },
        updates: {
          type: 'object',
          properties: {
            targetAmount: { type: 'number' },
            deadline: { type: 'string', format: 'date' },
            name: { type: 'string' }
          }
        }
      },
      required: ['goalId', 'updates']
    },
    execute: async ({ goalId, updates }) => {
      const updatedGoal = await updateGoal(goalId, updates);
      return {
        success: true,
        goal: updatedGoal,
        message: `Updated goal successfully`
      };
    }
  },

  createBucket: {
    description: 'Create a new budget bucket',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        name: { type: 'string' },
        amount: { type: 'number' },
        category: { 
          type: 'string',
          enum: ['essentials', 'lifestyle', 'savings', 'sinking-fund']
        },
        renewalRate: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
        }
      },
      required: ['userId', 'name', 'amount', 'category']
    },
    execute: async (params) => {
      const bucket = await createBudgetBucket(params);
      return {
        success: true,
        bucket,
        message: `Created ${params.category} bucket "${params.name}" with ${formatCurrency(params.amount)}`
      };
    }
  }
};
```

### Graph Generation Tools

#### Custom Chart Generation
```typescript
// lib/ai/tools/chart-tools.ts
export const chartTools = {
  generateDebtToIncomeChart: {
    description: 'Generate debt-to-income ratio chart over time',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        timeframe: { type: 'string', enum: ['6M', '1Y', '2Y', '5Y'] }
      }
    },
    execute: async ({ userId, timeframe }) => {
      const data = await calculateDebtToIncomeHistory(userId, timeframe);
      return {
        chartType: 'line',
        title: 'Debt-to-Income Ratio Over Time',
        data: data.map(point => ({
          date: point.date,
          ratio: point.debtToIncomeRatio,
          debt: point.totalDebt,
          income: point.monthlyIncome
        })),
        config: {
          xAxis: 'date',
          yAxis: 'ratio',
          format: 'percentage'
        }
      };
    }
  },

  generateIncomeExpenseSavingsChart: {
    description: 'Create income vs expenses vs savings trend chart',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        period: { type: 'string', enum: ['monthly', 'quarterly'] },
        timeframe: { type: 'string', enum: ['1Y', '2Y', '3Y'] }
      }
    },
    execute: async ({ userId, period, timeframe }) => {
      const data = await getIncomeExpenseSavingsTrend(userId, period, timeframe);
      return {
        chartType: 'multi-line',
        title: 'Income, Expenses & Savings Trend',
        data: data,
        config: {
          lines: ['income', 'expenses', 'savings'],
          colors: ['#10b981', '#ef4444', '#3b82f6']
        }
      };
    }
  },

  generateCustomChart: {
    description: 'Generate custom financial chart based on complex requirements',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        chartRequest: { 
          type: 'string',
          description: 'Natural language description of the desired chart'
        },
        dataPoints: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific data points to include'
        }
      }
    },
    execute: async ({ userId, chartRequest, dataPoints }) => {
      // AI-powered chart generation based on natural language
      const chartConfig = await generateChartFromRequest(userId, chartRequest, dataPoints);
      return chartConfig;
    }
  }
};
```

## Client-Side Integration

### Chat Interface Component
```typescript
// components/shared/ai/fin-bot-chat.tsx
'use client';

import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export function FinBotChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I\'m your financial assistant. I can help you analyze your portfolio, create goals, and generate insights. What would you like to know?'
      }
    ]
  });

  return (
    <Card className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about your finances..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </div>
      </form>
    </Card>
  );
}
```

### Chart Generation Component
```typescript
// components/shared/ai/ai-chart-generator.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { generateChart } from '@/lib/ai/chart-generator';

export function AIChartGenerator() {
  const [request, setRequest] = useState('');
  const [chartData, setChartData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const chart = await generateChart(request);
      setChartData(chart);
    } catch (error) {
      console.error('Chart generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">AI Chart Generator</h3>
      
      <div className="space-y-4">
        <Textarea
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          placeholder="Describe the chart you want to generate (e.g., 'Show my investment performance over the last year compared to market indices')"
          rows={3}
        />
        
        <Button 
          onClick={handleGenerate} 
          disabled={!request.trim() || isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Chart'}
        </Button>
        
        {chartData && (
          <div className="mt-6">
            {/* Render generated chart */}
            <DynamicChart data={chartData} />
          </div>
        )}
      </div>
    </Card>
  );
}
```

## Security Considerations

### API Key Management
- Store API keys securely in environment variables
- Use different keys for development and production
- Implement rate limiting to prevent abuse
- Monitor API usage and costs

### Data Privacy
- Ensure user financial data is handled securely
- Implement proper authentication checks
- Sanitize all AI inputs and outputs
- Log AI interactions for audit purposes

### Error Handling
```typescript
// lib/ai/error-handling.ts
export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export const handleAIError = (error: unknown): AIError => {
  if (error instanceof AIError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AIError(
      `AI operation failed: ${error.message}`,
      'AI_OPERATION_FAILED',
      true
    );
  }
  
  return new AIError(
    'Unknown AI error occurred',
    'AI_UNKNOWN_ERROR',
    false
  );
};
```

## Testing AI Features

### Unit Tests
```typescript
// __tests__/ai/tools.test.ts
import { portfolioTools } from '@/lib/ai/tools/portfolio-tools';

describe('Portfolio AI Tools', () => {
  test('getInvestmentPortfolio returns correct data structure', async () => {
    const result = await portfolioTools.getInvestmentPortfolio.execute({
      userId: 'test-user',
      includePerformance: true
    });
    
    expect(result).toHaveProperty('investments');
    expect(result).toHaveProperty('totalValue');
    expect(result).toHaveProperty('performance');
  });
});
```

### Integration Tests
```typescript
// __tests__/ai/chat.test.ts
import { POST } from '@/app/api/ai/chat/route';

describe('AI Chat API', () => {
  test('handles portfolio query correctly', async () => {
    const request = new Request('http://localhost/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Show me my investment portfolio' }
        ]
      })
    });
    
    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
```

This comprehensive AI integration guide provides the foundation for implementing intelligent financial features in the Foresight application using the Vercel AI SDK.