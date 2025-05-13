const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const videoCallController = require('../controllers/videoCallController');

/**
 * @swagger
 * tags:
 *   name: Video Calls
 *   description: Video conferencing endpoints
 */

/**
 * @swagger
 * /video-call/create-room:
 *   post:
 *     summary: Create a new video room
 *     tags: [Video Calls]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoRoom'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to create room
 */
router.post('/create-room', authenticate, videoCallController.createRoom);

/**
 * @swagger
 * /video-call/initiate:
 *   post:
 *     summary: Initiate a video call
 *     tags: [Video Calls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: ID of the user/teacher to call
 *               roomName:
 *                 type: string
 *                 description: Optional custom room name
 *     responses:
 *       200:
 *         description: Call initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CallInitiation'
 *       400:
 *         description: Receiver is offline
 *       404:
 *         description: Receiver not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Call initiation failed
 */
router.post('/initiate', authenticate, [
  body('receiverId').isString().trim().notEmpty(),
  body('roomName').optional().isString().trim()
], videoCallController.initiateCall);

/**
 * @swagger
 * /video-call/token:
 *   post:
 *     summary: Generate video call token
 *     tags: [Video Calls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomName
 *             properties:
 *               roomName:
 *                 type: string
 *                 description: Name of the room to join
 *     responses:
 *       200:
 *         description: Token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoToken'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Token generation failed
 */
router.post('/token', authenticate, [
  body('roomName').isString().trim().notEmpty()
], videoCallController.generateToken);

module.exports = router;