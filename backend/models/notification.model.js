import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    //from is the user who is doing the action
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    //to is the user who is receiving the notification
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    //type is the type of the notification [follow or like]
    type: {
      type: String,
      enum: ["like", "follow"],
      required: true,
    },
    //read is the read status of the notification. Whether the user has read the notification or not.
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
