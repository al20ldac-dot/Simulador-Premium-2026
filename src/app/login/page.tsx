"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, ChevronRight, Sparkles, BookOpen, Trophy, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useQuiz } from '@/components/quiz/QuizProvider';

export default function LoginPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setIdentity } = useQuiz();
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    setMounted(true);
    // Recuperar credenciales previas para autocompletar
    const savedFirst = localStorage.getItem('tic_saved_first_name');
    const savedLast = localStorage.getItem('tic_saved_last_name');
    if (savedFirst) setFirstName(savedFirst);
    if (savedLast) setLastName(savedLast);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const first = firstName.trim();
    const last = lastName.trim();

    if (!first || !last) {
      toast({
        variant: "destructive",
        title: "Campos Obligatorios",
        description: "Debe ingresar su nombre y apellido para continuar.",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const nameStr = `${first} ${last}`;
      const normalizedLower = nameStr.toLowerCase().replace(/\s+/g, ' ');
      const displayTitleCase = normalizedLower.replace(/\b\w/g, l => l.toUpperCase());

      const auth = getAuth();
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      localStorage.setItem('tic_student_name', displayTitleCase);
      localStorage.setItem('tic_student_id', normalizedLower);

      // Guardar de forma permanente para autocompletar en el futuro
      localStorage.setItem('tic_saved_first_name', first);
      localStorage.setItem('tic_saved_last_name', last);

      // Guardar el registro en Firebase Firestore inmediatamente
      if (firestore) {
        await setDoc(doc(firestore, 'users', normalizedLower), {
          id: normalizedLower,
          name: displayTitleCase,
          lastActive: serverTimestamp(),
          registeredAt: serverTimestamp()
        }, { merge: true });
      }

      toast({
        title: "¡Acceso Concedido!",
        description: `Bienvenido/a, ${displayTitleCase}`,
      });

      // Actualizar el contexto global de inmediato para disparar la carga de datos
      if (setIdentity) {
        setIdentity(nameStr, normalizedLower);
      }
      
      router.push('/');
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: "No pudimos conectarnos. Intenta de nuevo.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#060d1f]">

      {/* ── Fondo animado con orbes de color ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #3b82f6, transparent 70%)',
            top: '-15%',
            right: '-10%',
            animation: 'floatOrb1 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #6366f1, transparent 70%)',
            bottom: '-20%',
            left: '-10%',
            animation: 'floatOrb2 10s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #22d3ee, transparent 70%)',
            top: '40%',
            left: '30%',
            animation: 'floatOrb3 12s ease-in-out infinite',
          }}
        />
        {/* Grid de puntos decorativo */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* ── Partículas flotantes ── */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-blue-400/40"
              style={{
                left: `${15 + i * 14}%`,
                top: `${20 + (i % 3) * 25}%`,
                animation: `particleFloat ${4 + i * 0.7}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Stats flotantes (solo escritorio) ── */}
      <div
        className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4"
        style={{ animation: 'fadeInLeft 0.8s ease-out 0.6s both' }}
      >
        {[
          { icon: <Trophy className="w-4 h-4 text-yellow-400" />, label: 'Ranking Global', val: 'Live' },
          { icon: <BookOpen className="w-4 h-4 text-blue-400" />, label: 'Preguntas', val: '100+' },
          { icon: <Zap className="w-4 h-4 text-emerald-400" />, label: 'Modo', val: 'Examen' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl px-4 py-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">{s.icon}</div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">{s.label}</p>
              <p className="text-sm text-white font-black">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tarjeta principal ── */}
      <div
        className="relative z-10 w-full mx-4"
        style={{
          maxWidth: '400px',
          animation: 'cardEntrance 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both',
        }}
      >
        {/* Badge superior */}
        <div
          className="flex justify-center mb-5"
          style={{ animation: 'fadeInDown 0.5s ease-out 0.3s both' }}
        >
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Simulador • UTELV • 2026</span>
          </div>
        </div>

        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-7 md:p-9 shadow-[0_32px_64px_rgba(0,0,0,0.4)]">

          {/* Icono y Título */}
          <div className="text-center mb-7">
            <div
              className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5 relative"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                animation: 'jump 2s ease-in-out infinite',
              }}
            >
              <GraduationCap className="w-8 h-8 text-white" strokeWidth={2} />
              <div className="absolute inset-0 rounded-2xl" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)',
              }} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none">
              BIENVENIDO
            </h1>
            <p className="text-xs text-white/40 mt-2 font-medium leading-relaxed">
              Identifícate para acceder al simulador de examen
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Campo Nombre */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-white/40 ml-1">
                Nombre
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ingrese su nombre"
                autoComplete="given-name"
                className="w-full h-12 rounded-xl px-4 text-sm font-semibold text-white placeholder:text-white/20 border border-white/10 outline-none transition-all duration-200 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(8px)',
                }}
              />
            </div>

            {/* Campo Apellido */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-white/40 ml-1">
                Apellido
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ingrese su apellido"
                autoComplete="family-name"
                className="w-full h-12 rounded-xl px-4 text-sm font-semibold text-white placeholder:text-white/20 border border-white/10 outline-none transition-all duration-200 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(8px)',
                }}
              />
            </div>

            {/* Botón */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full h-12 rounded-xl font-black text-[11px] tracking-[0.15em] text-white uppercase transition-all duration-200 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: isProcessing
                    ? 'rgba(99,102,241,0.5)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                  boxShadow: isProcessing ? 'none' : '0 8px 24px rgba(99,102,241,0.4)',
                }}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    VERIFICANDO...
                  </>
                ) : (
                  <>
                    INGRESAR AL SIMULADOR
                    <ChevronRight className="w-4 h-4" strokeWidth={3} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="text-center text-[10px] text-white/20 font-medium mt-5">
            Ambos campos son obligatorios
          </p>
        </div>
      </div>

      {/* ── Keyframes CSS ── */}
      <style jsx global>{`
        @keyframes floatOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.05); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -25px) scale(1.08); }
        }
        @keyframes floatOrb3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -15px) scale(1.1); }
          66% { transform: translate(-20px, 10px) scale(0.95); }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0px) opacity(0.4); }
          50% { transform: translateY(-20px); opacity: 0.8; }
        }
        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes iconPulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(99,102,241,0.4); }
          50% { box-shadow: 0 8px 48px rgba(99,102,241,0.7); }
        }
        @keyframes jump {
          0%, 100% { transform: translateY(0); }
          20% { transform: translateY(-12px) scaleY(1.1); }
          40% { transform: translateY(0) scaleY(0.9); }
          50% { transform: translateY(-5px); }
          60% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
