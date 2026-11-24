import React, { useState, useRef, useEffect } from 'react';
import { ActiveTab } from '../types';
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Bot,
  User,
  Sparkles,
  AlertCircle,
  Square,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface TutorChatbotProps {
  activeTab: ActiveTab;
}

const TAB_TITLES: Record<ActiveTab, string> = {
  comparativa: 'Comparativa General',
  lineal: 'Lab. Regresión Lineal',
  logistica: 'Lab. Regresión Logística',
  casos: 'Casos Reales',
  quiz: 'Glosario y Quiz',
};

const SUGGESTED_PROMPTS: Record<ActiveTab, string[]> = {
  comparativa: [
    '¿Cuál es la diferencia clave en palabras simples?',
    '¿Cómo sé rápido si necesito lineal o logística?',
    'Dame una analogía cotidiana de cada una',
  ],
  lineal: [
    '¿Qué representan la pendiente (m) y el intercepto (b)?',
    '¿Para qué sirven los residuos y el error MSE?',
    '¿Cómo interpreto el porcentaje R² de mi recta?',
  ],
  logistica: [
    '¿Por qué falla una línea recta en clasificación?',
    '¿Qué hace exactamente la curva sigmoide en S?',
    '¿Qué pasa si bajo el umbral de decisión del 50%?',
  ],
  casos: [
    '¿Por qué la depreciación del coche tiene pendiente negativa?',
    '¿Por qué el banco usa un umbral estricto (35%) para fraude?',
    '¿Cómo ayuda la regresión logística a retener clientes?',
  ],
  quiz: [
    'Explícame la diferencia entre precisión y sensibilidad',
    '¿Qué significa un falso positivo con un ejemplo?',
    'Dame un truco para no confundir MSE con sigmoide',
  ],
};

function renderInlineFormatting(text: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-800/90 border border-slate-700/80 text-cyan-300 font-mono text-[11px]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return (
        <em key={idx} className="italic text-cyan-200">
          {token.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={idx}>{token}</React.Fragment>;
  });
}

function FormattedTutorMessage({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={i} className="h-1" />;
        }
        if (/^[-*•]\s+/.test(trimmed)) {
          const content = trimmed.replace(/^[-*•]\s+/, '');
          return (
            <div key={i} className="flex items-start gap-2 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span>{renderInlineFormatting(content)}</span>
            </div>
          );
        }
        if (/^\d+\.\s+/.test(trimmed)) {
          const match = trimmed.match(/^(\d+\.)\s+(.*)$/);
          if (match) {
            return (
              <div key={i} className="flex items-start gap-2 pl-1">
                <span className="font-mono font-bold text-cyan-400 text-[11px] mt-0.5 shrink-0">
                  {match[1]}
                </span>
                <span>{renderInlineFormatting(match[2])}</span>
              </div>
            );
          }
        }
        return <p key={i}>{renderInlineFormatting(trimmed)}</p>;
      })}
    </div>
  );
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'model',
  text: '¡Hola! Soy tu **Tutor de RegresionLab**. Pregúntame cualquier duda sobre la pantalla que estás viendo: fórmulas (`y = mx + b`), la curva sigmoide, los errores o ejemplos prácticos.',
};

