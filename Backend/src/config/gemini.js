import { GoogleGenAI } from "@google/genai";
import { env } from "./env.js";
import logger from "./logger.js";

class GeminiService {
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    this.model = 'gemini-2.5-flash';
  }

  async makeRequest(prompt, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.ai.models.generateContent({
          model: this.model,
          contents: prompt,
        });

        if (response.text) {
          return response.text;
        }

        throw new Error('Invalid response format from Gemini API');
      } catch (error) {
        const status = error.status || error.code;
        const isRetryableError = [503, 429, 500, 502].includes(status);

        logger.error(`Gemini API Error (attempt ${attempt}/${retries}):`, {
          message: error.message,
          status: status
        });

        if (attempt === retries || !isRetryableError) {
          throw new Error(`Gemini API Error: ${error.message}`);
        }

        const waitTime = Math.pow(2, attempt) * 1000;
        logger.info(`Retrying Gemini API call in ${waitTime / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * Generate response for user question based on document context
   */
  async generateResponse(question, context, language = 'english') {
    try {
      // Custom handling for identity questions
      const identityKeywords = {
        english: ['who is rudra sharma', 'who made you', 'who created you'],
        hinglish: ['rudra sharma kaun hai', 'tumhe kisne banaya', 'tumhara creator kaun hai', 'kisne banaya tumhe', 'rudra sharma ne kya banaya'],
        hindi: ['रुद्र शर्मा कौन है', 'तुम्हें किसने बनाया', 'तुम्हारा निर्माता कौन है', 'तुम्हें किसने बनाया है', 'तुम्हें रुद्र शर्मा ने बनाया है क्या', 'तुम्हारे निर्माता कौन हैं']
      };

      const questionLower = typeof question === 'string' ? question.toLowerCase() : '';
      const isIdentityQuestion = 
        identityKeywords.english.some(kw => questionLower.includes(kw)) ||
        identityKeywords.hinglish.some(kw => questionLower.includes(kw)) ||
        identityKeywords.hindi.some(kw => question.includes(kw));

      if (isIdentityQuestion) {
        const responses = {
          hinglish: "Rudra Sharma ek problem solver hain aur ek MERN-stack based full-stack developer bhi hain. Wah AI tools banate hain students ke liye, jaise main hoon!",
          hindi: "रुद्र शर्मा एक प्रॉब्लम सॉल्वर और MERN स्टैक पर आधारित फुल-स्टैक डेवलपर हैं। उन्होंने मुझे छात्रों की मदद के लिए बनाया है।",
          english: "Rudra Sharma is a problem solver and a full-stack developer specializing in the MERN stack. He created this AI to help students like you!"
        };
        return responses[language] || responses.english;
      }

      const { documentText, conversationHistory } = context;

      let conversationContext = '';
      if (conversationHistory?.length > 0) {
        conversationContext = '\n\nPrevious conversation:\n';
        conversationHistory.slice(-6).forEach(msg => {
          conversationContext += `${msg.type === 'user' ? 'User' : 'AI'}: ${msg.content}\n`;
        });
      }

      const languageInstructions = {
        english: 'Respond in clear, professional English.',
        hinglish: 'Respond in Hinglish (mix of Hindi and English). Use common Hindi words mixed with English naturally, like "yeh question bahut interesting hai", "main aapko explain karta hun", "samjha kya?", "dekho", "bas", "acha", etc. Make it conversational and easy to understand for Indian students. Mix Hindi and English naturally throughout your response.',
        hindi: 'हिंदी में उत्तर दें।'
      };

      const langInstruction = languageInstructions[language] || languageInstructions.english;

      const prompt = `
You are an AI Doubt Solver designed to help users understand and solve problems from documents. You are an expert tutor who can explain concepts, solve problems, and provide detailed solutions. You were created by Rudra Sharma.

LANGUAGE INSTRUCTION: ${langInstruction}

Document Content:
${documentText}

${conversationContext}

Current Question: ${question}

Instructions:
1. ONLY answer the specific question asked by the user
2. If the user asks for greetings (like "hi", "hello"), respond with a friendly greeting and ask how you can help
3. If the user asks about specific problems in the document, then provide complete solutions with explanations
4. For coding problems, provide working code solutions with step-by-step explanations ONLY when specifically asked
5. For mathematical problems, show the complete solution process ONLY when specifically asked
6. For conceptual questions, provide detailed explanations with examples
7. If the user asks general questions about the document, provide relevant information without solving all problems
8. Always explain the reasoning behind your solutions when providing them
9. Provide code examples, algorithms, or formulas when relevant to the specific question
10. ALWAYS format code using proper markdown code blocks with language specification (e.g., triple-backtick-python, triple-backtick-javascript, triple-backtick-java, triple-backtick-cpp)
11. Use proper indentation and syntax highlighting for all code
12. Structure your response with clear headings and sections
13. Be educational and help the user learn, not just provide answers
14. If asked who created you or who made you, respond that you were created by Rudra Sharma
15. Do NOT automatically solve problems unless specifically asked to do so

Please provide a response that directly addresses the user's question:`;

      return await this.makeRequest(prompt);
    } catch (error) {
      if (error.message.includes('503') || error.message.includes('overloaded')) {
        const fallbackMessage = language === 'hinglish'
          ? `Sorry yaar, AI service abhi overloaded hai. Please thoda wait karo aur phir try karo. Main aapka question "${question}" ka answer dene ke liye ready hun jab service available hogi.`
          : `I apologize, but the AI service is currently overloaded. Please wait a moment and try again. I'll be ready to answer your question "${question}" once the service is available.`;

        return fallbackMessage;
      }

      throw new Error('Failed to generate AI response: ' + error.message);
    }
  }

  async generateSuggestedQuestions(documentText) {
    try {
      const prompt = `Analyze the following document content and generate 5-7 relevant questions that users might want to ask to get solutions and explanations. The questions should be:
1. Ask for solutions to specific problems mentioned in the document
2. Request explanations of concepts or algorithms
3. Ask for code implementations or examples
4. Request step-by-step solutions
5. Ask for clarifications on complex topics
6. Focus on learning and problem-solving

Document Content:
${documentText.substring(0, 3000)}... ${documentText.length > 3000 ? '(truncated)' : ''}

Generate questions that would help users get complete solutions and explanations. For example:
- "Can you solve [specific problem] with code?"
- "How do I implement [concept/algorithm]?"
- "Can you explain the solution to [problem] step by step?"

Please provide the questions as a JSON array of strings, like this:
["Question 1", "Question 2", "Question 3", ...]

Only return the JSON array, no additional text:`;

      const responseText = await this.makeRequest(prompt);
      const cleanedText = responseText.replace(/```json\s*|```/g, '').trim();

      try {
        const questions = JSON.parse(cleanedText);
        return Array.isArray(questions) ? questions : [];
      } catch (parseError) {
        logger.error('Error parsing suggested questions:', parseError);
        return this.extractQuestionsFromText(responseText);
      }
    } catch (error) {
      logger.error('Error generating suggested questions:', error);
      return [
        "What is the main topic of this document?",
        "Can you summarize the key points?",
        "What are the most important details?",
        "Are there any specific recommendations or conclusions?",
        "What should I know about this content?"
      ];
    }
  }

  extractQuestionsFromText(text) {
    const questionRegex = /^(?:\d+\.?\s*|[-*]\s*)?(.+\?)$/gm;
    const questions = [];
    let match;

    while ((match = questionRegex.exec(text)) !== null) {
      const question = match[1].trim();
      if (question.length > 5) {
        questions.push(question);
        if (questions.length >= 7) break;
      }
    }

    return questions.length > 0 ? questions : text
      .split('\n')
      .filter(line => line.trim().endsWith('?') && line.trim().length > 10)
      .map(line => line.trim().replace(/^\d+\.?\s*|^[-*]\s*/, ''))
      .filter(q => q.length > 5)
      .slice(0, 7);
  }

  async summarizeDocument(documentText) {
    try {
      const prompt = `
Please provide a concise summary of the following document. The summary should:
1. Capture the main topics and key points
2. Be approximately 2-3 paragraphs long
3. Highlight the most important information
4. Be written in clear, accessible language

Document Content:
${documentText}

Summary:`;

      return await this.makeRequest(prompt);
    } catch (error) {
      logger.error('Error summarizing document:', error);
      throw new Error('Failed to summarize document: ' + error.message);
    }
  }

  async extractKeyTopics(documentText) {
    try {
      const prompt = `
Analyze the following document and extract the main topics/themes. Return them as a JSON array of strings.

Document Content:
${documentText.substring(0, 2000)}... ${documentText.length > 2000 ? '(truncated)' : ''}

Please provide 5-10 key topics as a JSON array:`;

      const responseText = await this.makeRequest(prompt);

      try {
        const topics = JSON.parse(responseText);
        return Array.isArray(topics) ? topics : [];
      } catch (parseError) {
        logger.error('Error parsing key topics:', parseError);
        return [];
      }
    } catch (error) {
      logger.error('Error extracting key topics:', error);
      return [];
    }
  }
}

