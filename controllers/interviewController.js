const prisma = require('../utils/prisma');
const pdf = require('pdf-parse');
const { generateInterviewQuestion, generateInterviewFeedback } = require('../services/groqService');

// Update the startInterview function
const startInterview = async (req, res) => {
  try {
    console.log('Starting interview...');
    
    const { jobDescription, position, company } = req.body;
    const resumeFile = req.file;

    // Validate inputs
    if (!resumeFile || !jobDescription || !position) {
      return res.status(400).json({ 
        error: 'Missing required fields: resume, job description, and position are required' 
      });
    }

    // Parse PDF
    console.log('Parsing PDF...');
    let resumeText;
    try {
      const pdfData = await pdf(resumeFile.buffer);
      resumeText = pdfData.text;
      console.log('PDF parsed successfully, length:', resumeText.length);
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return res.status(400).json({ 
        error: 'Failed to parse PDF. Please ensure it\'s a valid PDF file.' 
      });
    }

    // Create a guest user
    console.log('Creating user...');
    const user = await prisma.user.create({
      data: {
        name: 'Guest User',
      },
    });

    // Create interview
    console.log('Creating interview...');
    const interview = await prisma.interview.create({
      data: {
        userId: user.id,
        resumeText,
        jobDescription,
        position,
        company: company || null,
        status: 'ACTIVE',
      },
    });

    // Generate first AI question using OpenAI
    let firstQuestion;
    try {
      firstQuestion = await generateInterviewQuestion({
        resumeText,
        jobDescription,
        position,
        company,
        previousMessages: [],
        messageCount: 0,
      });
    } catch (error) {
      console.error('Error generating first question:', error);
      // Fallback
      firstQuestion = `Hello! Thank you for applying for the ${position} position${company ? ` at ${company}` : ''}. I've reviewed your resume and I'm excited to learn more about your background. To start, could you please tell me about yourself and what attracted you to this ${position} role?`;
    }

    // Save first AI message
    await prisma.message.create({
      data: {
        interviewId: interview.id,
        role: 'AI',
        content: firstQuestion,
      },
    });

    console.log('Interview created successfully:', interview.id);

    res.json({
      success: true,
      interviewId: interview.id,
      firstQuestion,
    });
  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({ 
      error: 'Failed to start interview', 
      details: error.message 
    });
  }
};

// Update the endInterview function
const endInterview = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get interview with messages
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Update interview status
    await prisma.interview.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
      },
    });

    // Generate AI feedback
    let feedbackData;
    try {
      feedbackData = await generateInterviewFeedback({
        resumeText: interview.resumeText,
        jobDescription: interview.jobDescription,
        position: interview.position,
        messages: interview.messages,
      });
    } catch (error) {
      console.error('Error generating AI feedback:', error);
      // Fallback feedback
      feedbackData = {
        overallRating: 7,
        technicalScore: 7,
        communicationScore: 8,
        problemSolving: 7,
        cultureFit: 7,
        strengths: ['Good communication', 'Relevant experience', 'Enthusiastic'],
        improvements: ['Provide more specific examples', 'Deeper technical details', 'Practice STAR method'],
        detailedFeedback: 'Thank you for completing the interview. Your responses showed good understanding of the role requirements.',
        recommendations: [
          { title: 'STAR Method Guide', url: 'https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique' }
        ],
        nextSteps: ['Review technical concepts', 'Prepare more examples', 'Practice behavioral questions'],
      };
    }

    // Save feedback
    const feedback = await prisma.feedback.create({
      data: {
        interviewId: id,
        ...feedbackData,
      },
    });

    res.json({ 
      success: true, 
      feedbackId: feedback.id 
    });
  } catch (error) {
    console.error('Error ending interview:', error);
    res.status(500).json({ 
      error: 'Failed to end interview' 
    });
  }
};

// Keep getInterview as is
const getInterview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        user: true,
      },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error('Error fetching interview:', error);
    res.status(500).json({ 
      error: 'Failed to fetch interview' 
    });
  }
};

module.exports = {
  startInterview,
  getInterview,
  endInterview,
};