import React, { useState } from 'react';
import axios from 'axios';
import { FaArrowRight, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-indigo-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-6 md:p-8 transform transition-all duration-300 hover:shadow-[0_20px_50px_rgba(147,51,234,0.2)]">
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl flex items-center space-x-4 transform transition-all duration-300 hover:scale-105">
              <FaSpinner className="animate-spin text-purple-600 text-3xl" />
              <p className="text-gray-700 text-lg font-medium">Generando preguntas...</p>
            </div>
          </div>
        )}

        {showResult ? (
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              ¡Cuestionario completado!
            </h2>
            <div className="p-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl">
              <p className="text-2xl text-gray-800 mb-4">
                {name}, has acertado {questions.filter((q, idx) => userAnswers[idx] === q.correctAnswer).length} de {questions.length} preguntas.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Volver a empezar
              </button>
            </div>
          </div>
        ) : step === 0 ? (
          <form onSubmit={handleStart} className="space-y-8">
            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-12">
              Cuestionario Interactivo
            </h1>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Nombre:</label>
                <input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Ingresa tu nombre"
                  required 
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Tema:</label>
                <select 
                  value={topic} 
                  onChange={e => setTopic(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">--Seleccionar--</option>
                  <option value="Historia">Historia</option>
                  <option value="Cultura">Cultura</option>
                  <option value="Deporte">Deporte</option>
                  <option value="Ciencia">Ciencia</option>
                  <option value="Geografía">Geografía</option>
                </select>
              </div>
            </div>
            <button 
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Comenzar</span>
              <FaArrowRight />
            </button>
          </form>
        ) : (
          <form onSubmit={e => { e.preventDefault(); handleSubmitQuiz(); }} className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Responde las preguntas, {name}
            </h2>
            {questions.map((q, idx) => (
              <div key={idx} className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl space-y-4">
                <strong className="text-lg text-gray-800 block mb-4">
                  {idx + 1}. {q.question}
                </strong>
                <div className="grid gap-3">
                  {[q.correctAnswer, ...q.incorrectAnswers]
                    .sort(() => Math.random() - 0.5)
                    .map((ans, i) => (
                      <label 
                        key={i} 
                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                          ${userAnswers[idx] === ans 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-300'}`}
                      >
                        <input
                          type="radio"
                          name={`q${idx}`}
                          value={ans}
                          checked={userAnswers[idx] === ans}
                          onChange={() => handleAnswer(idx, ans)}
                          className="hidden"
                          required
                        />
                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
                          ${userAnswers[idx] === ans 
                            ? 'border-purple-500 bg-purple-500' 
                            : 'border-gray-300'}`}
                        >
                          {userAnswers[idx] === ans && <FaCheck className="text-white text-sm" />}
                        </div>
                        <span className="text-gray-700">{ans}</span>
                      </label>
                    ))}
                </div>
              </div>
            ))}
            <button 
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              Enviar respuestas
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default QuizApp;