export default new GeminiService();


// import axios from "axios";
// import { env } from "./env.js";

// class GeminiService {
//   constructor() {
//     this.apiKey = env.GEMINI_API_KEY;
//     this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
//     this.model = 'gemini-2.0-flash';
//   }

//   async makeRequest(prompt, retries = 3) {
//     for (let attempt = 1; attempt <= retries; attempt++) {
//       try {
//         const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
//         const requestBody = {
//           contents: [{ parts: [{ text: prompt }] }]
//         };

//         const response = await axios.post(url, requestBody, {
//           headers: { 'Content-Type': 'application/json' },
//           timeout: 30000
//         });

//         if (response.data && response.data.candidates && response.data.candidates[0]) {
//           const content = response.data.candidates[0].content;
//           if (content && content.parts && content.parts[0]) {
//             return content.parts[0].text;
//           }
//         }

//         throw new Error('Invalid response format from Gemini API');
//       } catch (error) {
//         const status = error.response?.status;
//         const isRetryableError = [503, 429, 500, 502].includes(status);

//         if (error.response) {
//           console.error(`Gemini API Error (attempt ${attempt}/${retries}):`, error.response.status, error.response.data);
//         } else if (error.request) {
//           console.error(`Network Error (attempt ${attempt}/${retries}):`, error.message);
//         } else {
//           console.error(`Request Error (attempt ${attempt}/${retries}):`, error.message);
//         }

