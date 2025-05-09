const Message = require('../models/message');

exports.sendMessage = async (req, res) => {
  try {
    const { teacherId, studentId, content, type } = req.body;

    // Determine sender and recipient
    let senderId, recipientId, sentBy;

    if (teacherId) {
      // Sender is a student (recipient is a teacher)
      if (!req.user.userId) throw new Error('User ID missing (not a student)');
      senderId = req.user.userId;
      recipientId = teacherId;
      sentBy = 'student';
    } else if (studentId) {
      // Sender is a teacher (recipient is a student)
      if (!req.user.teacherId) throw new Error('Teacher ID missing (not a teacher)');
      senderId = req.user.teacherId;
      recipientId = studentId;
      sentBy = 'teacher';
    } else {
      throw new Error('Either teacherId or studentId must be provided');
    }

    // Validate teacher-student relationship
    const isValid = await Message.isValidTeacherStudentRelation(
      sentBy === 'teacher' ? senderId : recipientId, // teacher_id
      sentBy === 'teacher' ? recipientId : senderId  // student_id
    );

    if (!isValid) {
      return res.status(403).json({ error: 'Invalid teacher-student relationship.' });
    }

    // Create the message
    const message = await Message.createMessage(
      sentBy === 'teacher' ? senderId : recipientId, // teacher_id
      sentBy === 'teacher' ? recipientId : senderId, // student_id
      sentBy,
      content,
      type
    );

    // Emit real-time message
    const io = req.app.get('io');
    io.to(`user_${recipientId}`).emit('new_message', message);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { teacherId, studentId } = req.query;

    // Determine teacher_id and student_id
    let teacher_id, student_id;

    if (req.user.teacherId) {
      // Request is from a teacher
      teacher_id = req.user.teacherId;
      student_id = studentId;
    } else {
      // Request is from a student
      teacher_id = teacherId;
      student_id = req.user.userId;
    }

    if (!teacher_id || !student_id) {
      throw new Error('Both teacherId and studentId must be provided');
    }

    // Fetch messages
    const messages = await Message.getMessages(teacher_id, student_id);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};