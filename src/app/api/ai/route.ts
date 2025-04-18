import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface StoryTone {
  name: string;
  value: number;
}

interface StoryData {
  layoffDate: string;
  previousRole: string;
  skills: string[];
  tones: StoryTone[];
}

interface FinancialScenario {
  currentSavings: number;
  monthlyExpenses: {
    [key: string]: number;
  };
  severancePay: number;
  monthlyIncome: number;
  timeframe: number;
  expenseChange: number;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getFormattedToneValue = (tones: StoryTone[], toneName: string): number => {
  const tone = tones.find(t => t.name === toneName);
  return Math.round((tone?.value ?? 0.5) * 100);
};

export async function POST(request: Request) {
  const { text, type } = await request.json();

  try {
    switch (type) {
      case 'sentiment': {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a sentiment analysis expert. Analyze the following text and return a sentiment score between -1 (very negative) and 1 (very positive) with an explanation."
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.3,
          max_tokens: 150
        });

        const content = response.choices[0].message.content;
        const scoreMatch = content.match(/(-?\d+(\.\d+)?)/);
        const score = scoreMatch ? parseFloat(scoreMatch[0]) : 0;
        const explanation = content.replace(scoreMatch?.[0] ?? '', '').trim();

        return NextResponse.json({ score, explanation });
      }

      case 'coping_strategy': {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an empathetic career coach and therapist. Based on the user's journal entry, provide a supportive response with specific coping strategies and actionable advice."
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        });

        return NextResponse.json({ 
          strategy: response.choices[0].message.content 
        });
      }

      case 'career_analysis': {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a career advisor specializing in tech industry transitions. Analyze the user's skills and suggest emerging career paths with high growth potential."
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        });

        return NextResponse.json({ 
          analysis: response.choices[0].message.content 
        });
      }

      case 'story_generation': {
        const storyData: StoryData = JSON.parse(text);
        const { layoffDate, previousRole, skills, tones } = storyData;

        const generateContent = async (prompt: string) => {
          const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `You are an expert at crafting professional narratives. Generate content that is:
                - Professional: ${getFormattedToneValue(tones, 'Professional')}%
                - Optimistic: ${getFormattedToneValue(tones, 'Optimistic')}%
                - Grateful: ${getFormattedToneValue(tones, 'Grateful')}%`
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 500
          });
          return response.choices[0].message.content ?? '';
        };

        const [linkedinPost, networkingPitch, interviewAnswer] = await Promise.all([
          generateContent(
            `Create a LinkedIn post announcing my layoff from my role as ${previousRole} on ${layoffDate}. 
             Include my key skills: ${skills.join(', ')}. 
             The post should be professional yet personal, showing resilience and openness to new opportunities.`
          ),
          generateContent(
            `Create a brief elevator pitch I can use for networking after being laid off from my ${previousRole} role.
             Highlight my key skills: ${skills.join(', ')}.
             The pitch should be confident and forward-looking while being authentic about the layoff.`
          ),
          generateContent(
            `Create a response to the interview question "Why did you leave your last role?"
             Context: Laid off from ${previousRole} role on ${layoffDate}.
             The response should be honest about the layoff while emphasizing my skills and growth mindset.`
          )
        ]);

        return NextResponse.json({
          content: {
            linkedinPost,
            networkingPitch,
            interviewAnswer
          }
        });
      }

      case 'financial_forecast': {
        const scenario: FinancialScenario = JSON.parse(text);
        const totalMonthlyExpenses = Object.values(scenario.monthlyExpenses).reduce((a, b) => a + b, 0);
        const adjustedMonthlyExpenses = totalMonthlyExpenses + scenario.expenseChange;
        const monthlyBurn = adjustedMonthlyExpenses - scenario.monthlyIncome;
        const totalFunds = scenario.currentSavings + scenario.severancePay;
        const runway = monthlyBurn > 0 ? totalFunds / monthlyBurn : 0;

        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a financial advisor and mental health expert. Analyze the financial scenario and provide:
              1. A stress level prediction (1-10)
              2. Key financial risks
              3. Coping strategies
              4. Recommended actions

              Consider:
              - Monthly burn rate: $${monthlyBurn.toFixed(2)}
              - Financial runway: ${runway.toFixed(1)} months
              - Planned timeframe: ${scenario.timeframe} months
              - Monthly expense change: $${scenario.expenseChange}`
            },
            {
              role: "user",
              content: "Provide an analysis of this financial situation and its potential mental health impact."
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        });

        const analysis = response.choices[0].message.content ?? '';
        
        // Extract stress level using regex
        const stressMatch = analysis.match(/stress level.*?(\d+)/i);
        const stressLevel = stressMatch ? parseInt(stressMatch[1]) : 5;

        return NextResponse.json({
          analysis,
          stressLevel,
          financials: {
            monthlyBurn,
            runway,
            adjustedMonthlyExpenses
          }
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}