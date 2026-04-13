
"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useQuiz } from '../quiz/QuizProvider';
import { calculateLevel, getStatusFromPercentage } from '@/lib/quiz-utils';
import { Award, Target, Zap, Clock, TrendingUp, ChevronRight, GraduationCap, BarChart3 } from 'lucide-react';
import { Button } from '../ui/button';
import { StatsCharts } from './StatsCharts';
import { ErrorReview } from './ErrorReview';
import { cn } from '@/lib/utils';

export function ResultDashboard() {
  const { state, restartQuiz } = useQuiz();
  const [showHeavyComponents, setShowHeavyComponents] = React.useState(false);

  React.useEffect(() => {
    // Desacoplar la renderización de componentes pesados (gráficos y docenas de acordiones)
    // para evitar "congelar" la transición de la ruta del examen a los resultados.
    const timer = setTimeout(() => setShowHeavyComponents(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  const metrics = React.useMemo(() => {
    const uniqueResponsesMap = new Map();
    state.responses.forEach(r => uniqueResponsesMap.set(r.questionId, r));
    const uniqueResponses = Array.from(uniqueResponsesMap.values());
    
    const total = state.questions.length || 100; 
    const correct = uniqueResponses.filter(r => r.isCorrect).length;
    const percentage = Math.min(Math.round((correct / total) * 100), 100);
    const level = calculateLevel(percentage);
    const status = getStatusFromPercentage(percentage);
    
    const totalAttempts = uniqueResponses.reduce((sum, r) => sum + r.attemptsUsed, 0);
    const avgAttempts = uniqueResponses.length > 0 ? (totalAttempts / uniqueResponses.length).toFixed(1) : "0.0";
    
    const efficiency = totalAttempts > 0 ? ((correct / totalAttempts) * 100).toFixed(1) : "0.0";

    return { total, correct, percentage, level, status, avgAttempts, efficiency };
  }, [state.questions, state.responses]);

  const levelStyles = {
    'Excelente': 'text-green-600 bg-green-50 border-green-200',
    'Aprobado': 'text-blue-600 bg-blue-50 border-blue-200',
    'Regular': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'Bajo': 'text-red-600 bg-red-50 border-red-200',
  };

  return (
    <div className="space-y-8 md:space-y-16 animate-fade-in pb-32 pt-8">
      <div className="flex justify-center">
        <div className={cn(
          "w-full max-w-lg bg-white rounded-[2rem] md:rounded-[2.5rem] border-2 p-6 md:p-12 text-center shadow-2xl relative overflow-hidden transition-all duration-1000",
          status === 'APROBADO' ? "border-green-100 ring-8 ring-green-50/50" : "border-red-100 ring-8 ring-red-50/50"
        )}>
          <div className={cn(
            "w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl mx-auto flex items-center justify-center mb-6 md:mb-8 shadow-xl",
            metrics.status === 'APROBADO' ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
          )}>
            <Award className="w-8 h-8 md:w-12 md:h-12" />
          </div>
          
          <div className="space-y-3">
            <h1 className={cn(
              "text-3xl md:text-6xl font-black tracking-tight uppercase",
              metrics.status === 'APROBADO' ? "text-slate-900" : "text-slate-900"
            )}>{metrics.status}</h1>
            <p className="text-slate-400 font-bold tracking-[0.2em] text-[10px] md:text-sm uppercase">Resultado Oficial Simulador</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <StatCard 
          icon={<Target className="w-4 h-4" />} 
          label="Puntaje Total" 
          value={`${metrics.correct} / ${metrics.total}`} 
          sub="Preguntas acertadas"
        />
        <StatCard 
          icon={<Zap className="w-4 h-4" />} 
          label="Calificación" 
          value={`${metrics.percentage}%`} 
          badge={metrics.level}
          badgeStyle={levelStyles[metrics.level as keyof typeof levelStyles]}
        />
        <StatCard 
          icon={<Clock className="w-4 h-4" />} 
          label="Prom. Intentos" 
          value={metrics.avgAttempts} 
          sub="Esfuerzo por ítem"
        />
        <StatCard 
          icon={<TrendingUp className="w-4 h-4" />} 
          label="Eficiencia Neta" 
          value={`${metrics.efficiency}%`} 
          sub="Precisión total"
        />
      </div>

      <div className="flex flex-col items-center gap-6 py-8 border-y border-slate-100/50">
        <Button 
          onClick={restartQuiz} 
          size="lg" 
          className="w-full md:w-auto px-10 md:px-20 h-14 md:h-20 text-base md:text-2xl font-black rounded-2xl md:rounded-[2rem] shadow-2xl shadow-primary/25 transition-all hover:scale-[1.03] active:scale-95 bg-primary group"
        >
          NUEVA SIMULACIÓN <ChevronRight className="ml-2 md:ml-3 w-5 h-5 md:w-8 md:h-8 group-hover:translate-x-1 transition-transform" />
        </Button>
        <div className="flex items-center gap-3 text-slate-400 font-bold bg-slate-50 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-xs uppercase tracking-widest border border-slate-100">
          <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          Carrera de TIC • UTELVT 2026
        </div>
      </div>

      {showHeavyComponents ? (
        <>
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Análisis Estadístico</h2>
            </div>
            <StatsCharts />
          </div>

          <ErrorReview />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
          <p className="text-[10px] uppercase font-black tracking-widest animate-pulse">Generando reporte detallado...</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub, badge, badgeStyle }: any) {
  return (
    <Card className="border-none shadow-xl bg-white rounded-xl md:rounded-[2rem] overflow-hidden hover:translate-y-[-4px] transition-all duration-300 academic-shadow">
      <CardContent className="p-4 md:p-8 space-y-2 md:space-y-4">
        <div className="flex items-center gap-1.5 md:gap-2 text-slate-400 font-black text-[8px] md:text-[10px] uppercase tracking-widest truncate">
          {icon} {label}
        </div>
        <div className="text-xl md:text-4xl font-black tracking-tighter text-slate-900 tabular-nums">{value}</div>
        {sub && <p className="text-[9px] md:text-[11px] text-slate-400 font-bold uppercase tracking-tight truncate">{sub}</p>}
        {badge && (
          <div className={cn("mt-4 px-4 py-1.5 inline-block rounded-xl text-[10px] font-black border uppercase tracking-widest shadow-sm", badgeStyle)}>
            {badge}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
