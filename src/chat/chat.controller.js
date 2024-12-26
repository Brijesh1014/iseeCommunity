const Message = require("./chat.model");
const mongoose = require("mongoose");
const getMessagesByReceiverId = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const messages = await Message.find({ receiverId }).sort({ timestamp: 1 });

    return res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      data: messages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Could not retrieve messages",
      error: error.message,
    });
  }
};


const deleteMessage = async(req,res)=>{
  try {
    const {id}=req.params
    const userId = req.userId
    let singleMessage = await Message.findById(id)
    if(userId !== singleMessage.senderId){
      return res.status(400).json({
        success:false,
        message:"Do not allow"
      })
    }
    singleMessage.deleteOne()

    return res.status(200).json({
      success:true,
      message:"Single message deleted successful "
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}


const deletePreviousChat = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    const messages = await Message.deleteMany({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    });


    return res.status(200).json({
      success: true,
      message: "Deleted previous chat successfully",
      data: messages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const softDeletedPreviousChat = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const userId = req.userId; 
    
    if (userId !== userId1 && userId !== userId2) {
      return res.status(400).json({
        success: false,
        message: "You are not authorized to delete this chat",
      });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    });

    if (messages.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No messages found between these users",
      });
    }

const updatedMessages = await Message.updateMany(
  {
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 },
    ],
  },
  {
    $push: {
      softDelete: {
        isDeleted: true,
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
  },
  {
    returnDocument: 'after', 
  }
);


    return res.status(200).json({
      success: true,
      message: "Previous chat marked as deleted successfully",
      data: updatedMessages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const softDeleteChat = async(req,res)=>{
  try {
    const {id}=req.params

    const userId = new mongoose.Types.ObjectId(req.userId)
    console.log('userId: ', userId);
    

    let singleMessage = await Message.findById(id);
    console.log('singleMessage: ', singleMessage);

    if (!singleMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }
    
    const isAlreadyDeleted = singleMessage?.softDelete.some(
      (entry) => entry?.userId?.equals(userId)
   
    );
    
    if (isAlreadyDeleted) {
      return res.status(403).json({
        success: false,
        message: "Already deleted",
      });
    }

    if (
      !singleMessage.senderId.equals(userId) &&
      !singleMessage.receiverId.equals(userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this chat",
      });
    }
  
    singleMessage.softDelete.push({
      isDeleted: true,
      userId: new mongoose.Types.ObjectId(userId),
    });
    await singleMessage.save();
    
    return res.status(200).json({
      success: true,
      message: "Message soft-deleted successfully",
      data: singleMessage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}







module.exports = {
  getMessagesByReceiverId,
  deletePreviousChat,
  softDeletedPreviousChat,
  deleteMessage,
  softDeleteChat,
};
