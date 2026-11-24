import React, { useState } from 'react';
import { CONCEPT_CARDS, QUIZ_QUESTIONS } from '../data/datasets';
import { ConceptCard } from '../types';
import { 
  HelpCircle, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Sparkles, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp,
  Award
} from 'lucide-react';

export const GlossaryQuizTab: React.FC = () => {
  // Concept cards filter
  const [conceptFilter, setConceptFilter] = useState<'todos' | 'lineal' | 'logistica'>('todos');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(CONCEPT_CARDS[0].id);

  // Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const filteredCards = CONCEPT_CARDS.filter((c) => {
    if (conceptFilter === 'todos') return true;
    return c.technique === conceptFilter || c.technique === 'ambas';
  });

  const handleSelectAnswer = (questionId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setQuizSubmitted(false);
  };

  const answeredCount = Object.keys(userAnswers).length;
  const isComplete = answeredCount === QUIZ_QUESTIONS.length;
  const score = calculateScore();

  return (
    <div className="space-y-12">
      {/* SECTION 1: VISUAL GLOSSARY */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Glosario Conceptual Ilustrado</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Los Conceptos Clave Explicados con Analogías Cotidianas
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Sin fórmulas crípticas ni jerga innecesaria: lo que realmente necesitas saber para entender Machine Learning.
            </p>
          </div>

          {/* Segmented filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setConceptFilter('todos')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                conceptFilter === 'todos'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({CONCEPT_CARDS.length})
            </button>
            <button
              onClick={() => setConceptFilter('lineal')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                conceptFilter === 'lineal'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Lineal
            </button>
            <button
              onClick={() => setConceptFilter('logistica')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                conceptFilter === 'logistica'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Logística
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => {
            const isExpanded = expandedCardId === card.id;
            return (
              <div
                key={card.id}
                onClick={() => setExpandedCardId(isExpanded ? null : card.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isExpanded
                    ? 'bg-slate-900 border-cyan-500/50 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        card.technique === 'lineal'
                          ? 'text-cyan-400'
                          : card.technique === 'logistica'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {card.technique === 'lineal'
                        ? 'Regresión Lineal'
                        : card.technique === 'logistica'
                        ? 'Regresión Logística'
                        : 'Ambas Técnicas'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{card.summary}</p>

                  {isExpanded && (
                    <div className="space-y-3 pt-3 border-t border-slate-800 text-xs animate-in fade-in duration-200">
                      <p className="text-slate-300 leading-relaxed">{card.details}</p>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[11px] font-semibold text-amber-300 mb-0.5">Analogía:</div>
                          <div className="text-slate-300 text-[11px] leading-relaxed">{card.analogy}</div>
                        </div>
                      </div>

                      {card.formula && (
                        <div className="text-center bg-slate-950 py-2 px-3 rounded-lg border border-slate-800/80 font-mono text-cyan-300 text-xs">
                          {card.formula}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 mt-4 flex items-center justify-between">
                  <span>{isExpanded ? 'Clic para colapsar' : 'Clic para ver detalles y analogía'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: INTERACTIVE QUIZ */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Evaluación Rápida de Comprensión</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Quiz de Comprobación: ¿Qué tan claro te ha quedado?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              5 preguntas prácticas para comprobar tus conocimientos sobre cuándo y cómo aplicar cada técnica.
            </p>
          </div>

          {quizSubmitted ? (
            <button
              onClick={resetQuiz}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reintentar Quiz</span>
            </button>
          ) : (
            <div className="text-xs font-mono text-slate-400">
              Progreso: <span className="text-white font-bold">{answeredCount}</span> de {QUIZ_QUESTIONS.length} respondidas
            </div>
          )}
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {QUIZ_QUESTIONS.map((q, qIndex) => {
            const selectedOpt = userAnswers[q.id];
            const isAnswered = selectedOpt !== undefined;
            const isCorrect = selectedOpt === q.correctIndex;

            return (
              <div
                key={q.id}
                className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                  quizSubmitted
                    ? isCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-rose-950/20 border-rose-500/40'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    <span className="text-cyan-400 mr-2">0{qIndex + 1}.</span>
                    {q.question}
                  </h3>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0 ${
                      q.technique === 'lineal'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {q.technique === 'lineal' ? 'Lineal' : 'Logística'}
                  </span>
                </div>

                {/* Options */}
                <div className="space-y-2 mb-4">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = selectedOpt === optIndex;
                    const isRightOption = optIndex === q.correctIndex;

                    let optionStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                    if (quizSubmitted) {
                      if (isRightOption) {
                        optionStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-semibold';
                      } else if (isSelected && !isCorrect) {
                        optionStyle = 'bg-rose-950/40 border-rose-500 text-rose-200 font-semibold';
                      } else {
                        optionStyle = 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60';
                      }
                    } else if (isSelected) {
                      optionStyle = 'bg-cyan-950/40 border-cyan-500 text-white font-medium shadow-sm';
                    }

                    return (
                      <button
                        key={optIndex}
                        onClick={() => handleSelectAnswer(q.id, optIndex)}
                        disabled={quizSubmitted}
                        className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between gap-3 transition-all cursor-pointer ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full border border-current/40 flex items-center justify-center text-[10px] shrink-0 font-mono">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {quizSubmitted && isRightOption && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {quizSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation feedback upon submitting */}
                {quizSubmitted && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                      isCorrect
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold mr-1">
                        {isCorrect ? '¡Correcto!' : 'Explicación del concepto:'}
                      </span>
                      {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit or Score Summary */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          {!quizSubmitted ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400">
                {isComplete
                  ? '¡Has respondido todas las preguntas!'
                  : `Por favor responde las ${QUIZ_QUESTIONS.length - answeredCount} preguntas restantes.`}
              </span>
              <button
                onClick={() => setQuizSubmitted(true)}
                disabled={!isComplete}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isComplete
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Comprobar Mis Respuestas
              </button>
            </div>
          ) : (
            <div className="w-full bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl font-mono ${
                    score >= 4
                      ? 'bg-emerald-500 text-slate-950'
                      : score >= 3
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {score}/{QUIZ_QUESTIONS.length}
                </div>
                <div>
                  <div className="text-base font-bold text-white">
                    {score === 5
                      ? '¡Excelente! Dominas ambos conceptos'
                      : score >= 3
                      ? '¡Muy buen trabajo! Tienes las bases sólidas'
                      : '¡Buen intento! Repasa los laboratorios interactivos'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Acertaste el {((score / QUIZ_QUESTIONS.length) * 100).toFixed(0)}% de los casos prácticos.
                  </div>
                </div>
              </div>

              <button
                onClick={resetQuiz}
                className="px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Hacer el Quiz de Nuevo
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
