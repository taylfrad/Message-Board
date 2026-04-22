// scripts/seed.js
//
// Wipes the app's collections and inserts a realistic demo dataset —
// students and a prof having normal class/project conversations.
//
// Usage:  npm run seed
//         (reads MONGODB_URI from .env)
//
// Touches only users / topics / messages / notifications / sessions in the
// database MONGODB_URI points at; other collections on the same cluster are
// left alone.

require('dotenv').config();

const DatabaseConnection = require('../config/db');
const User = require('../models/User');
const Topic = require('../models/Topic');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

const PASSWORD = 'testpass123';

const USERS = [
  { username: 'taylor',     email: 'taylor@example.com' },
  { username: 'alexriv',    email: 'alex@example.com' },
  { username: 'jordan_k',   email: 'jordan@example.com' },
  { username: 'morgan',     email: 'morgan@example.com' },
  { username: 'riley_b',    email: 'riley@example.com' },
  { username: 'drmartinez', email: 'martinez@example.com' },
];

const TOPICS = [
  {
    title: 'Midterm study group — Tuesday 7pm',
    author: 'taylor',
    body: "I'm grabbing a table at the library Tuesday evening. Covering chapters 9–12. I've got last semester's practice exam if we want to work through it. Anyone want in?",
    subscribers: ['alexriv', 'jordan_k', 'morgan'],
    messages: [
      { author: 'alexriv',  text: "I'm in. Meet at the main entrance first?" },
      { author: 'jordan_k', text: "Can we make it 7:30? I work till 6:45." },
      { author: 'taylor',   text: "7:30 works. @alex yeah let's meet at the doors." },
      { author: 'morgan',   text: "I'll be there, might be a few minutes late. Starving after class." },
      { author: 'alexriv',  text: "Bring the practice exam printed if you can — my laptop battery is toast." },
    ],
  },
  {
    title: 'Observer vs pub/sub — are they actually different?',
    author: 'alexriv',
    body: "Going in circles on this for the final. The pattern book calls it Observer but every Node tutorial calls it event emitter or pub/sub. Same thing or am I missing a distinction?",
    subscribers: ['taylor', 'jordan_k', 'drmartinez'],
    messages: [
      { author: 'drmartinez', text: "Close cousins but not identical. Observer is a direct 1:N relationship where the subject holds references to its observers. Pub/sub adds a broker in the middle that decouples publisher from subscriber. For the project scope you can treat them interchangeably." },
      { author: 'taylor',     text: "That helps, thanks. My Subject class holds an array of Observers directly — straight Observer then." },
      { author: 'jordan_k',   text: "Does it matter what we call it in the writeup? I'm going with Observer." },
      { author: 'drmartinez', text: "Observer is fine, just be consistent and explain the roles (Subject, Observer, ConcreteSubject, ConcreteObserver)." },
    ],
  },
  {
    title: 'Atlas connection dropping every few minutes?',
    author: 'morgan',
    body: "Every 3–4 minutes my dev server loses its Atlas connection and I have to restart. Using mongoose 9 against the class cluster. Is it just me?",
    subscribers: ['taylor', 'alexriv', 'riley_b'],
    messages: [
      { author: 'riley_b', text: "Same here. I moved to a personal cluster yesterday and it stopped. Pretty sure the class sandbox has a low connection ceiling." },
      { author: 'taylor',  text: "Had the exact same thing. Bumping mongoose's maxPoolSize helped a little, but the real fix is your own cluster." },
      { author: 'morgan',  text: "OK, spinning up a free tier under my account. Thanks for the sanity check." },
    ],
  },
  {
    title: 'Best VS Code extensions for Node/Express?',
    author: 'jordan_k',
    body: "Setting up a clean workspace for the final project. What's on your must-install list beyond ESLint + Prettier? Happy to hear anything useful.",
    subscribers: ['alexriv', 'morgan'],
    messages: [
      { author: 'alexriv', text: "Error Lens is a game changer — inline squigglies with the actual message. Also Thunder Client so you don't have to tab-switch to Postman every request." },
      { author: 'morgan',  text: "+1 Error Lens. Add the MongoDB extension if you're on Atlas — lets you query the DB straight from the sidebar." },
      { author: 'jordan_k', text: "Installing both, thanks. Any opinions on the Prettier + ESLint conflict warnings? Mine fight every save." },
      { author: 'alexriv', text: "`eslint-config-prettier` at the end of your extends — disables every ESLint rule that overlaps with Prettier. Quiet save forever after." },
    ],
  },
  {
    title: 'Post-midterm hangout at Mike’s — Friday 8pm',
    author: 'riley_b',
    body: "Midterm’s done, we all survived. Mike's patio is open late. Friday 8. Bringing a Switch if anyone wants Mario Kart after.",
    subscribers: ['taylor', 'alexriv', 'jordan_k', 'morgan'],
    messages: [
      { author: 'taylor',   text: "Count me in." },
      { author: 'alexriv',  text: "I'll be there. MK for blood." },
      { author: 'jordan_k', text: "Can't do 8 — work till 9. Could swing by around 9:15 if you're still around." },
      { author: 'riley_b',  text: "@jordan yeah we'll be there a while, stop by." },
      { author: 'morgan',   text: "Bringing a friend from the other section if that's cool." },
      { author: 'riley_b',  text: "Of course, the more the merrier." },
    ],
  },
  {
    title: 'Deep-focus playlist suggestions?',
    author: 'taylor',
    body: "Hitting a wall on this project. What do y'all put on when you need to lock in? Lo-fi's fine but I've heard it a million times.",
    subscribers: ['morgan', 'riley_b'],
    messages: [
      { author: 'morgan', text: "The Drive OST from Kavinsky. Dark synthwave, no vocals, pure vibes. I loop it." },
      { author: 'riley_b', text: "Max Richter — Sleep. Way calmer than the name suggests. Also Nils Frahm if you want piano." },
      { author: 'taylor',  text: "Added both, thanks. Sleep is unreal, 8 hours of it is wild." },
    ],
  },
  {
    title: 'Final project topic brainstorm',
    author: 'drmartinez',
    body: "A place to bounce final project ideas off each other. I'm not grading anything said here — just want folks talking. Reminder: three design patterns required, clearly documented.",
    subscribers: ['taylor', 'alexriv', 'jordan_k', 'morgan', 'riley_b'],
    messages: [
      { author: 'taylor',     text: "Thinking a message board (meta, I know). MVC, Singleton, Observer." },
      { author: 'jordan_k',   text: "Habit tracker — Factory for different habit types, Singleton for the DB, Observer for daily reminders. Too close to Taylor's?" },
      { author: 'drmartinez', text: "@jordan different domain, different patterns — go for it. Requirement is pattern implementation, not topic uniqueness." },
      { author: 'alexriv',    text: "Recipe sharing app. Strategy for different meal-planning algorithms, Singleton, Observer on favorites." },
      { author: 'riley_b',    text: "Expense tracker. Decorator for recurring-vs-one-off expenses, Singleton, Observer on budget alerts." },
      { author: 'morgan',     text: "Weather dashboard pulling multiple APIs. Adapter pattern for the APIs, Singleton for config, Observer for alerts." },
      { author: 'drmartinez', text: "Good variety. One tip: start the pattern code first and build features around it. Much easier than retrofitting patterns into finished code." },
    ],
  },
  {
    title: 'Render free tier cold starts — workarounds?',
    author: 'jordan_k',
    body: "Deployed to Render free tier and the first request after idle takes like 20s. Fine for a demo but painful while testing. Anyone use a keep-alive?",
    subscribers: ['taylor', 'morgan'],
    messages: [
      { author: 'taylor', text: "UptimeRobot at a 5-minute interval keeps mine warm. Free plan is enough." },
      { author: 'morgan', text: "Cron-job.org if you don't want another account. Same idea." },
    ],
  },
];