export const TutorChatbot: React.FC<TutorChatbotProps> = ({ activeTab }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isStreaming]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  const sendMessage = async (rawText: string, retryMode = false) => {
    const trimmed = rawText.trim();
    if (!trimmed || isStreaming) return;

    setErrorMsg(null);
    setLastFailedPrompt(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const botMsgId = `model-${Date.now() + 1}`;
    const baseMessages = retryMode ? messages : [...messages, userMsg];

    if (!retryMode) {
      setMessages([...baseMessages, { id: botMsgId, role: 'model', text: '' }]);
      setInputValue('');
    } else {
      setMessages([...baseMessages, { id: botMsgId, role: 'model', text: '' }]);
    }

    setIsStreaming(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const apiMessages = baseMessages
        .filter((m) => m.id !== 'welcome' && m.text.trim().length > 0)
        .map((m) => ({ role: m.role, text: m.text }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          activeTab,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorText = 'No se pudo conectar con el tutor.';
        try {
          const errJson = (await response.json()) as { error?: string };
          if (errJson.error) errorText = errJson.error;
        } catch {
          // ignore non-json error body
        }
        throw new Error(errorText);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('La respuesta del servidor no pudo leerse.');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const event of events) {
          const dataLine = event
            .split('\n')
            .find((line) => line.startsWith('data: '));
          if (!dataLine) continue;

          const jsonStr = dataLine.slice(6).trim();
          if (!jsonStr) continue;

          const parsed = JSON.parse(jsonStr) as {
            text?: string;
            done?: boolean;
            error?: string;
          };

          if (parsed.error) {
            throw new Error(parsed.error);
          }

          if (parsed.text) {
            accumulatedText += parsed.text;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botMsgId ? { ...m, text: accumulatedText } : m
              )
            );
          }
        }
      }

      if (!accumulatedText.trim()) {
        setMessages((prev) => prev.filter((m) => m.id !== botMsgId));
        throw new Error('El tutor devolvió una respuesta vacía. Inténtalo de nuevo.');
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        setMessages((prev) =>
          prev.filter((m) => !(m.id === botMsgId && m.text.trim() === ''))
        );
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== botMsgId));
        setErrorMsg(
          err instanceof Error
            ? err.message
            : 'Ocurrió un error al consultar al tutor.'
        );
        setLastFailedPrompt(trimmed);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    abortControllerRef.current?.abort();
  };

  const handleResetChat = () => {
    if (isStreaming) {
      abortControllerRef.current?.abort();
    }
    setMessages([WELCOME_MESSAGE]);
    setErrorMsg(null);
    setLastFailedPrompt(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const quickPrompts = SUGGESTED_PROMPTS[activeTab] || SUGGESTED_PROMPTS.comparativa;

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Abrir chat del tutor explicativo"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/25 border border-cyan-300/40 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span>Tutor Explicativo</span>
          <Sparkles className="w-3.5 h-3.5 opacity-80 shrink-0" />
        </button>
      )}

      {/* Chat Drawer / Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Tutor interactivo de Regresión Lineal y Logística"
          className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[560px] max-h-[82vh] flex flex-col bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">
                  Tutor RegresionLab
                </div>
                <div className="text-[11px] text-cyan-400/90 truncate">
                  Viendo: {TAB_TITLES[activeTab]}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleResetChat}
                title="Reiniciar conversación"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimizar chat"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isUser
                        ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-800 border border-slate-700 text-emerald-400'
                    }`}
                  >
                    {isUser ? (
                      <User className="w-3.5 h-3.5" />
                    ) : (
                      <Bot className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-[13px] ${
                      isUser
                        ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-sm'
                        : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-sm'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    ) : msg.text ? (
                      <FormattedTutorMessage text={msg.text} />
                    ) : (
                      <div className="flex items-center gap-1.5 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1.5">
                  <p>{errorMsg}</p>
                  {lastFailedPrompt && (
                    <button
                      onClick={() => sendMessage(lastFailedPrompt, true)}
                      className="text-[11px] font-semibold text-rose-300 underline hover:text-white cursor-pointer"
                    >
                      Reintentar consulta
                    </button>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Contextual Quick Prompts */}
          {messages.length <= 2 && !isStreaming && (
            <div className="px-4 pb-2 pt-1 border-t border-slate-800/60 bg-slate-950/40 shrink-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Preguntas sugeridas para esta sección
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu duda sobre el tema..."
              disabled={isStreaming}
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500/70 focus:outline-none rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 disabled:opacity-60"
            />
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStopStreaming}
                title="Detener respuesta"
                className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 transition-colors cursor-pointer shrink-0"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputValue.trim()}
                title="Enviar pregunta"
                className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      )}
    </>
  );
};
