const Message = require("../chat/chat.model");
const mongoose = require("mongoose");
const Connection = require("../connection/connection.model"); 


const handleError = (socket, errorMessage, errorCode = 500) => {
  console.error(errorMessage);
  socket.emit("error", { message: errorMessage, code: errorCode });
};

const sendResponse = (socket, event, data) => {
  socket.emit(event, data);
};

const initSocketIo = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("sendMessage", async ({ senderId, receiverId, content }) => {
      try {
        const connection = await Connection.findOne({
          fromUser: senderId,
          toUser: receiverId,
          status: "Approved",
        });

        if (!connection) {
          return handleError(socket, "Connection request is not approved.", 400);
        }

        const newMessage = new Message({ senderId, receiverId, content });
        await newMessage.save();

        const populatedMessage = await Message.findById(newMessage._id)
          .populate("senderId")
          .populate("receiverId");

        io.to(receiverId.toString()).emit("receiveMessage", populatedMessage);
        io.to(senderId.toString()).emit("receiveMessage", populatedMessage);

        console.log("Message sent successfully.");
      } catch (error) {
        handleError(socket, "Error saving message.", 500);
      }
    });

    socket.on("markMessagesAsSeen", async ({ userId, chatPartnerId }) => {
      try {
        if (!chatPartnerId) {
          return handleError(socket, "Invalid chat partner.", 400);
        }

        await Message.updateMany(
          {
            senderId: chatPartnerId,
            receiverId: userId,
            isSeen: false,
          },
          { $set: { isSeen: true } }
        );

        sendResponse(socket, "messagesSeen", {
          success: true,
          message: "Messages marked as seen",
        });
        console.log("Messages marked as seen:", { userId, chatPartnerId });
      } catch (error) {
        handleError(socket, "Error marking messages as seen.", 500);
      }
    });

    socket.on("getUnseenMessagesCount", async (userId) => {
      try {
        const userIdString = userId?.userId || userId;

        if (!mongoose.Types.ObjectId.isValid(userIdString)) {
          return handleError(socket, "Invalid userId format.", 400);
        }

        const unseenDirect = await Message.aggregate([
          {
            $match: {
              receiverId: new mongoose.Types.ObjectId(userIdString),
              isSeen: false,
            },
          },
          {
            $group: {
              _id: "$senderId",
              count: { $sum: 1 },
            },
          },
        ]);

        sendResponse(socket, "unseenMessagesCount", { unseenDirect });
      } catch (error) {
        handleError(socket, "Error retrieving unseen messages count.", 500);
      }
    });

    socket.on("getPreviousChat", async ({ userId1, userId2, currentUserId }) => {
      try {
        const messages = await Message.find({
          $or: [
            { senderId: userId1, receiverId: userId2 },
            { senderId: userId2, receiverId: userId1 },
          ],
          $nor: [
            {
              softDelete: {
                $elemMatch: {
                  userId: new mongoose.Types.ObjectId(currentUserId),
                  isDeleted: true,
                },
              },
            },
          ],
        }).sort({ timestamp: 1 });

        sendResponse(socket, "previousChat", {
          success: true,
          message: "Previous chat retrieved successfully",
          data: messages,
        });
      } catch (error) {
        handleError(socket, "Error retrieving previous chat.", 500);
      }
    });

    socket.on("getChatPartners", async (userId) => {
      try {
        const userIdString = userId?.userId || userId;
        const objectIdUserId = new mongoose.Types.ObjectId(userIdString);

        const chatPartners = await Message.aggregate([
          {
            $match: {
              $or: [
                { senderId: objectIdUserId },
                { receiverId: objectIdUserId },
              ],
            },
          },
          {
            $group: {
              _id: {
                $cond: {
                  if: { $eq: ["$senderId", objectIdUserId] },
                  then: "$receiverId",
                  else: "$senderId",
                },
              },
              lastMessage: { $last: "$content" },
              messageId: { $last: "$_id" },
              lastMessageTime: { $last: "$timestamp" },
              unseenMessages: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$receiverId", objectIdUserId] },
                        { $eq: ["$isSeen", false] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          {
            $unwind: "$userDetails",
          },
          {
            $project: {
              userId: "$_id",
              "userDetails.name": 1,
              "userDetails.profileImage": 1,
              lastMessage: 1,
              lastMessageTime: 1,
              unseenMessages: 1,
              messageId: 1,
            },
          },
          {
            $sort: { lastMessageTime: -1 },
          },
        ]);

        sendResponse(socket, "chatPartners", {
          success: true,
          message: "Chat partners retrieved successfully",
          data: chatPartners,
        });
      } catch (error) {
        handleError(socket, "Error retrieving chat partners.", 500);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("User disconnected:", socket.id, "Reason:", reason);
    });
  });
};

module.exports = initSocketIo;
