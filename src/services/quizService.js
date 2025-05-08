
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

    for (const answer of answers) {
        const { quiz_id, selected_option_id } = answer;
        const optionRes = await db.query('SELECT is_correct FROM quiz_options WHERE id = $1', [selected_option_id]);
        const isCorrect = optionRes.rows[0]?.is_correct || false;

        await db.query(
            `INSERT INTO user_quiz_answers (user_id, quiz_id, selected_option_id, is_correct)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, quiz_id) DO UPDATE SET selected_option_id = $3, is_correct = $4`,
            [userId, quiz_id, selected_option_id, isCorrect]
        );

        if (isCorrect) correctCount++;
    }

    const totalQuizzesRes = await db.query(
        'SELECT COUNT(*) FROM quizzes WHERE lesson_id = $1',
        [lessonId]
    );
    const totalQuizzes = parseInt(totalQuizzesRes.rows[0].count);

    if (correctCount === totalQuizzes) {
        await db.query(
            `INSERT INTO user_lesson_progress (user_id, lesson_id, is_completed, completed_at)
             VALUES ($1, $2, TRUE, NOW())
             ON CONFLICT (user_id, lesson_id) DO UPDATE SET is_completed = TRUE, completed_at = NOW()`,
            [userId, lessonId]
        );
    }

    return { message: 'Batch answers submitted', correctAnswers: correctCount, totalQuizzes };
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