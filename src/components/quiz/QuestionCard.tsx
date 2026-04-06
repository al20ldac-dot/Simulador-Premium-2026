
"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuiz } from './QuizProvider';
import { CheckCircle2, XCircle, ArrowRight, BookOpen, Info, Terminal, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function QuestionCard() {
  const { state, submitAnswer, lastFeedback, nextQuestion } = useQuiz();
  const currentQuestion = state.questions[state.currentQuestionIndex];

  if (!currentQuestion) return null;

  const handleOptionSelect = (key: 'A' | 'B' | 'C' | 'D') => {
    if (lastFeedback?.isFinished) return;
    submitAnswer(key);
  };


  const availableOptions = (Object.entries(currentQuestion.opciones) as [('A' | 'B' | 'C' | 'D'), string][])
    .filter(([_, value]) => value && value.trim() !== "" && value !== "N/A");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 animate-fade-in items-start w-full">
      {/* Sidebar de Posición y Metadata */}
      <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24 hidden lg:block">
        <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-[#0a0f1e] text-white p-8">
          <div className="space-y-10">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex items-center justify-center gap-2 text-primary w-full">
                <ChevronRight className="w-3.5 h-3.5 text-primary stroke-[3px]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Posición</span>
              </div>
              <h3 className="text-3xl md:text-5xl font-black tracking-tighter italic leading-none w-full">
                #{state.currentQuestionIndex + 1}
              </h3>
              <div className="flex justify-center w-full">
                <Badge className="bg-primary/20 text-primary border-none font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-full">
                  {currentQuestion.categoria}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2 pt-4 border-t border-white/5">
              <div className="p-3 md:p-4 bg-white/5 rounded-xl border border-white/10 shadow-inner group flex flex-col items-center text-center">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-slate-400 transition-colors">Valor</p>
                <p className="font-black text-2xl leading-none tabular-nums text-white">1.00</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="p-7 bg-white rounded-[2rem] border border-slate-100 shadow-sm academic-shadow text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-center gap-3">
            <Info className="w-4 h-4 text-primary" /> Tip Académico
          </p>
          <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
            {currentQuestion.code 
              ? "Analiza la sintaxis y el flujo de ejecución cuidadosamente antes de responder." 
              : "Busca palabras clave técnicas en el enunciado para descartar distractores."}
          </p>
        </div>
      </div>

      {/* Contenedor de Pregunta Principal */}
      <div className="lg:col-span-9">
        <Card className="border-none shadow-2xl bg-white rounded-[1.5rem] md:rounded-[3rem] overflow-hidden flex flex-col academic-shadow transition-all">
          {/* HUD Compacto Exclusivo Móvil */}
          <div className="lg:hidden bg-[#0a0f1e] text-white p-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="font-black text-xl italic tracking-tighter text-primary">#{state.currentQuestionIndex + 1}</span>
              <div className="h-4 w-[1px] bg-white/20" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 truncate max-w-[120px]">
                {currentQuestion.categoria}
              </span>
            </div>
          </div>

          <div className="bg-slate-50/50 p-6 md:p-12 border-b border-slate-100 space-y-6">
            <h2 className="text-base md:text-xl lg:text-2xl font-bold leading-relaxed text-slate-900 tracking-tight whitespace-pre-line">
              {currentQuestion.pregunta}
            </h2>

            {/* Soporte para Imágenes (Diagramas, capturas, etc) */}
            {currentQuestion.imageUrl && (
              <div className="relative w-full aspect-video rounded-[1.5rem] overflow-hidden border-4 border-white shadow-lg">
                <Image 
                  src={currentQuestion.imageUrl} 
                  alt="Imagen de referencia" 
                  fill 
                  className="object-contain bg-slate-100"
                  unoptimized
                />
              </div>
            )}

            {/* Renderizado de Bloques de Código Profesional */}
            {currentQuestion.code && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[1.2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-[#0d1117] rounded-[1rem] p-6 md:p-8 font-mono text-sm md:text-lg overflow-x-auto shadow-inner border border-slate-800">
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-2">Snippet de Código</span>
                  </div>
                  <pre className="text-slate-300 leading-relaxed">
                    <code>{currentQuestion.code}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>

          <CardContent className="p-6 md:p-16 space-y-8 md:space-y-10">
            <div className="grid gap-4 md:gap-5">
              {availableOptions.map(([key, value]) => {
                const isCorrectAnswer = key === currentQuestion.correcta;
                const isSelectedByFeedback = lastFeedback?.selectedKey === key;
                const showFinalResults = lastFeedback?.showCorrect;
                
                return (
                  <button
                    key={key}
                    disabled={lastFeedback?.isFinished}
                    onClick={() => handleOptionSelect(key)}
                    className={cn(
                      "flex items-center w-full p-4 md:p-6 rounded-[1.2rem] md:rounded-[1.5rem] border-2 text-left transition-all group relative overflow-hidden",
                      !lastFeedback?.isFinished && "hover:border-primary hover:bg-primary/5 border-slate-100 bg-white shadow-sm",
                      showFinalResults && isCorrectAnswer && "border-green-500 bg-green-50 shadow-md",
                      showFinalResults && !isCorrectAnswer && isSelectedByFeedback && "border-red-500 bg-red-50",
                      showFinalResults && !isCorrectAnswer && !isSelectedByFeedback && "opacity-40 grayscale scale-[0.98]",
                      !showFinalResults && isSelectedByFeedback && !lastFeedback?.isCorrect && "border-red-400 bg-red-50"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 md:w-11 md:h-11 flex items-center justify-center rounded-md md:rounded-xl font-black text-[10px] md:text-base mr-3 md:mr-6 shrink-0 shadow-sm transition-all",
                      !showFinalResults && "bg-slate-100 text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:scale-105",
                      showFinalResults && isCorrectAnswer && "bg-green-500 text-white scale-105",
                      showFinalResults && !isCorrectAnswer && isSelectedByFeedback && "bg-red-500 text-white",
                      showFinalResults && !isCorrectAnswer && !isSelectedByFeedback && "bg-slate-100 text-slate-300"
                    )}>
                      {key}
                    </div>
                    <span className="text-sm md:text-lg font-semibold flex-1 leading-snug text-slate-700 break-words whitespace-pre-line pr-2">
                      {value}
                    </span>
                  </button>
                );
              })}
            </div>

            {lastFeedback && (
              <div className={cn(
                "mt-6 md:mt-10 p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border-2 shadow-2xl animate-fade-in relative overflow-hidden",
                lastFeedback.isCorrect ? "bg-green-50/90 border-green-200" : "bg-red-50/90 border-red-200"
              )}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-current opacity-[0.03] blur-[100px] -mr-32 -mt-32" />
                
                <div className="space-y-8 md:space-y-12 relative z-10">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className={cn(
                      "p-3 md:p-4 rounded-2xl md:rounded-[1.5rem] shadow-xl",
                      lastFeedback.isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    )}>
                      {lastFeedback.isCorrect ? <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" /> : <XCircle className="w-6 h-6 md:w-8 md:h-8" />}
                    </div>
                    <div>
                      <h4 className={cn(
                        "font-black text-lg md:text-2xl uppercase tracking-tighter leading-none",
                        lastFeedback.isCorrect ? "text-green-900" : "text-red-900"
                      )}>
                        {lastFeedback.isCorrect ? 'Validación Exitosa' : 'Incorrecto'}
                      </h4>
                    </div>
                  </div>
                  
                  {lastFeedback.isFinished && (
                    <div className="space-y-8 md:space-y-12 pt-8 md:pt-12 border-t border-slate-200/50">
                      <div className="space-y-4 md:space-y-6">
                        <p className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 md:gap-4">
                          <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-primary" /> Justificación Técnica
                        </p>
                        <div className="bg-white/95 p-5 md:p-8 rounded-[1rem] md:rounded-[2rem] border border-white shadow-sm italic text-slate-700 text-sm md:text-xl leading-relaxed font-medium whitespace-pre-line">
                          "{currentQuestion.justificacion}"
                        </div>
                      </div>

                      {currentQuestion.explicacionError && (
                        <div className="space-y-4 md:space-y-6">
                          <p className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 md:gap-4">
                            <Terminal className="w-5 h-5 md:w-6 md:h-6 text-slate-400" /> Análisis de Distractores
                          </p>
                          <div className="bg-slate-50/80 p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 text-slate-600 text-sm md:text-lg leading-relaxed font-medium">
                            {currentQuestion.explicacionError}
                          </div>
                        </div>
                      )}

                      <Button 
                        onClick={nextQuestion} 
                        size="lg" 
                        className="w-full h-12 md:h-16 text-sm md:text-xl font-black rounded-xl md:rounded-2xl bg-primary shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 gap-3 uppercase"
                      >
                        Continuar <ArrowRight className="w-5 h-5 md:w-7 md:h-7" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
