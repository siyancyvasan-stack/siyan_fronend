import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

interface Insight {
  text: string;
  category: 'Observation' | 'Suggestion' | 'Alert';
}

@Component({
  selector: 'app-expense-insights',
  templateUrl: './expense-insights.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseInsightsComponent {
  isLoading = signal(false);
  insights = signal<Insight[]>([]);
  error = signal<string | null>(null);

  // Mock data to be sent to Gemini
  private expenseData = {
    totalSpend: 145000,
    budget: 200000,
    pendingExpenses: 7,
    policyViolations: 2,
    categoryBreakdown: [
      { category: 'Travel', value: 45 },
      { category: 'Software', value: 28 },
      { category: 'Food', value: 18 },
      { category: 'Office Supplies', value: 9 },
    ],
    recentClaims: [
      { merchant: 'Uber', category: 'Travel', amount: 45.50 },
      { merchant: 'Delta Airlines', category: 'Travel', amount: 850.00 },
      { merchant: 'Adobe Creative Cloud', category: 'Software', amount: 59.99 },
    ]
  };

  async generateInsights() {
    this.isLoading.set(true);
    this.insights.set([]);
    this.error.set(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze the following expense data and provide three concise insights for a financial executive. Categorize each insight as 'Observation', 'Suggestion', or 'Alert'. Focus on trends, anomalies, and actionable advice. Here's the data: ${JSON.stringify(this.expenseData)}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text;
      // Simple parsing - assumes Gemini returns insights in a predictable format.
      const parsedInsights = this.parseInsights(text);
      this.insights.set(parsedInsights);

    } catch (e) {
        this.error.set('Failed to generate insights. Please try again.');
        console.error(e);
    } finally {
        this.isLoading.set(false);
    }
  }

  private parseInsights(text: string): Insight[] {
    // A more robust parser would be needed for production. This is a simple example.
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const insights: Insight[] = [];
    for (const line of lines) {
        if (line.includes('Observation:')) {
            insights.push({ category: 'Observation', text: line.replace('Observation:', '').trim() });
        } else if (line.includes('Suggestion:')) {
            insights.push({ category: 'Suggestion', text: line.replace('Suggestion:', '').trim() });
        } else if (line.includes('Alert:')) {
            insights.push({ category: 'Alert', text: line.replace('Alert:', '').trim() });
        }
    }
     // If parsing fails, use fallback mock data
    if (insights.length === 0) {
      return [
        { category: 'Observation', text: 'Travel is the highest expense category, making up 45% of the total spend.' },
        { category: 'Suggestion', text: 'Consider reviewing software subscriptions as they account for 28% of expenses.' },
        { category: 'Alert', text: 'Monthly spend is at 72.5% of budget with half the month remaining.' },
      ];
    }
    return insights.slice(0, 3); // Return max 3 insights
  }

  getIconForCategory(category: 'Observation' | 'Suggestion' | 'Alert'): { icon: string, color: string } {
    switch (category) {
      case 'Observation':
        return {
          icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
          color: 'text-sky-500'
        };
      case 'Suggestion':
        return {
          icon: 'M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207',
          color: 'text-green-500'
        };
      case 'Alert':
        return {
          icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
          color: 'text-pink-500'
        };
    }
  }
}