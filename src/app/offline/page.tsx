"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, WifiOff, RefreshCcw, Loader2 } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useState, useEffect } from "react";

export default function OfflinePage() {
  const router = useRouter();
  const isOnline = useOnlineStatus();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050510] overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Dynamic Error Lighting Background */}
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.4, 0.8, 0.3],
          scale: [1, 1.05, 1, 1.1, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/20 blur-[120px] rounded-full pointer-events-none"
      />
      
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-600/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-900/20 blur-[100px] rounded-full" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />

      {/* Main Content */}
      <div className="z-10 relative flex flex-col items-center w-full max-w-2xl text-center">
        {/* Animated Character / Illustration */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8 z-10 flex items-center justify-center">
          
          {/* Unplugged wire / floating character composite */}
          <motion.div 
            className="absolute z-20"
            animate={{ y: [0, -15, 0], rotate: [0, 2, -2, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            {/* The plug end - Character */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 bg-zinc-800 rounded-3xl border-4 border-zinc-700 shadow-[0_0_50px_rgba(220,38,38,0.5)] flex flex-col items-center justify-center overflow-hidden">
               {/* Eyes */}
               <div className="flex gap-4 mb-2">
                 <motion.div 
                   animate={{ scaleY: [1, 0.1, 1], opacity: [1, 0.5, 1] }} 
                   transition={{ repeat: Infinity, duration: 4, times: [0, 0.1, 0.2] }}
                   className="w-4 h-6 md:w-6 md:h-8 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)]" 
                 />
                 <motion.div 
                   animate={{ scaleY: [1, 0.1, 1], opacity: [1, 0.5, 1] }} 
                   transition={{ repeat: Infinity, duration: 4, times: [0, 0.1, 0.2] }}
                   className="w-4 h-6 md:w-6 md:h-8 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)]" 
                 />
               </div>
               {/* Mouth / sad curve */}
               <motion.div 
                 className="w-10 h-3 md:w-12 md:h-4 rounded-t-full border-t-4 border-zinc-400 mt-2" 
               />
               <motion.div className="w-full h-1 bg-red-500/20 absolute bottom-4 animate-pulse" />
            </div>

            {/* Prongs */}
            <div className="flex justify-center gap-4 -mt-2">
              <div className="w-3 h-8 bg-zinc-400 rounded-b-md shadow-inner" />
              <div className="w-3 h-8 bg-zinc-400 rounded-b-md shadow-inner" />
            </div>
          </motion.div>

          {/* Floating Outlet - Disconnected */}
          <motion.div 
            className="absolute top-44 md:top-56 z-10"
            animate={{ y: [0, 10, 0], rotate: [0, -1, 1, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
          >
            <div className="w-36 h-20 md:w-44 md:h-24 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl">
              <div className="flex gap-4 mb-1">
                 <div className="w-3 h-6 bg-zinc-900 rounded-sm" />
                 <div className="w-3 h-6 bg-zinc-900 rounded-sm" />
              </div>
              <div className="w-4 h-4 rounded-full bg-zinc-900 mt-1" />
            </div>
          </motion.div>

          {/* Sparks and warning signs */}
          <motion.div 
             className="absolute top-1/2 left-1/4 w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,1)]"
             animate={{ x: [-20, -50], y: [-20, 20], opacity: [1, 0], scale: [1, 0] }}
             transition={{ repeat: Infinity, duration: 1, ease: "easeOut" }}
          />
          <motion.div 
             className="absolute top-1/2 right-1/4 w-2 h-2 bg-red-400 rounded-full shadow-[0_0_10px_rgba(248,113,113,1)]"
             animate={{ x: [20, 60], y: [-10, -40], opacity: [1, 0], scale: [1, 0] }}
             transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: 0.5 }}
          />
        </div>

        {/* Text Content */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs md:text-sm font-black uppercase tracking-widest backdrop-blur-sm">
             <WifiOff className="w-4 h-4 animate-pulse" />
             Se perdió la conexión
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
            Intento <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">Cancelado</span>
          </h1>
          
          <p className="text-slate-400 text-sm md:text-lg max-w-lg mx-auto font-medium">
            El simulador requiere una conexión estable para evitar inconsistencias en el historial. <strong className="text-white">Tu progreso actual no ha sido guardado.</strong>
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="mt-10 grid gap-4 w-full max-w-sm mx-auto"
        >
          <Button 
            onClick={() => {
              if (isOnline) {
                router.push('/');
              } else {
                location.reload();
              }
            }}
            disabled={!mounted || !isOnline}
            className="h-14 font-black uppercase tracking-widest text-sm rounded-xl overflow-hidden relative group bg-white text-[#050510] hover:bg-zinc-200"
          >
            {mounted && isOnline ? (
               <span className="flex items-center gap-2 relative z-10"><ArrowLeft className="w-5 h-5" /> Volver al Inicio</span>
            ) : (
               <span className="flex items-center gap-2 relative z-10 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" /> Esperando red...</span>
            )}
          </Button>

          {mounted && !isOnline && (
            <Button
              variant="outline"
              onClick={() => location.reload()}
              className="h-14 font-bold border-zinc-800 bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-white uppercase tracking-wider text-xs rounded-xl"
            >
              <RefreshCcw className="w-4 h-4 mr-2" /> Forzar recarga
            </Button>
          )}
        </motion.div>
      </div>

    </div>
  );
}
