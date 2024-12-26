const Connection = require("./connection.model");
const User = require("../user/user.model");

const createConnectionRequest = async (req, res) => {
  try {
    const { toUserId } = req.body;
    const fromUserId = req.userId;

    if (!toUserId) {
      return res.status(400).json({
        success: false,
        message: "Recipient user ID is required.",
      });
    }

    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);

    if (!fromUser || !toUser) {
      return res.status(404).json({
        success: false,
        message: "One or both users not found.",
      });
    }

    // if (fromUser.role !== "Customer") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Only customers can send connection requests.",
    //   });
    // }

    if (toUser.role !== "Member") {
      return res.status(403).json({
        success: false,
        message: "Connection requests can only be sent to members.",
      });
    }

    const existingConnection = await Connection.findOne({
      fromUser: fromUserId,
      toUser: toUserId,
    });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: "A connection request already exists between these users.",
      });
    }

    const connection = new Connection({
      fromUser: fromUserId,
      toUser: toUserId,
    });

    await connection.save();

    res.status(201).json({
      success: true,
      message: "Connection request sent successfully.",
      connection,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending connection request.",
      details: error.message,
    });
  }
};


const getAllConnectionRequests = async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const pageNumber = parseInt(page);
      const pageSize = parseInt(limit);
      const skip = (pageNumber - 1) * pageSize;
  
      let filter = {};
      if (status) {
        filter.status = status;
      }
  
      const totalConnectionsCount = await Connection.countDocuments(filter);
      const connections = await Connection.find(filter)
        .populate("fromUser", "firstName lastName email")
        .populate("toUser", "firstName lastName email")
        .skip(skip)
        .limit(pageSize);
  
      const totalPages = Math.ceil(totalConnectionsCount / pageSize);
  
      res.status(200).json({
        success: true,
        message: "Connection requests retrieved successfully.",
        connections,
        meta: {
          totalConnectionsCount,
          currentPage: pageNumber,
          totalPages,
          pageSize: connections.length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error retrieving connection requests.",
        details: error.message,
      });
    }
  };

  
  const updateConnectionStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      if (!["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Allowed values are 'Approved' or 'Rejected'.",
        });
      }
  
      const connection = await Connection.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
  
      if (!connection) {
        return res.status(404).json({
          success: false,
          message: "Connection request not found.",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Connection status updated successfully.",
        connection,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating connection status.",
        details: error.message,
      });
    }
  };

  const getConnectedUsers = async (req, res) => {
    try {
      const userId = req.userId; 
      const { page = 1, limit = 10 } = req.query;
  
      const pageNumber = parseInt(page);
      const pageSize = parseInt(limit);
      const skip = (pageNumber - 1) * pageSize;
  
      const connections = await Connection.find({
        $or: [{ fromUser: userId }, { toUser: userId }],
        status: "Approved",
      })
        .populate("fromUser", "firstName lastName email profileImage role")
        .populate("toUser", "firstName lastName email profileImage role")
        .skip(skip)
        .limit(pageSize);
  
      const connectedUsers = connections.map((connection) => {
        const isFromUser = connection.fromUser._id.toString() === userId;
        return isFromUser ? connection.toUser : connection.fromUser;
      });
  
      const totalConnectionsCount = await Connection.countDocuments({
        $or: [{ fromUser: userId }, { toUser: userId }],
        status: "Approved",
      });
  
      const totalPages = Math.ceil(totalConnectionsCount / pageSize);
  
      res.status(200).json({
        success: true,
        message: "Connected users retrieved successfully.",
        connectedUsers,
        meta: {
          totalConnectionsCount,
          currentPage: pageNumber,
          totalPages,
          pageSize: connectedUsers.length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching connected users.",
        details: error.message,
      });
    }
  };
  
  
  
module.exports = {
    createConnectionRequest,
    getAllConnectionRequests,
    updateConnectionStatus,
    getConnectedUsers
}