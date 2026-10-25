const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');
const Post = require('../models/Post');
const Circle = require('../models/Circle');

beforeAll(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vibewall_test';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
  // Clear test data
  await User.deleteMany({ email: { $regex: /@test\.com$/ } });
  await Post.deleteMany({});
});

afterAll(async () => {
  // Clean up
  await User.deleteMany({ email: { $regex: /@test\.com$/ } });
  await Post.deleteMany({});
  await mongoose.connection.close();
});

describe('VibeWall Backend API Tests', () => {
  let user1Token;
  let user1Id;
  let user2Token;
  let user2Id;
  let createdPostId;

  // 1. Health check
  test('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  // 2. Registration
  test('POST /api/auth/register should create a real user in MongoDB', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Alex Morgan',
        username: 'alex_test',
        email: 'alex@test.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('alex_test');

    user1Token = res.body.token;
    user1Id = res.body.user._id;

    // Verify in MongoDB
    const dbUser = await User.findById(user1Id);
    expect(dbUser).not.toBeNull();
    expect(dbUser.password).not.toBe('password123'); // Password must be hashed!
  });

  // 3. Reject duplicate username
  test('POST /api/auth/register should reject duplicate username', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Alex Duplicate',
        username: 'alex_test',
        email: 'alex_diff@test.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 4. Reject duplicate email
  test('POST /api/auth/register should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Alex Other',
        username: 'alex_other',
        email: 'alex@test.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 5. Register User 2
  test('Register second user for cross-user interaction tests', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Jordan Lee',
        username: 'jordan_test',
        email: 'jordan@test.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

    expect(res.statusCode).toBe(201);
    user2Token = res.body.token;
    user2Id = res.body.user._id;
  });

  // 6. Login with valid credentials
  test('POST /api/auth/login should authenticate with registered credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        usernameOrEmail: 'alex_test',
        password: 'password123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  // 7. Login with invalid password
  test('POST /api/auth/login should reject incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        usernameOrEmail: 'alex_test',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 8. Session recovery / GET /api/auth/me
  test('GET /api/auth/me should return authenticated user with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.username).toBe('alex_test');
  });

  // 9. Unauthorized request without token
  test('GET /api/auth/me should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  // 10. Create Post
  test('POST /api/posts should create real post authored by user1', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        content: 'Hello VibeWall! This is a real test post published to MongoDB.'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.post.content).toContain('Hello VibeWall!');
    createdPostId = res.body.post._id;

    // Verify in MongoDB
    const postInDb = await Post.findById(createdPostId);
    expect(postInDb).not.toBeNull();
    expect(postInDb.author.toString()).toBe(user1Id.toString());
  });

  // 11. Add reaction from User 2
  test('POST /api/posts/:postId/react should add a reaction from User 2', async () => {
    const res = await request(app)
      .post(`/api/posts/${createdPostId}/react`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ type: 'inspired' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.reactionCounts.inspired).toBe(1);
    expect(res.body.userReaction).toBe('inspired');
  });

  // 12. Add comment from User 2
  test('POST /api/posts/:postId/comments should add a comment from User 2', async () => {
    const res = await request(app)
      .post(`/api/posts/${createdPostId}/comments`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ content: 'Inspiring first post!' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.comment.content).toBe('Inspiring first post!');
    expect(res.body.commentsCount).toBe(1);
  });

  // 13. Bookmark post by User 2
  test('POST /api/posts/:postId/bookmark should bookmark post privately for User 2', async () => {
    const res = await request(app)
      .post(`/api/posts/${createdPostId}/bookmark`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.isBookmarked).toBe(true);

    // Verify User 2 can see it in bookmarks
    const bmRes = await request(app)
      .get('/api/bookmarks')
      .set('Authorization', `Bearer ${user2Token}`);

    expect(bmRes.statusCode).toBe(200);
    expect(bmRes.body.posts.length).toBe(1);
    expect(bmRes.body.posts[0]._id.toString()).toBe(createdPostId.toString());

    // Verify User 1 cannot see User 2's bookmark
    const u1BmRes = await request(app)
      .get('/api/bookmarks')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(u1BmRes.statusCode).toBe(200);
    expect(u1BmRes.body.posts.length).toBe(0);
  });

  // 14. Authorization: User 2 CANNOT edit User 1's post
  test('PUT /api/posts/:id should reject unauthorized edit attempt by User 2', async () => {
    const res = await request(app)
      .put(`/api/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ content: 'Attempted hack' });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // 15. User 1 CAN edit their own post
  test('PUT /api/posts/:id should allow owner to edit post', async () => {
    const res = await request(app)
      .put(`/api/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ content: 'Updated content by owner Alex.' });

    expect(res.statusCode).toBe(200);
    expect(res.body.post.content).toBe('Updated content by owner Alex.');
  });

  // 16. Vibe Circles: browse and join
  test('GET /api/circles should return seeded circles and allow joining', async () => {
    const circlesRes = await request(app).get('/api/circles');
    expect(circlesRes.statusCode).toBe(200);
    expect(circlesRes.body.circles.length).toBeGreaterThan(0);

    const firstCircleId = circlesRes.body.circles[0]._id;

    // User 1 joins circle
    const joinRes = await request(app)
      .post(`/api/circles/${firstCircleId}/join`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(joinRes.statusCode).toBe(200);
    expect(joinRes.body.isMember).toBe(true);
  });

  // 17. User 1 deletes their own post
  test('DELETE /api/posts/:id should allow owner to delete post', async () => {
    const res = await request(app)
      .delete(`/api/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.statusCode).toBe(200);

    // Verify it is gone from MongoDB
    const postInDb = await Post.findById(createdPostId);
    expect(postInDb).toBeNull();
  });
});