//         if (attempt === retries || !isRetryableError) {
//           if (error.response) {
//             throw new Error(`Gemini API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
//           } else if (error.request) {
//             throw new Error('Network error when calling Gemini API');
//           } else {
//             throw new Error(`Request error: ${error.message}`);
//           }
//         }

//         const waitTime = Math.pow(2, attempt) * 1000;
//         console.log(`Retrying Gemini API call in ${waitTime / 1000} seconds...`);
//         await new Promise(resolve => setTimeout(resolve, waitTime));
//       }
//     }
//   }

//   /**
//    * Generate response for user question based on document context
//    */
//   async generateResponse(question, context, language = 'english') {
//     try {
//       // Custom handling for identity questions
//       if (
//   typeof question === 'string' &&
//   (
//     // English
//     question.toLowerCase().includes("who is rudra sharma") ||
//     question.toLowerCase().includes("who made you") ||
//     question.toLowerCase().includes("who created you") ||

//     // Hinglish
//     question.toLowerCase().includes("rudra sharma kaun hai") ||
//     question.toLowerCase().includes("tumhe kisne banaya") ||
//     question.toLowerCase().includes("tumhara creator kaun hai") ||
//     question.toLowerCase().includes("kisne banaya tumhe") ||
//     question.toLowerCase().includes("rudra sharma ne kya banaya") ||

