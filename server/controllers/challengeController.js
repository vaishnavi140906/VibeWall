const DailyChallenge = require('../models/DailyChallenge');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const Post = require('../models/Post');

const SPARK_PROMPTS = [
  {
    title: 'A Micro-Moment of Joy',
    prompt: 'What was something small, unexpected, or simple today that made you pause and smile?',
    category: 'Mindfulness'
  },
  {
    title: 'The Best Advice You Received',
    prompt: 'What is a piece of advice or wisdom someone gave you that genuinely changed the way you think?',
    category: 'Perspective'
  },
  {
    title: 'Current Creative Obsession',
    prompt: 'Share a project, craft, skill, or hobby you are currently learning or passionate about.',
    category: 'Creativity'
  },
  {
    title: 'Unsung Everyday Hero',
    prompt: 'Name an everyday object, habit, or tool that quietly makes your daily life 10x better.',
    category: 'Gratitude'
  },
  {
    title: 'Soundtrack of the Week',
    prompt: 'What song or sound captures the exact frequency of your thoughts right now?',
    category: 'Music'
  },
  {
    title: 'A Place That Heals You',
    prompt: 'Describe a location—a cozy cafe corner, a park bench, or a rooftop—where you feel completely at ease.',
    category: 'Reflection'
  },
  {
    title: 'A Question You Keep Asking',
    prompt: 'What is an open question you have been pondering recently about the future, people, or yourself?',
    category: 'Philosophy'
  }
];

// Normalize date to midnight UTC
const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// @desc    Get today's active Daily Spark challenge
// @route   GET /api/challenges/today
exports.getTodayChallenge = async (req, res) => {
  try {
    const today = getStartOfDay();

    let challenge = await DailyChallenge.findOne({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!challenge) {
      // Pick prompt deterministically based on day number so it varies smoothly
      const dayIndex = Math.floor(today.getTime() / (24 * 60 * 60 * 1000)) % SPARK_PROMPTS.length;
      const template = SPARK_PROMPTS[dayIndex];

      challenge = await DailyChallenge.create({
        title: template.title,
        prompt: template.prompt,
        category: template.category,
        date: today,
        active: true,
        submissionCount: 0
      });
      console.log(`[Daily Spark] Created today's challenge: "${challenge.title}"`);
    }

    const challengeObj = challenge.toObject();

    if (req.user) {
      const submission = await ChallengeSubmission.findOne({
        challenge: challenge._id,
        user: req.user._id
      });
      challengeObj.hasSubmitted = Boolean(submission);
      if (submission) {
        challengeObj.userPostId = submission.post;
      }
    }

    res.status(200).json({
      success: true,
      challenge: challengeObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching daily challenge.'
    });
  }
};

// @desc    Get submissions for a daily challenge
// @route   GET /api/challenges/:id/submissions
exports.getChallengeSubmissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const challenge = await DailyChallenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    const posts = await Post.find({ dailyChallenge: challenge._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'fullName username avatar')
      .populate('circle', 'name slug coverColor icon');

    const total = await Post.countDocuments({ dailyChallenge: challenge._id });

    res.status(200).json({
      success: true,
      challenge,
      posts,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching challenge submissions.'
    });
  }
};
