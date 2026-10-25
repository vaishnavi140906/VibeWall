const Circle = require('../models/Circle');
const CircleMembership = require('../models/CircleMembership');

// Initial default circles list for first-time database seed
const DEFAULT_CIRCLES = [
  {
    name: 'Technology & Code',
    slug: 'technology-and-code',
    description: 'Discussions on software engineering, web tech, open source, and innovative tools.',
    category: 'Technology',
    icon: 'Cpu',
    coverColor: 'from-blue-500 to-indigo-600'
  },
  {
    name: 'Art & Visual Design',
    slug: 'art-and-visual-design',
    description: 'A sanctuary for illustrators, graphic designers, UI/UX crafters, and visual thinkers.',
    category: 'Art and Design',
    icon: 'Palette',
    coverColor: 'from-fuchsia-500 to-pink-500'
  },
  {
    name: 'Student & Campus Life',
    slug: 'student-and-campus-life',
    description: 'Study sessions, student hacks, campus life stories, and collaborative learning.',
    category: 'Student Life',
    icon: 'GraduationCap',
    coverColor: 'from-amber-500 to-orange-500'
  },
  {
    name: 'Photography & Light',
    slug: 'photography-and-light',
    description: 'Sharing visual perspectives, composition tips, street frames, and photo stories.',
    category: 'Photography',
    icon: 'Camera',
    coverColor: 'from-emerald-500 to-teal-600'
  },
  {
    name: 'Music & Sound Waves',
    slug: 'music-and-sound-waves',
    description: 'Album discoveries, playlists, music production, and favorite acoustic vibes.',
    category: 'Music',
    icon: 'Headphones',
    coverColor: 'from-violet-500 to-purple-600'
  },
  {
    name: 'Personal Growth & Habits',
    slug: 'personal-growth-and-habits',
    description: 'Mindset shifts, daily habits, reading notes, and building a balanced lifestyle.',
    category: 'Personal Growth',
    icon: 'Sparkles',
    coverColor: 'from-rose-500 to-red-500'
  }
];

// Ensure circles are seeded if database is fresh
exports.ensureDefaultCircles = async () => {
  try {
    const count = await Circle.countDocuments();
    if (count === 0) {
      await Circle.insertMany(DEFAULT_CIRCLES);
      console.log('[Circles] Seeded default Vibe Circles into MongoDB.');
    }
  } catch (error) {
    console.error('[Circles Seed Error]', error.message);
  }
};

// @desc    Get all circles
// @route   GET /api/circles
exports.getCircles = async (req, res) => {
  try {
    const totalCount = await Circle.countDocuments();
    if (totalCount === 0) {
      await exports.ensureDefaultCircles();
    }

    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const circles = await Circle.find(filter).sort({ memberCount: -1, createdAt: 1 }).lean();

    if (req.user) {
      const userMemberships = await CircleMembership.find({ user: req.user._id }).lean();
      const memberCircleIds = new Set(userMemberships.map(m => m.circle.toString()));

      circles.forEach(c => {
        c.isMember = memberCircleIds.has(c._id.toString());
      });
    }

    res.status(200).json({
      success: true,
      circles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching circles.'
    });
  }
};

// @desc    Get circle by slug
// @route   GET /api/circles/:slug
exports.getCircleBySlug = async (req, res) => {
  try {
    const circle = await Circle.findOne({ slug: req.params.slug.toLowerCase() }).lean();
    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found.'
      });
    }

    if (req.user) {
      const membership = await CircleMembership.findOne({
        circle: circle._id,
        user: req.user._id
      });
      circle.isMember = Boolean(membership);
    }

    res.status(200).json({
      success: true,
      circle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching circle.'
    });
  }
};

// @desc    Create new circle
// @route   POST /api/circles
exports.createCircle = async (req, res) => {
  try {
    const { name, description, category, icon, coverColor } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Circle name, description, and category are required.'
      });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existingCircle = await Circle.findOne({ $or: [{ name: name.trim() }, { slug }] });
    if (existingCircle) {
      return res.status(400).json({
        success: false,
        message: 'A circle with this name already exists.'
      });
    }

    const circle = await Circle.create({
      name: name.trim(),
      slug,
      description: description.trim(),
      category,
      icon: icon || 'Compass',
      coverColor: coverColor || 'from-violet-500 to-indigo-600',
      creator: req.user._id,
      memberCount: 1
    });

    // Creator automatically becomes a member
    await CircleMembership.create({
      circle: circle._id,
      user: req.user._id
    });

    const circleObj = circle.toObject();
    circleObj.isMember = true;

    res.status(201).json({
      success: true,
      message: 'Circle created successfully.',
      circle: circleObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating circle.'
    });
  }
};

// @desc    Join circle
// @route   POST /api/circles/:id/join
exports.joinCircle = async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id);
    if (!circle) {
      return res.status(404).json({ success: false, message: 'Circle not found.' });
    }

    const existingMembership = await CircleMembership.findOne({
      circle: circle._id,
      user: req.user._id
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this circle.'
      });
    }

    await CircleMembership.create({
      circle: circle._id,
      user: req.user._id
    });

    const updatedCircle = await Circle.findByIdAndUpdate(
      circle._id,
      { $inc: { memberCount: 1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `You joined ${circle.name}!`,
      memberCount: updatedCircle.memberCount,
      isMember: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error joining circle.'
    });
  }
};

// @desc    Leave circle
// @route   POST /api/circles/:id/leave
exports.leaveCircle = async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id);
    if (!circle) {
      return res.status(404).json({ success: false, message: 'Circle not found.' });
    }

    const membership = await CircleMembership.findOneAndDelete({
      circle: circle._id,
      user: req.user._id
    });

    if (!membership) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this circle.'
      });
    }

    const updatedCircle = await Circle.findByIdAndUpdate(
      circle._id,
      { $inc: { memberCount: -1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `You left ${circle.name}.`,
      memberCount: Math.max(0, updatedCircle.memberCount),
      isMember: false
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error leaving circle.'
    });
  }
};

// @desc    Get current user's joined circles
// @route   GET /api/circles/my/joined
exports.getMyCircles = async (req, res) => {
  try {
    const memberships = await CircleMembership.find({ user: req.user._id })
      .populate('circle')
      .sort({ createdAt: -1 });

    const circles = memberships.map(m => ({
      ...m.circle.toObject(),
      isMember: true
    }));

    res.status(200).json({
      success: true,
      circles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching your joined circles.'
    });
  }
};