//     // Hindi (convert to lowercase just for consistency with others, doesn't affect Hindi)
//     question.includes("रुद्र शर्मा कौन है") ||
//     question.includes("तुम्हें किसने बनाया") ||
//     question.includes("तुम्हारा निर्माता कौन है") ||
//     question.includes("तुम्हें किसने बनाया है") ||
//     question.includes("तुम्हें रुद्र शर्मा ने बनाया है क्या") ||
//     question.includes("तुम्हारे निर्माता कौन हैं")
//   )
// )
//  {
//         if (language === 'hinglish') {
//           return "Rudra Sharma ek problem solver hain aur ek MERN-stack based full-stack developer bhi hain. Wah AI tools banate hain students ke liye, jaise main hoon!";
//         } else if (language === 'hindi') {
//           return "रुद्र शर्मा एक प्रॉब्लम सॉल्वर और MERN स्टैक पर आधारित फुल-स्टैक डेवलपर हैं। उन्होंने मुझे छात्रों की मदद के लिए बनाया है।";
//         } else {
//           return "Rudra Sharma is a problem solver and a full-stack developer specializing in the MERN stack. He created this AI to help students like you!";
//         }
//       }

//       const { documentText, conversationHistory } = context;

//       let conversationContext = '';
//       if (conversationHistory && conversationHistory.length > 0) {
//         conversationContext = '\n\nPrevious conversation:\n';
//         conversationHistory.slice(-6).forEach(msg => {
//           conversationContext += `${msg.type === 'user' ? 'User' : 'AI'}: ${msg.content}\n`;
//         });
//       }

//       const languageInstructions = {
//         english: 'Respond in clear, professional English.',
//         hinglish: 'Respond in Hinglish (mix of Hindi and English). Use common Hindi words mixed with English naturally, like "yeh question bahut interesting hai", "main aapko explain karta hun", "samjha kya?", "dekho", "bas", "acha", etc. Make it conversational and easy to understand for Indian students. Mix Hindi and English naturally throughout your response.',
//         hindi: 'हिंदी में उत्तर दें।'
//       };

//       const langInstruction = languageInstructions[language] || languageInstructions.english;

//       const prompt = `
// You are an AI Doubt Solver designed to help users understand and solve problems from documents. You are an expert tutor who can explain concepts, solve problems, and provide detailed solutions. You were created by Rudra Sharma.

// LANGUAGE INSTRUCTION: ${langInstruction}

// Document Content:
// ${documentText}

// ${conversationContext}

// Current Question: ${question}

// Instructions:
// 1. ONLY answer the specific question asked by the user
// 2. If the user asks for greetings (like "hi", "hello"), respond with a friendly greeting and ask how you can help
// 3. If the user asks about specific problems in the document, then provide complete solutions with explanations
// 4. For coding problems, provide working code solutions with step-by-step explanations ONLY when specifically asked
// 5. For mathematical problems, show the complete solution process ONLY when specifically asked
// 6. For conceptual questions, provide detailed explanations with examples
// 7. If the user asks general questions about the document, provide relevant information without solving all problems
// 8. Always explain the reasoning behind your solutions when providing them
// 9. Provide code examples, algorithms, or formulas when relevant to the specific question
// 10. ALWAYS format code using proper markdown code blocks with language specification (e.g., triple-backtick-python, triple-backtick-javascript, triple-backtick-java, triple-backtick-cpp)
// 11. Use proper indentation and syntax highlighting for all code
// 12. Structure your response with clear headings and sections
// 13. Be educational and help the user learn, not just provide answers
// 14. If asked who created you or who made you, respond that you were created by Rudra Sharma
// 15. Do NOT automatically solve problems unless specifically asked to do so

// Please provide a response that directly addresses the user's question:`;

