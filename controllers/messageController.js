const prisma = require('../utils/prisma');
const { generateInterviewQuestion } = require('../services/groqService');

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        error: 'Message cannot be empty' 
      });
    }

    // Get interview details
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 20, // Last 20 messages for context
        },
      },
    });

    if (!interview) {
      return res.status(404).json({ 
        error: 'Interview not found' 
      });
    }

    if (interview.status !== 'ACTIVE') {
      return res.status(400).json({ 
        error: 'Interview is not active' 
      });
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        interviewId,
        role: 'USER',
        content: message.trim(),
      },
    });

    // Generate AI response using OpenAI
    let aiResponse;
    try {
      aiResponse = await generateInterviewQuestion({
        resumeText: interview.resumeText,
        jobDescription: interview.jobDescription,
        position: interview.position,
        company: interview.company,
        previousMessages: [...interview.messages, userMessage],
        messageCount: interview.messages.length / 2, // Divide by 2 to get question count
      });
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Fallback to a generic response
      aiResponse = "I apologize, but I'm having trouble generating a response. Let's continue with: Can you tell me more about your experience with the technologies mentioned in the job description?";
    }

    // Save AI message
    const aiMessage = await prisma.message.create({
      data: {
        interviewId,
        role: 'AI',
        content: aiResponse,
      },
    });

    res.json({
      success: true,
      userMessage,
      aiMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error.message 
    });
  }
};

// Keep the getMessages function as is
const getMessages = async (req, res) => {
  try {
    const { interviewId } = req.params;
    
    const messages = await prisma.message.findMany({
      where: { interviewId },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      error: 'Failed to fetch messages' 
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};