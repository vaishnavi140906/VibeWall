const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        // Allow unauthenticated socket connection for public feeds
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vibewall_jwt_secret_token_key_dev_2026_community');
      const user = await User.findById(decoded.id).select('_id username fullName');
      if (user) {
        socket.user = user;
      }
      next();
    } catch (err) {
      // Proceed unauthenticated on invalid token rather than killing connection
      socket.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    if (socket.user) {
      socket.join(`user:${socket.user._id}`);
      console.log(`[Socket] Authenticated user connected: @${socket.user.username} (${socket.id})`);
    } else {
      console.log(`[Socket] Guest client connected: ${socket.id}`);
    }

    socket.on('join:circle', (circleId) => {
      if (circleId) {
        socket.join(`circle:${circleId}`);
      }
    });

    socket.on('leave:circle', (circleId) => {
      if (circleId) {
        socket.leave(`circle:${circleId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

const sendNotificationToUser = (userId, notification) => {
  if (io && userId) {
    io.to(`user:${userId.toString()}`).emit('notification:new', notification);
  }
};

const broadcastNewPost = (post, circleId = null) => {
  if (!io) return;
  io.emit('post:new', post);
  if (circleId) {
    io.to(`circle:${circleId.toString()}`).emit('circle:new_post', post);
  }
};

const broadcastPostReaction = (postId, reactionCounts, userId = null, type = null) => {
  if (io) {
    io.emit('post:reaction', { postId, reactionCounts, userId, type });
  }
};

const broadcastPostComment = (postId, comment, commentsCount) => {
  if (io) {
    io.emit('post:comment', { postId, comment, commentsCount });
  }
};

const broadcastPostDeleted = (postId) => {
  if (io) {
    io.emit('post:deleted', { postId });
  }
};

module.exports = {
  initSocket,
  getIO,
  sendNotificationToUser,
  broadcastNewPost,
  broadcastPostReaction,
  broadcastPostComment,
  broadcastPostDeleted
};