//       return await this.makeRequest(prompt);
//     } catch (error) {
//       if (error.message.includes('503') || error.message.includes('overloaded')) {
//         const fallbackMessage = language === 'hinglish'
//           ? `Sorry yaar, AI service abhi overloaded hai. Please thoda wait karo aur phir try karo. Main aapka question "${question}" ka answer dene ke liye ready hun jab service available hogi.`
//           : `I apologize, but the AI service is currently overloaded. Please wait a moment and try again. I'll be ready to answer your question "${question}" once the service is available.`;

//         return fallbackMessage;
//       }

//       throw new Error('Failed to generate AI response: ' + error.message);
//     }
//   }

//   async generateSuggestedQuestions(documentText) {
//     try {
//       const prompt = `Analyze the following document content and generate 5-7 relevant questions that users might want to ask to get solutions and explanations. The questions should be:
// 1. Ask for solutions to specific problems mentioned in the document
// 2. Request explanations of concepts or algorithms
// 3. Ask for code implementations or examples
// 4. Request step-by-step solutions
// 5. Ask for clarifications on complex topics
// 6. Focus on learning and problem-solving

// Document Content:
// ${documentText.substring(0, 3000)}... ${documentText.length > 3000 ? '(truncated)' : ''}

// Generate questions that would help users get complete solutions and explanations. For example:
// - "Can you solve [specific problem] with code?"
// - "How do I implement [concept/algorithm]?"
// - "Can you explain the solution to [problem] step by step?"

// Please provide the questions as a JSON array of strings, like this:
// ["Question 1", "Question 2", "Question 3", ...]

// Only return the JSON array, no additional text:`;

//       const responseText = await this.makeRequest(prompt);
//       let cleanedText = responseText.replace(/```json\s*|```/g, '').trim();

//       try {
//         const questions = JSON.parse(cleanedText);
//         return Array.isArray(questions) ? questions : [];
//       } catch (parseError) {
//         console.error('Error parsing suggested questions:', parseError);
//         return this.extractQuestionsFromText(responseText);
//       }
//     } catch (error) {
//       console.error('Error generating suggested questions:', error);
//       return [
//         "What is the main topic of this document?",
//         "Can you summarize the key points?",
//         "What are the most important details?",
//         "Are there any specific recommendations or conclusions?",
//         "What should I know about this content?"
//       ];
//     }
//   }

//   extractQuestionsFromText(text) {
//     const lines = text.split('\n');
//     const questions = [];

//     for (const line of lines) {
//       const trimmed = line.trim();
//       if (trimmed.endsWith('?') && trimmed.length > 10) {
//         const cleaned = trimmed.replace(/^\d+\.?\s*/, '').replace(/^[-*]\s*/, '');
//         if (cleaned.length > 5) {
//           questions.push(cleaned);
//         }
//       }
//     }

//     return questions.slice(0, 7);
//   }

//   async summarizeDocument(documentText) {
//     try {
//       const prompt = `
// Please provide a concise summary of the following document. The summary should:
// 1. Capture the main topics and key points
// 2. Be approximately 2-3 paragraphs long
// 3. Highlight the most important information
// 4. Be written in clear, accessible language

// Document Content:
// ${documentText}

// Summary:`;

//       return await this.makeRequest(prompt);
//     } catch (error) {
//       console.error('Error summarizing document:', error);
//       throw new Error('Failed to summarize document: ' + error.message);
//     }
//   }

//   async extractKeyTopics(documentText) {
//     try {
//       const prompt = `
// Analyze the following document and extract the main topics/themes. Return them as a JSON array of strings.

// Document Content:
// ${documentText.substring(0, 2000)}... ${documentText.length > 2000 ? '(truncated)' : ''}

// Please provide 5-10 key topics as a JSON array:`;

//       const responseText = await this.makeRequest(prompt);

//       try {
//         const topics = JSON.parse(responseText);
//         return Array.isArray(topics) ? topics : [];
//       } catch (parseError) {
//         console.error('Error parsing key topics:', parseError);
//         return [];
//       }
//     } catch (error) {
//       console.error('Error extracting key topics:', error);
//       return [];
//     }
//   }
// }

// export default new GeminiService();