import { Notification } from '../models/Notification.js';

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    return res.json({ notifications });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load notifications' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, readAt: null },
      { readAt: new Date() }
    );
    return res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update notifications' });
  }
};