function msgStatus(s) { process.stdout.write(`\n▸ ${s}`); }

async function main() {
  const db = DatabaseConnection.getInstance();
  await db.connect();
  const dbName = db.connection.name;
  console.log(`connected to database: ${dbName}`);

  msgStatus('clearing collections');
  const results = await Promise.all([
    User.deleteMany({}),
    Topic.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({}),
    db.connection.db.collection('sessions').deleteMany({}).catch(() => ({ deletedCount: 0 })),
  ]);
  console.log(
    `\n  users: ${results[0].deletedCount}, topics: ${results[1].deletedCount}, ` +
    `messages: ${results[2].deletedCount}, notifications: ${results[3].deletedCount}, ` +
    `sessions: ${results[4].deletedCount}`
  );

  msgStatus('creating users');
  const usersByName = {};
  for (const u of USERS) {
    const user = new User({ username: u.username, email: u.email, password: PASSWORD });
    await user.save();
    usersByName[u.username] = user;
  }
  console.log(`\n  ${Object.keys(usersByName).length} users (password: ${PASSWORD})`);

  msgStatus('creating topics');
  const topicsByTitle = {};
  for (const t of TOPICS) {
    const author = usersByName[t.author];
    if (!author) throw new Error(`unknown author: ${t.author}`);
    const subscriberIds = [author._id];
    for (const s of t.subscribers) {
      if (s === t.author) continue;
      const subUser = usersByName[s];
      if (!subUser) throw new Error(`unknown subscriber: ${s}`);
      subscriberIds.push(subUser._id);
    }
    const topic = await Topic.create({
      title: t.title,
      body: t.body,
      author: author._id,
      subscribers: subscriberIds,
    });
    topicsByTitle[t.title] = topic;
  }
  console.log(`\n  ${Object.keys(topicsByTitle).length} topics`);

  msgStatus('inserting messages (realistic timestamps) + observer-style notifications');
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  let msgCount = 0;
  let notifCount = 0;

  // Iterate topics in reverse so the LAST-created topic holds the MOST RECENT
  // messages overall — makes the dashboard "Subscribed" preview feel live.
  for (let ti = TOPICS.length - 1; ti >= 0; ti--) {
    const t = TOPICS[ti];
    const topic = topicsByTitle[t.title];
    const n = t.messages.length;
    if (n === 0) continue;

    // Give each topic a conversation window ending roughly 2h to 6 days ago.
    const conversationEnd = now - (0.08 + Math.random() * 5.8) * DAY;
    const conversationSpan = (0.4 + Math.random() * 1.8) * DAY;

    for (let i = 0; i < n; i++) {
      const m = t.messages[i];
      const author = usersByName[m.author];
      const frac = n === 1 ? 0.5 : i / (n - 1);
      const jitter = (Math.random() - 0.5) * 20 * 60 * 1000; // ±10min
      const ts = new Date(conversationEnd - conversationSpan + frac * conversationSpan + jitter);

      const msg = new Message({ topic: topic._id, author: author._id, text: m.text });
      msg.createdAt = ts;
      msg.updatedAt = ts;
      await msg.save({ timestamps: false });
      msgCount++;

      // Hand-built notifications (matches what the Observer pattern would
      // produce at runtime), with timestamps tied to the message for realism.
      for (const subId of topic.subscribers) {
        if (String(subId) === String(author._id)) continue;
        const notif = new Notification({
          user: subId,
          topic: topic._id,
          message: msg._id,
          text: 'New post in a topic you follow',
          read: Math.random() < 0.55, // ~45% unread
        });
        notif.createdAt = ts;
        notif.updatedAt = ts;
        await notif.save({ timestamps: false });
        notifCount++;
      }
    }
  }
  console.log(`\n  ${msgCount} messages, ${notifCount} notifications`);

  msgStatus('seeding varied access counts for /stats');
  const topicDocs = await Topic.find({});
  const accessRanges = [112, 84, 67, 58, 41, 34, 22, 9];
  for (let i = 0; i < topicDocs.length; i++) {
    const base = accessRanges[i] ?? 20;
    const jitter = Math.floor(Math.random() * 15) - 7;
    await Topic.updateOne(
      { _id: topicDocs[i]._id },
      { $set: { accessCount: Math.max(0, base + jitter) } }
    );
  }
  console.log(`\n  ${topicDocs.length} topics given access counts`);

  console.log('\n✓ seed complete');
  console.log('\nlog in with any of these accounts (password: ' + PASSWORD + ')');
  for (const u of USERS) {
    console.log(`  ${u.username.padEnd(12)}  ${u.email}`);
  }

  await db.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('\nseed failed:', err);
  process.exit(1);
});
