const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runE2EJourney() {
  console.log('--- STARTING LIVE E2E JOURNEY TEST ON http://localhost:5000 ---');

  const timestamp = Date.now();
  const testUser = {
    fullName: 'Maya Lin',
    username: `maya_${timestamp}`,
    email: `maya_${timestamp}@example.com`,
    password: 'password123',
    confirmPassword: 'password123'
  };

  // 1. Register new user
  console.log('1. Testing User Registration...');
  const regRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(testUser)
  });
  assert.strictEqual(regRes.status, 201, `Registration failed: ${JSON.stringify(regRes.data)}`);
  assert(regRes.data.token, 'Token not returned');
  const token = regRes.data.token;
  const user = regRes.data.user;
  console.log(`   ✓ Registered real user @${user.username} (ID: ${user._id})`);

  // 2. Reject duplicate registration
  console.log('2. Testing Duplicate Username Rejection...');
  const dupRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(testUser)
  });
  assert.strictEqual(dupRes.status, 400, 'Duplicate registration should have been rejected');
  console.log('   ✓ Duplicate registration correctly rejected with 400');

  // 3. Login with credentials
  console.log('3. Testing User Login...');
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ usernameOrEmail: testUser.username, password: testUser.password })
  });
  assert.strictEqual(loginRes.status, 200, 'Login failed');
  console.log('   ✓ Login authenticated successfully');

  // 4. Reject invalid credentials
  console.log('4. Testing Invalid Password Rejection...');
  const badLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ usernameOrEmail: testUser.username, password: 'wrongpassword' })
  });
  assert.strictEqual(badLogin.status, 401, 'Invalid password should be rejected with 401');
  console.log('   ✓ Invalid credentials rejected');

  // 5. Restore session
  console.log('5. Testing Session Restoration (/auth/me)...');
  const meRes = await request('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.strictEqual(meRes.status, 200);
  assert.strictEqual(meRes.data.user.username, testUser.username);
  console.log('   ✓ Session verified with active token');

  // 6. Create Post
  console.log('6. Testing Post Creation in MongoDB...');
  const postRes = await request('/posts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      content: 'Excited to be on VibeWall! Building an authentic community message board with real MongoDB storage.'
    })
  });
  assert.strictEqual(postRes.status, 201, `Create post failed: ${JSON.stringify(postRes.data)}`);
  const post = postRes.data.post;
  console.log(`   ✓ Post published to MongoDB (ID: ${post._id})`);

  // 7. Toggle Reaction
  console.log('7. Testing Emotional Vibes Reactions...');
  const reactRes = await request(`/posts/${post._id}/react`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ type: 'inspired' })
  });
  assert.strictEqual(reactRes.status, 200);
  assert.strictEqual(reactRes.data.userReaction, 'inspired');
  assert.strictEqual(reactRes.data.reactionCounts.inspired, 1);
  console.log('   ✓ Reaction "inspired" recorded and count incremented');

  // 8. Add Comment
  console.log('8. Testing Comments Submission...');
  const commentRes = await request(`/posts/${post._id}/comments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content: 'Welcome to the platform, Maya!' })
  });
  assert.strictEqual(commentRes.status, 201);
  assert.strictEqual(commentRes.data.commentsCount, 1);
  console.log('   ✓ Real comment created and commentsCount updated to 1');

  // 9. Bookmark post
  console.log('9. Testing Private Bookmarks...');
  const bmRes = await request(`/posts/${post._id}/bookmark`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.strictEqual(bmRes.status, 200);
  assert.strictEqual(bmRes.data.isBookmarked, true);

  const myBmRes = await request('/bookmarks', {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.strictEqual(myBmRes.status, 200);
  assert.strictEqual(myBmRes.data.posts.length, 1);
  console.log('   ✓ Post bookmarked and verified in private collection');

  // 10. Vibe Circles: browse and join
  console.log('10. Testing Vibe Circles...');
  const circlesRes = await request('/circles', {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.strictEqual(circlesRes.status, 200);
  assert(circlesRes.data.circles.length > 0, 'No circles returned');
  const targetCircle = circlesRes.data.circles[0];

  const joinRes = await request(`/circles/${targetCircle._id}/join`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.strictEqual(joinRes.status, 200);
  assert.strictEqual(joinRes.data.isMember, true);
  console.log(`   ✓ Successfully joined circle "${targetCircle.name}"`);

  // 11. Daily Spark
  console.log('11. Testing Daily Spark Challenge...');
  const sparkRes = await request('/challenges/today', {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.strictEqual(sparkRes.status, 200);
  assert(sparkRes.data.challenge.title, 'No challenge title');
  console.log(`   ✓ Retrieved Daily Spark: "${sparkRes.data.challenge.title}"`);

  // 12. Search
  console.log('12. Testing Global Database Search...');
  const searchRes = await request(`/search?q=${encodeURIComponent(testUser.fullName)}`);
  assert.strictEqual(searchRes.status, 200);
  assert(searchRes.data.users.length > 0, 'User not found in search');
  console.log(`   ✓ Found ${searchRes.data.users.length} user matching query "${testUser.fullName}"`);

  // 13. Update Profile
  console.log('13. Testing Profile & Settings Update...');
  const profileRes = await request('/users/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      fullName: 'Maya Lin',
      bio: 'Visual artist & developer building thoughtful web spaces.',
      interests: ['Design', 'Code', 'Ambient Music']
    })
  });
  assert.strictEqual(profileRes.status, 200);
  assert.strictEqual(profileRes.data.user.bio, 'Visual artist & developer building thoughtful web spaces.');
  console.log('   ✓ Profile bio and interests updated in MongoDB');

  // 14. Verify Profile by username
  console.log('14. Testing Public Profile View...');
  const pubRes = await request(`/users/${testUser.username}`);
  assert.strictEqual(pubRes.status, 200);
  assert.strictEqual(pubRes.data.profile.postCount, 1);
  assert.strictEqual(pubRes.data.profile.circleCount, 1);
  console.log(`   ✓ Verified public profile with postCount: ${pubRes.data.profile.postCount}, circleCount: ${pubRes.data.profile.circleCount}`);

  console.log('\n======================================================');
  console.log('🎉 ALL 14 E2E USER JOURNEY TESTS PASSED AGAINST LIVE SERVER!');
  console.log('======================================================\n');
}

runE2EJourney().catch((err) => {
  console.error('\n❌ E2E Journey Failed:', err);
  process.exit(1);
});
