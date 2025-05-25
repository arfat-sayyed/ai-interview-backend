const prisma = require('../utils/prisma');

// Get feedback for an interview
const getFeedback = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Get interview with messages and feedback
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        feedback: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        user: true,
      },
    });

    if (!interview) {
      return res.status(404).json({ 
        error: 'Interview not found' 
      });
    }

    if (!interview.feedback) {
      return res.status(404).json({ 
        error: 'Feedback not yet generated' 
      });
    }

    // Calculate interview duration
    const duration = interview.endedAt && interview.startedAt
      ? Math.floor((new Date(interview.endedAt) - new Date(interview.startedAt)) / 1000 / 60)
      : 0;

    // Count questions asked
    const questionsAsked = interview.messages.filter(m => m.role === 'AI').length;

    res.json({
      success: true,
      feedback: interview.feedback,
      interview: {
        id: interview.id,
        position: interview.position,
        company: interview.company,
        duration: duration,
        questionsAsked: questionsAsked,
        startedAt: interview.startedAt,
        endedAt: interview.endedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ 
      error: 'Failed to fetch feedback' 
    });
  }
};

module.exports = {
  getFeedback,
};