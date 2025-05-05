const courseService = require('../services/courseService');
const { successResponse, errorResponse } = require('../utils/response');
const uploadToS3 = require('../utils/s3Uploader'); // Assuming you have an S3 utility for file uploads
const multer = require('multer');

const createCourse = async (req, res) => {
    try {
      const { title, description, price } = req.body;
      let imageUrl = null;
  
      if (req.file) {
        imageUrl = await uploadToS3.uploadToS3(req.file, 'courses');
      }
  
      const course = await courseService.createCourse(title, description, price, imageUrl);
      res.status(201).json(course);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create course' });
    }
  };
  
  const updateCourse = async (req, res) => {
    try {
      const { title, description, price } = req.body;
      const courseId = req.params.id;
      let imageUrl = req.body.existingImageUrl || null;
  
      if (req.file) {
        imageUrl = await uploadToS3.uploadToS3(req.file, 'courses');
      }
  
      const updatedCourse = await courseService.updateCourse(courseId, title, description, price, imageUrl);
      res.status(200).json(updatedCourse);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update course' });
    }
  };

  const getCourses = async (req, res) => {
    try {
      const userId = req.user.userId;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized: Missing user info' });
      }
      const courses = await courseService.getAllCoursesWithEnrollmentStatus(userId);
      return successResponse(res, courses, 'Courses fetched');
    } catch (err) {
      console.error('❌ Error fetching courses:', err.message);
      return errorResponse(res, err.message || 'Internal server error');
    }
  };
  
  
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await courseService.getCourseById(id);
    if (!course) {
      return errorResponse(res, 'Course not found', 404);
    }
    return successResponse(res, course, 'Course fetched');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await courseService.deleteCourse(id);
    if (!course) {
      return errorResponse(res, 'Course not found', 404);
    }
    return successResponse(res, course, 'Course deleted');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

module.exports = {
  createCourse,
  getCourses,
    getCourseById,
    updateCourse,
    deleteCourse

};
