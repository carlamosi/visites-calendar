"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { GridEditor } from "./GridEditor";

type AppState = "idle" | "uploading" | "success" | "error";

export function UploadWidget() {
  const [state, setState] = useState<AppState>("idle");
  const [inputMode, setInputMode] = useState<"file" | "grid">("file");
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (inputMode === "file") setIsDragging(true);
  }, [inputMode]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateAndSetFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".xlsx")) {
      setErrorMsg("Format d'arxiu invàlid. Si us plau, puja un arxiu .xlsx.");
      setState("error");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMsg("L'arxiu és massa gran. La mida màxima és de 10MB.");
      setState("error");
      return;
    }
    setErrorMsg("");
    generateCalendarFromFile(selectedFile);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (inputMode === "file" && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, [inputMode]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const clearSelection = () => {
    setState("idle");
    setErrorMsg("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#3b82f6", "#10b981", "#ffffff"]
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#3b82f6", "#10b981", "#ffffff"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleDownload = async (response: Response) => {
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    
    let filename = "visitas_pacientes.ics";
    const disposition = response.headers.get("Content-Disposition");
    if (disposition && disposition.indexOf("filename=") !== -1) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
      if (matches != null && matches[1]) { 
        filename = matches[1].replace(/['"]/g, "");
      }
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  };

  const handleGenerateResponse = async (response: Response) => {
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { detail: "Hi ha hagut un error inesperat durant la generació." };
      }
      setErrorMsg(errorData.detail || "No s'ha pogut generar el calendari.");
      setState("error");
      return;
    }

    await handleDownload(response);
    setState("success");
    triggerConfetti();
  }

  const generateCalendarFromFile = async (fileToUpload: File) => {
    setState("uploading");
    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      await handleGenerateResponse(response);
    } catch (error) {
      setErrorMsg("Hi ha hagut un error de xarxa. Torna-ho a provar.");
      setState("error");
    }
  };

  const generateCalendarFromGrid = async (data: { estudio: string; rows: string[][] }) => {
    setState("uploading");
    try {
      const response = await fetch("/api/generate-from-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await handleGenerateResponse(response);
    } catch (error) {
      setErrorMsg("Hi ha hagut un error de xarxa. Torna-ho a provar.");
      setState("error");
    }
  };

  return (
    <div className="w-full">
      {state === "idle" && (
        <div className="flex bg-muted/50 p-1 rounded-xl mb-6 w-fit mx-auto">
          <button
            onClick={() => setInputMode("file")}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", inputMode === "file" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            Puja fitxer
          </button>
          <button
            onClick={() => setInputMode("grid")}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", inputMode === "grid" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            Crear Manualment
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        
        {/* IDLE STATE */}
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {inputMode === "file" ? (
              <div 
                className={cn(
                  "relative group flex flex-col items-center justify-center w-full max-w-md mx-auto min-h-[224px] p-6 border-2 border-dashed rounded-3xl transition-all duration-300 ease-in-out glass-panel",
                  isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50 hover:bg-muted/30"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div onClick={() => fileInputRef.current?.click()} className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".xlsx"
                    className="hidden"
                  />
                  
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95, rotate: -2 }}
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-blue-600 text-primary-foreground font-semibold text-lg shadow-lg shadow-primary/25 flex items-center justify-center gap-2 mb-4"
                  >
                    <UploadCloud className="w-6 h-6" />
                    Puja fitxer
                  </motion.div>
                  
                  <p className="text-muted-foreground text-sm text-center max-w-[260px]">
                    o arrossega l'arxiu .xlsx aquí
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-[90vw] overflow-visible">
                <GridEditor onGenerate={generateCalendarFromGrid} />
              </div>
            )}
          </motion.div>
        )}

        {/* UPLOADING STATE */}
        {state === "uploading" && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-56 max-w-md mx-auto glass-panel rounded-3xl gap-6"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="p-4 bg-primary/10 text-primary rounded-full"
            >
              <Loader2 className="w-10 h-10" />
            </motion.div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-1">Processant...</h3>
              <p className="text-muted-foreground text-sm">Llegint les dades i generant els esdeveniments</p>
            </div>
            
            <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: "0%" }}
                 animate={{ width: "100%" }}
                 transition={{ duration: 2, ease: "easeInOut" }}
                 className="h-full bg-primary rounded-full"
               />
            </div>
          </motion.div>
        )}

        {/* SUCCESS STATE */}
        {state === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-56 max-w-md mx-auto glass-panel rounded-3xl gap-4 text-center px-6"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="p-4 bg-emerald-500/10 text-emerald-500 rounded-full"
            >
              <CheckCircle2 className="w-12 h-12" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Calendari generat!</h3>
              <p className="text-muted-foreground text-sm">Ja el tens descarregat. Ara a curar pacients i a prendre un bon cafè, que t'ho mereixes! ☕💪</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearSelection}
              className="px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium flex items-center gap-2 hover:bg-secondary/80 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Tornar a començar
            </motion.button>
          </motion.div>
        )}

        {/* ERROR STATE */}
        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center justify-center h-56 max-w-md mx-auto glass-panel border-destructive/20 rounded-3xl gap-6 text-center px-6"
          >
            <div className="p-4 bg-destructive/10 text-destructive rounded-full">
              <AlertCircle className="w-12 h-12" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Alguna cosa ha fallat</h3>
              <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">{errorMsg}</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearSelection}
              className="px-6 py-3 rounded-xl bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 transition-colors"
            >
              Torna-ho a provar
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
