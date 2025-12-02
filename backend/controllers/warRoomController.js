const WarRoom = require('../models/WarRoom');

// Create new war room
exports.createWarRoom = async (req, res) => {
  try {
    // Validate required fields
    const { title, startupName, situation, description, urgencyLevel, scheduledTime } = req.body;
    
    if (!title || !startupName || !situation || !description || !scheduledTime) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, startupName, situation, description, and scheduledTime are required' 
      });
    }

    if (description.length < 100) {
      return res.status(400).json({ 
        message: 'Description must be at least 100 characters long' 
      });
    }

    const scheduled = new Date(scheduledTime);
    if (isNaN(scheduled.getTime())) {
      return res.status(400).json({ message: 'Invalid scheduled time format' });
    }

    const warRoom = new WarRoom({
      ...req.body,
      host: req.user._id,
      participants: [{
        user: req.user._id,
        role: 'Founder'
      }]
    });

    await warRoom.save();
    await warRoom.populate('host', 'name avatar company');
    
    res.status(201).json(warRoom);
  } catch (error) {
    console.error('Create war room error:', error);
    res.status(400).json({ message: error.message || 'Failed to create war room' });
  }
};

// Get all war rooms
exports.getWarRooms = async (req, res) => {
  try {
    const {
      status = 'Active',
      situation,
      isLive,
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (situation) filter.situation = situation;
    if (isLive !== undefined) filter.isLive = isLive === 'true';

    const warRooms = await WarRoom.find(filter)
      .populate('host', 'name avatar company title')
      .populate('participants.user', 'name avatar')
      .sort({ scheduledTime: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await WarRoom.countDocuments(filter);

    res.json({
      warRooms,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalWarRooms: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single war room
exports.getWarRoomById = async (req, res) => {
  try {
    const warRoom = await WarRoom.findById(req.params.id)
      .populate('host', 'name avatar bio company title')
      .populate('participants.user', 'name avatar title company')
      .populate('messages.user', 'name avatar')
      .populate('actionItems.assignedTo', 'name avatar')
      .populate('actionItems.createdBy', 'name avatar')
      .populate('mentorNotes.mentor', 'name avatar');

    if (!warRoom) {
      return res.status(404).json({ message: 'War room not found' });
    }

    // Check if user is participant or if room is public
    const isParticipant = warRoom.participants.some(
      p => p.user._id.toString() === req.user._id.toString()
    );

    if (warRoom.isPrivate && !isParticipant && warRoom.host._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This war room is private' });
    }

    res.json(warRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join war room
exports.joinWarRoom = async (req, res) => {
  try {
    const warRoom = await WarRoom.findById(req.params.id);

    if (!warRoom) {
      return res.status(404).json({ message: 'War room not found' });
    }

    // Check if war room is private
    if (warRoom.isPrivate && warRoom.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This war room is private' });
    }

    // Allow joining even if not live, for scheduled rooms
    // if (!warRoom.isLive) {
    //   return res.status(400).json({ message: 'This war room is not live yet' });
    // }

    const isAlreadyParticipant = warRoom.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (isAlreadyParticipant) {
      return res.status(400).json({ message: 'You are already a participant in this war room' });
    }

    if (warRoom.participants.length >= warRoom.maxParticipants) {
      return res.status(400).json({ message: 'War room has reached maximum capacity' });
    }

    // Validate role
    const validRoles = ['Mentor', 'Investor', 'Founder', 'Expert', 'Supporter'];
    const role = req.body.role || 'Supporter';
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    warRoom.participants.push({
      user: req.user._id,
      role: role
    });

    await warRoom.save();
    await warRoom.populate('participants.user', 'name avatar title company');

    res.json(warRoom.participants[warRoom.participants.length - 1]);
  } catch (error) {
    console.error('Join war room error:', error);
    res.status(400).json({ message: error.message || 'Failed to join war room' });
  }
};

// Send message in war room
exports.sendMessage = async (req, res) => {
  try {
    const warRoom = await WarRoom.findById(req.params.id);

    if (!warRoom) {
      return res.status(404).json({ message: 'War room not found' });
    }

    const isParticipant = warRoom.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!isParticipant && warRoom.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You must join the war room first' });
    }

    // Validate message text
    if (!req.body.text || req.body.text.trim().length === 0) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    if (req.body.text.length > 2000) {
      return res.status(400).json({ message: 'Message is too long (max 2000 characters)' });
    }

    // Validate message type
    const validTypes = ['chat', 'advice', 'question', 'resource', 'action'];
    const messageType = req.body.type || 'chat';
    
    if (!validTypes.includes(messageType)) {
      return res.status(400).json({ message: 'Invalid message type' });
    }

    warRoom.messages.push({
      user: req.user._id,
      text: req.body.text.trim(),
      type: messageType
    });

    await warRoom.save();
    await warRoom.populate('messages.user', 'name avatar');

    res.status(201).json(warRoom.messages[warRoom.messages.length - 1]);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(400).json({ message: error.message || 'Failed to send message' });
  }
};

// Add action item
exports.addActionItem = async (req, res) => {
  try {
    const warRoom = await WarRoom.findById(req.params.id);

    if (!warRoom) {
      return res.status(404).json({ message: 'War room not found' });
    }

    const isParticipant = warRoom.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!isParticipant && warRoom.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    warRoom.actionItems.push({
      description: req.body.description,
      assignedTo: req.body.assignedTo || req.user._id,
      createdBy: req.user._id
    });

    await warRoom.save();
    await warRoom.populate('actionItems.assignedTo actionItems.createdBy', 'name avatar');

    res.status(201).json(warRoom.actionItems[warRoom.actionItems.length - 1]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update action item status
exports.updateActionItem = async (req, res) => {
  try {
    const warRoom = await WarRoom.findById(req.params.id);

    if (!warRoom) {
      return res.status(404).json({ message: 'War room not found' });
    }

    const actionItem = warRoom.actionItems.id(req.params.actionId);
    
    if (!actionItem) {
      return res.status(404).json({ message: 'Action item not found' });
    }

    actionItem.status = req.body.status;
    await warRoom.save();

    res.json(actionItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add resource
exports.addResource = async (req, res) => {
  try {
    const warRoom = await WarRoom.findById(req.params.id);

    if (!warRoom) {
      return res.status(404).json({ message: 'War room not found' });
    }

    warRoom.resources.push({
      ...req.body,
      addedBy: req.user._id
    });

    await warRoom.save();
    res.status(201).json(warRoom.resources[warRoom.resources.length - 1]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create poll
exports.createPoll = async (req, res) => {
  try {
    const warRoom = await WarRoom.findById(req.params.id);

    if (!warRoom) {
      return res.status(404).json({ message: 'War room not found' });
    }

    if (warRoom.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the host can create polls' });
    }

    warRoom.polls.push({
      question: req.body.question,
      options: req.body.options
    });

    await warRoom.save();
    res.status(201).json(warRoom.polls[warRoom.polls.length - 1]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Vote on poll
exports.voteOnPoll = async (req, res) => {
  try {
    const warRoom = await WarRoom.findById(req.params.id);

    if (!warRoom) {
      return res.status(404).json({ message: 'War room not found' });
    }

    const poll = warRoom.polls.id(req.params.pollId);
    
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    const existingVote = poll.votes.find(
      v => v.user.toString() === req.user._id.toString()
    );

    if (existingVote) {
      existingVote.option = req.body.option;
    } else {
      poll.votes.push({
        user: req.user._id,
        option: req.body.option
      });
    }

    await warRoom.save();
    res.json(poll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// End war room
exports.endWarRoom = async (req, res) => {
  try {
    const warRoom = await WarRoom.findById(req.params.id);

    if (!warRoom) {
      return res.status(404).json({ message: 'War room not found' });
    }

    if (warRoom.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the host can end the war room' });
    }

    warRoom.isLive = false;
    warRoom.status = 'Closed';
    warRoom.endTime = new Date();
    warRoom.outcome = req.body.outcome;
    warRoom.summary = req.body.summary;

    await warRoom.save();
    res.json(warRoom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add mentor note
exports.addMentorNote = async (req, res) => {
  try {
    const warRoom = await WarRoom.findById(req.params.id);

    if (!warRoom) {
      return res.status(404).json({ message: 'War room not found' });
    }

    const participant = warRoom.participants.find(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!participant || (participant.role !== 'Mentor' && participant.role !== 'Expert')) {
      return res.status(403).json({ message: 'Only mentors can add notes' });
    }

    warRoom.mentorNotes.push({
      mentor: req.user._id,
      note: req.body.note,
      isPrivate: req.body.isPrivate || false
    });

    await warRoom.save();
    res.status(201).json(warRoom.mentorNotes[warRoom.mentorNotes.length - 1]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// React to message
exports.reactToMessage = async (req, res) => {
  try {
    const warRoom = await WarRoom.findById(req.params.id);

    if (!warRoom) {
      return res.status(404).json({ message: 'War room not found' });
    }

    const message = warRoom.messages.id(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const existingReaction = message.reactions.find(
      r => r.user.toString() === req.user._id.toString() && r.emoji === req.body.emoji
    );

    if (existingReaction) {
      message.reactions.pull(existingReaction);
    } else {
      message.reactions.push({
        user: req.user._id,
        emoji: req.body.emoji
      });
    }

    await warRoom.save();
    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
