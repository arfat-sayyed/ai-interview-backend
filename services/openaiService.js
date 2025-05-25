const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate interview questions based on context
async function generateInterviewQuestion(params) {
  const { 
    resumeText, 
    jobDescription, 
    position, 
    company, 
    previousMessages,
    messageCount 
  } = params;

  try {
    // Build conversation history
    const messages = [
      {
        role: 'system',
        content: `You are an expert technical interviewer conducting an interview for a ${position} position${company ? ` at ${company}` : ''}. 
        
Your goal is to:
1. Ask relevant questions based on the candidate's resume and the job description
2. Assess technical skills, problem-solving ability, and cultural fit
3. Keep questions concise and focused
4. Ask follow-up questions based on their responses
5. Gradually increase difficulty as the interview progresses
6. Be professional but friendly

Resume Summary: ${resumeText.substring(0, 1000)}...

Job Description: ${jobDescription.substring(0, 800)}...

Interview Progress: Question ${messageCount + 1}
${messageCount === 0 ? 'Start with a warm introduction and ask them to tell you about themselves.' : ''}
${messageCount >= 6 ? 'Start wrapping up the interview.' : ''}
${messageCount >= 8 ? 'Ask if they have any questions for you.' : ''}`
      }
    ];

    // Add previous conversation
    previousMessages.forEach(msg => {
      messages.push({
        role: msg.role === 'AI' ? 'assistant' : 'user',
        content: msg.content
      });
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 200,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Error:', error);
    throw new Error('Failed to generate question');
  }
}

// Analyze interview and generate feedback
async function generateInterviewFeedback(params) {
  const { 
    resumeText, 
    jobDescription, 
    position, 
    messages 
  } = params;

  try {
    const conversationText = messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert interview evaluator. Analyze this interview transcript and provide detailed feedback.
          
Position: ${position}
Job Description Summary: ${jobDescription.substring(0, 500)}...

Provide feedback in the following JSON format:
{
  "overallRating": <1-10>,
  "technicalScore": <1-10>,
  "communicationScore": <1-10>,
  "problemSolving": <1-10>,
  "cultureFit": <1-10>,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "detailedFeedback": "A paragraph of detailed feedback",
  "recommendations": [
    {"title": "Resource Name", "url": "https://example.com"}
  ],
  "nextSteps": ["step1", "step2", "step3"]
}`
        },
        {
          role: 'user',
          content: `Interview Transcript:\n\n${conversationText}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const feedbackData = JSON.parse(completion.choices[0].message.content);
    return feedbackData;
  } catch (error) {
    console.error('OpenAI Feedback Error:', error);
    throw new Error('Failed to generate feedback');
  }
}

module.exports = {
  generateInterviewQuestion,
  generateInterviewFeedback,
};