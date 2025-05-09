const AssignmentService = require('../services/assignmentService');

const getAssignedTeacher = async (req, res) => {
  try {
    const id = req.user.userId;


    const assignments = await AssignmentService.getAssignmentsForStudent(id);

    if (assignments.length === 0) {
      return res.status(404).json({ message: 'No teacher assigned yet' });
    }

    return res.status(200).json({ teacher: assignments });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAssignedStudents = async (req, res) => {
  try {
    const id = req.user.teacherId;

   

    const assignments = await AssignmentService.getAssignmentsForTeacher(id);

    if (assignments.length === 0) {
      return res.status(404).json({ message: 'No students assigned yet' });
    }

    return res.status(200).json({ students: assignments });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
    getAssignedTeacher,
    getAssignedStudents,
  };
  