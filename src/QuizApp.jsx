import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://back-ia.vercel.app';

const QuizApp = () => {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!name || !topic) {
      alert('Por favor, ingresa tu nombre y selecciona un tema.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/questions`, { topic });
      setQuestions(res.data.questions);
      setUserAnswers(Array(res.data.questions.length).fill(''));
      setStep(1);
    } catch (err) {
      alert('No se pudieron generar las preguntas.');
    }
    setIsLoading(false);
  };

  const handleAnswer = (qIdx, answer) => {
    const updated = [...userAnswers];
    updated[qIdx] = answer;
    setUserAnswers(updated);
  };

  const handleSubmitQuiz = async () => {
    // Prepara los datos para guardar en MongoDB
    const questionsToSave = questions.map((q, idx) => ({
      question: q.question,
      correctAnswer: q.correctAnswer,
      userAnswer: userAnswers[idx],
      isCorrect: userAnswers[idx] === q.correctAnswer
    }));
    try {
      await axios.post(`${BACKEND_URL}/api/quiz-result`, {
        name,
        questions: questionsToSave
      });
      setShowResult(true);
    } catch (err) {
      alert('No se pudo guardar el resultado.');
    }
  };

  if (isLoading) return <p>Cargando...</p>;

  if (showResult) {
    const correct = questions.filter((q, idx) => userAnswers[idx] === q.correctAnswer).length;
    return (
      <div>
        <h2>¡Cuestionario terminado!</h2>
        <p>{name}, acertaste {correct} de {questions.length} preguntas.</p>
        <button onClick={() => window.location.reload()}>Volver a empezar</button>
      </div>
    );
  }

  if (step === 0) {
    return (
      <form onSubmit={handleStart}>
        <h1>Cuestionario Interactivo</h1>
        <div>
          <label>Nombre:</label>
          <input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label>Tema:</label>
          <select value={topic} onChange={e => setTopic(e.target.value)} required>
            <option value="">--Seleccionar--</option>
            <option value="Historia">Historia</option>
            <option value="Cultura">Cultura</option>
            <option value="Deporte">Deporte</option>
            <option value="Ciencia">Ciencia</option>
            <option value="Geografía">Geografía</option>
          </select>
        </div>
        <button type="submit">Comenzar</button>
      </form>
    );
  }

  return (
    <div>
      <h2>Responde las preguntas</h2>
      <form onSubmit={e => { e.preventDefault(); handleSubmitQuiz(); }}>
        {questions.map((q, idx) => (
          <div key={idx} style={{ marginBottom: 20 }}>
            <strong>{idx + 1}. {q.question}</strong>
            <div>
              {[q.correctAnswer, ...q.incorrectAnswers]
                .sort(() => Math.random() - 0.5)
                .map((ans, i) => (
                  <label key={i} style={{ display: 'block' }}>
                    <input
                      type="radio"
                      name={`q${idx}`}
                      value={ans}
                      checked={userAnswers[idx] === ans}
                      onChange={() => handleAnswer(idx, ans)}
                      required
                    />
                    {ans}
                  </label>
                ))}
            </div>
          </div>
        ))}
        <button type="submit">Enviar respuestas</button>
      </form>
    </div>
  );
};

export default QuizApp;