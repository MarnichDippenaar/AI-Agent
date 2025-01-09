import axios from 'axios';

const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';

export class AIService {
  static async getStructuredAdvice(userProfile, weatherData) {
    try {
      const prompt = this.constructPrompt(userProfile, weatherData);
      const response = await this.callOpenAI(prompt);
      return this.parseResponse(response);
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to get farming advice');
    }
  }

  static constructPrompt(userProfile, weatherData) {
    return {
      role: 'system',
      content: `You are an expert agricultural advisor. Provide specific advice in the following format:
        {
          "cropCare": [specific recommendations for crop maintenance],
          "irrigation": [water management advice based on weather],
          "pestManagement": [pest and disease prevention/treatment],
          "urgent": [any immediate actions needed],
          "longTerm": [planning advice for the coming weeks]
        }
        
        Consider:
        - Current temperature: ${weatherData.main.temp}°C
        - Humidity: ${weatherData.main.humidity}%
        - Weather condition: ${weatherData.weather[0].main}
        - Crops: ${userProfile.crops}
        - Soil type: ${userProfile.soilType}
        
        Provide practical, actionable advice that a farmer can implement immediately.`
    };
  }

  static async callOpenAI(prompt) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [prompt],
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  static parseResponse(response) {
    try {
      const parsed = JSON.parse(response);
      return {
        cropCare: parsed.cropCare || [],
        irrigation: parsed.irrigation || [],
        pestManagement: parsed.pestManagement || [],
        urgent: parsed.urgent || [],
        longTerm: parsed.longTerm || []
      };
    } catch (error) {
      return this.fallbackParsing(response);
    }
  }

  static fallbackParsing(response) {
    const categories = {
      cropCare: [],
      irrigation: [],
      pestManagement: [],
      urgent: [],
      longTerm: []
    };

    const lines = response.split('\n');
    let currentCategory = null;

    lines.forEach(line => {
      line = line.trim();
      if (!line) return;

      if (line.toLowerCase().includes('crop care:')) {
        currentCategory = 'cropCare';
      } else if (line.toLowerCase().includes('irrigation:')) {
        currentCategory = 'irrigation';
      } else if (line.toLowerCase().includes('pest') || line.toLowerCase().includes('disease')) {
        currentCategory = 'pestManagement';
      } else if (line.toLowerCase().includes('urgent:')) {
        currentCategory = 'urgent';
      } else if (line.toLowerCase().includes('long term:')) {
        currentCategory = 'longTerm';
      } else if (currentCategory && line.startsWith('-')) {
        categories[currentCategory].push(line.substring(1).trim());
      }
    });

    return categories;
  }
}
