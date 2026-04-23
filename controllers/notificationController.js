const Notification = require('../models/Notification');

exports.index = async (req, res) => {
  const notifications = await Notification.find({ user: req.session.userId })
    .populate('topic', 'title')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  // Bucket into Today / Yesterday / This week / Earlier so the page is
  // scanned temporally without each row having to repeat coarse context.
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 6 * 86400000;

  const today = [];
  const yesterday = [];
  const thisWeek = [];
  const earlier = [];
  for (const n of notifications) {
    const ts = new Date(n.createdAt).getTime();
    if (ts >= todayStart) today.push(n);
    else if (ts >= yesterdayStart) yesterday.push(n);
    else if (ts >= weekStart) thisWeek.push(n);
    else earlier.push(n);
  }

  const groups = [
    { label: 'Today', items: today },
    { label: 'Yesterday', items: yesterday },
    { label: 'This week', items: thisWeek },
    { label: 'Earlier', items: earlier },
  ].filter((g) => g.items.length > 0);

  const hasUnread = notifications.some((n) => !n.read);

  res.render('notifications/index', {
    title: 'Notifications',
    groups,
    hasUnread,
  });
};

exports.markRead = async (req, res) => {
  const note = await Notification.findOne({
    _id: req.params.id,
    user: req.session.userId,
  });
  if (!note) return res.redirect('/notifications');
  note.read = true;
  await note.save();
  res.redirect(`/topics/${note.topic}`);
};

exports.markAllRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.session.userId, read: false },
    { $set: { read: true } }
  );
  res.redirect('/notifications');
};
