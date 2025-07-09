import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id; //get the user id from the request
    const notifications = await Notification.find({ to: userId }) //find the notifications for that one particular user
      .populate({
        path: "from", //populate the from field. Here from means the user who is sending the notification.
        select: "username profileImg", //finding its username and profileImg for frontend needs.
      });

    await Notification.updateMany({ to: userId }, { read: true }); //update the notifications to read:true and "to" is user id because we are updating the notifications for that one particular user and for that we need to know the user id so that we can go there and update the notifications.
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id; //get the user id from the request
    await Notification.deleteMany({ to: userId }); //delete all notifications for the user straightaway.
    res.status(200).json({ message: "All notifications deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
