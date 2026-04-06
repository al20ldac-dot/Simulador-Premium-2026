"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartConfig 
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, Label } from 'recharts';
import { useQuiz } from '../quiz/QuizProvider';

export function StatsCharts() {
  const { state } = useQuiz();
  const { pieData, barData, percentage } = React.useMemo(() => {
    const correctCount = state.responses.filter(r => r.isCorrect).length;
    const incorrectCount = state.questions.length - correctCount;
    const calcPercentage = Math.round((correctCount / (state.questions.length || 1)) * 100);

    const generatedPieData = [
      { name: 'Correctas', value: correctCount, fill: 'hsl(142, 76%, 36%)' },
      { name: 'Incorrectas', value: incorrectCount, fill: 'hsl(0, 84%, 60%)' },
    ];

    const responsesMap = new Map();
    state.responses.forEach(r => responsesMap.set(r.questionId, r));

    const categoryStats = state.questions.reduce((acc, q) => {
      const response = responsesMap.get(q.id);
      if (!acc[q.categoria]) {
        acc[q.categoria] = { category: q.categoria, correct: 0, total: 0 };
      }
      acc[q.categoria].total += 1;
      if (response?.isCorrect) acc[q.categoria].correct += 1;
      return acc;
    }, {} as Record<string, { category: string, correct: number, total: number }>);

    const chartColors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
      'hsl(var(--chart-3))',
    ];

    const generatedBarData = Object.values(categoryStats).map((s, index) => ({
      categoria: s.category,
      porcentaje: Math.round((s.correct / s.total) * 100),
      fill: chartColors[index % chartColors.length]
    }));

    return { pieData: generatedPieData, barData: generatedBarData, percentage: calcPercentage };
  }, [state.questions, state.responses]);

  const chartConfig: ChartConfig = {
    correct: { label: "Correctas", color: "hsl(var(--chart-2))" },
    incorrect: { label: "Incorrectas", color: "hsl(var(--destructive))" },
    porcentaje: { label: "Éxito (%)", color: "hsl(var(--chart-1))" },
  };

  return (
    <div className="grid gap-4 md:grid-gap-8 md:grid-cols-2">
      <Card className="border-none shadow-2xl bg-white rounded-2xl md:rounded-[2rem] overflow-hidden academic-shadow transition-all hover:translate-y-[-4px] duration-500">
        <CardHeader className="pb-1">
          <CardTitle className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Balance General</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px] md:h-[350px] relative">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-out"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity" />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-slate-900 text-5xl font-black tracking-tighter"
                          >
                            {percentage}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-slate-400 text-[9px] font-black uppercase tracking-widest"
                          >
                            Correctas
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            </PieChart>
          </ChartContainer>
          <div className="flex justify-center gap-8 pb-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }} />
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Éxito</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(0, 84%, 60%)' }} />
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Error</span>
               </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-2xl bg-white rounded-2xl md:rounded-[2rem] overflow-hidden academic-shadow transition-all hover:translate-y-[-4px] duration-500">
        <CardHeader className="pb-1">
          <CardTitle className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Rendimiento por Categoría</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px] md:h-[350px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart 
               data={barData} 
               layout="vertical" 
               margin={{ left: 0, right: 30 }}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis 
                dataKey="categoria" 
                type="category" 
                width={120} 
                fontSize={10} 
                fontWeight="900" 
                tickLine={false} 
                axisLine={false} 
                className="uppercase tracking-tight text-slate-500"
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar 
                 dataKey="porcentaje" 
                 radius={[0, 20, 20, 0]} 
                 barSize={16}
                 isAnimationActive={true}
                 animationDuration={1500}
                 animationEasing="ease-out"
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}