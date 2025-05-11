
// === FILE: services/quizService.js ===
const db = require('../config/db');

exports.createQuizWithOptions = async (lessonId, question, options) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const quizResult = await client.query(
      'INSERT INTO quizzes (lesson_id, question) VALUES ($1, $2) RETURNING *',
      [lessonId, question]
    );
    const quizId = quizResult.rows[0].id;

    for (const option of options) {
      await client.query(
        'INSERT INTO quiz_options (quiz_id, option_text, is_correct) VALUES ($1, $2, $3)',
        [quizId, option.text, option.is_correct]
      );
    }

    await client.query('COMMIT');
    return { quiz: quizResult.rows[0], options };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

exports.getQuizzesWithOptions = async (lessonId) => {
  const quizzes = await db.query('SELECT * FROM quizzes WHERE lesson_id = $1', [lessonId]);

  const result = [];
  for (const quiz of quizzes.rows) {
    const options = await db.query('SELECT id, option_text FROM quiz_options WHERE quiz_id = $1', [quiz.id]);
    result.push({ ...quiz, options: options.rows });
  }

  return result;
};

exports.getUserSubmissionsForLesson = async (userId, lessonId) => {
  try {
    const submissions = await db.query(
      `SELECT 
        qs.quiz_id,
        qs.selected_option_id,
        qs.is_correct,
        qo_correct.id AS correct_option_id
      FROM quiz_submissions qs
      INNER JOIN quizzes q ON qs.quiz_id = q.id
      LEFT JOIN quiz_options qo_correct ON qo_correct.quiz_id = q.id AND qo_correct.is_correct = true
      WHERE qs.user_id = $1 AND qs.lesson_id = $2`,
      [userId, lessonId]
    );

    return submissions.rows;
  } catch (error) {
    throw error;
  }
};


exports.submitAnswer = async (userId, quizId, selectedOptionId) => {
    const optionRes = await db.query('SELECT is_correct FROM quiz_options WHERE id = $1', [selectedOptionId]);
    const isCorrect = optionRes.rows[0]?.is_correct || false;

    await db.query(
        `INSERT INTO user_quiz_answers (user_id, quiz_id, selected_option_id, is_correct)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, quiz_id) DO UPDATE SET selected_option_id = $3, is_correct = $4`,
        [userId, quizId, selectedOptionId, isCorrect]
    );

    return { message: 'Answer submitted successfully', is_correct: isCorrect };
};

exports.submitBatchAnswers = async (userId, lessonId, answers) => {
  let correctCount = 0;
  const correctAnswersMap = new Map();

  // Step 1: Get all quiz IDs from the submitted answers
  const quizIds = answers.map(answer => answer.quiz_id);

  // Step 2: Fetch all correct options for these quizzes in one query
  const correctOptionsRes = await db.query(
      'SELECT quiz_id, id as option_id FROM quiz_options WHERE quiz_id = ANY($1) AND is_correct = TRUE',
      [quizIds]
  );

  // Step 3: Populate the map with correct options for quick lookup
  correctOptionsRes.rows.forEach(row => {
      correctAnswersMap.set(row.quiz_id, row.option_id);
  });

  // Step 4: Loop through submitted answers, update the DB, and count correct answers
  const answerDetails = [];

  for (const answer of answers) {
      const { quiz_id, selected_option_id } = answer;
      const correctOptionId = correctAnswersMap.get(quiz_id) || null;
      const isCorrect = correctOptionId === selected_option_id;

      await db.query(
          `INSERT INTO user_quiz_answers (user_id, quiz_id, selected_option_id, is_correct)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id, quiz_id) DO UPDATE SET selected_option_id = $3, is_correct = $4`,
          [userId, quiz_id, selected_option_id, isCorrect]
      );

      if (isCorrect) correctCount++;

      // Add to the result list
      answerDetails.push({
          quiz_id,
          selected_option_id,
          isCorrect,
          correct_option_id: correctOptionId
      });
  }

  // Step 5: Get the total number of quizzes for this lesson
  const totalQuizzesRes = await db.query(
      'SELECT COUNT(*) FROM quizzes WHERE lesson_id = $1',
      [lessonId]
  );
  const totalQuizzes = parseInt(totalQuizzesRes.rows[0].count);

  // Step 6: Update lesson progress if all answers are correct
  if (correctCount === totalQuizzes) {
      await db.query(
          `INSERT INTO user_lesson_progress (user_id, lesson_id, is_completed, completed_at)
           VALUES ($1, $2, TRUE, NOW())
           ON CONFLICT (user_id, lesson_id) DO UPDATE SET is_completed = TRUE, completed_at = NOW()`,
          [userId, lessonId]
      );
  }

  // Step 7: Return the result with the detailed list of answers
  return {
      message: 'Batch answers submitted',
      correctAnswers: correctCount,
      totalQuizzes,
      answers: answerDetails
  };
};


exports.getQuizResultsByUserId = async (userId) => {
  const results = await db.query(
    `SELECT q.id AS quiz_id, q.question, qo.option_text, uqa.is_correct
     FROM user_quiz_answers uqa
     JOIN quiz_options qo ON uqa.selected_option_id = qo.id
     JOIN quizzes q ON uqa.quiz_id = q.id
     WHERE uqa.user_id = $1`,
    [userId]
  );

  return results.rows;
};

exports.deleteQuiz = async (quizId) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM quiz_options WHERE quiz_id = $1', [quizId]);
    await client.query('DELETE FROM quizzes WHERE id = $1', [quizId]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
exports.updateQuiz = async (quizId, question, options) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE quizzes SET question = $1 WHERE id = $2', [question, quizId]);

    // Delete existing options
    await client.query('DELETE FROM quiz_options WHERE quiz_id = $1', [quizId]);

    // Insert new options
    for (const option of options) {
      await client.query(
        'INSERT INTO quiz_options (quiz_id, option_text, is_correct) VALUES ($1, $2, $3)',
        [quizId, option.text, option.is_correct]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
