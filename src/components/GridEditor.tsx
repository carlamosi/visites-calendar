"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Calendar as CalendarIcon, User, RefreshCcw, Save } from "lucide-react";
import { format, addDays, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type Visit = {
  id: string;
  name: string;
  weeks: string;
};

type Patient = {
  id: string;
  name: string;
  referenceDate: string;
  manualDates: Record<string, string>; // visitId -> date string (YYYY-MM-DD)
};

interface GridEditorProps {
  onGenerate: (data: { estudio: string; rows: string[][] }) => void;
}

export function GridEditor({ onGenerate }: GridEditorProps) {
  const [studyName, setStudyName] = useState("Estudi Clínic");
  
  // Default template based on user's example
  const [visits, setVisits] = useState<Visit[]>([
    { id: "v1", name: "Pre-screening", weeks: "0" },
    { id: "v2", name: "Screening", weeks: "2" },
    { id: "v3", name: "Screening 2", weeks: "4" },
    { id: "v4", name: "BSL", weeks: "6" },
    { id: "v5", name: "W2", weeks: "8" },
    { id: "v6", name: "W4", weeks: "12" },
    { id: "v7", name: "W6", weeks: "16" },
    { id: "v8", name: "W8", weeks: "20" },
    { id: "v9", name: "W12", weeks: "24" },
  ]);

  const [patients, setPatients] = useState<Patient[]>([
    { id: "p1", name: "#01", referenceDate: "", manualDates: {} },
    { id: "p2", name: "#02", referenceDate: "", manualDates: {} },
  ]);

  const addPatient = () => {
    const newNum = (patients.length + 1).toString().padStart(2, "0");
    setPatients([
      ...patients,
      { id: `p${Date.now()}`, name: `#${newNum}`, referenceDate: "", manualDates: {} }
    ]);
  };

  const removePatient = (id: string) => {
    setPatients(patients.filter(p => p.id !== id));
  };

  const addVisit = () => {
    setVisits([...visits, { id: `v${Date.now()}`, name: "Nova Visita", weeks: "" }]);
  };

  const removeVisit = (id: string) => {
    setVisits(visits.filter(v => v.id !== id));
  };

  const updateVisit = (id: string, field: keyof Visit, value: string) => {
    setVisits(visits.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const updatePatientName = (id: string, name: string) => {
    setPatients(patients.map(p => p.id === id ? { ...p, name } : p));
  };

  const updateReferenceDate = (patientId: string, date: string) => {
    setPatients(patients.map(p => p.id === patientId ? { ...p, referenceDate: date } : p));
  };

  const handleManualDateChange = (patientId: string, visitId: string, date: string) => {
    setPatients(patients.map(p => {
      if (p.id !== patientId) return p;
      const newManual = { ...p.manualDates };
      if (!date) {
        delete newManual[visitId];
      } else {
        newManual[visitId] = date;
      }
      return { ...p, manualDates: newManual };
    }));
  };

  // Helper to compute date
  const getComputedDate = (patient: Patient, visit: Visit): string => {
    if (patient.manualDates[visit.id]) {
      return patient.manualDates[visit.id];
    }
    
    if (!patient.referenceDate || !visit.weeks || isNaN(Number(visit.weeks))) {
      return "";
    }

    const baseDate = parseISO(patient.referenceDate);
    if (!isValid(baseDate)) return "";

    const daysToAdd = Number(visit.weeks) * 7;
    const resultDate = addDays(baseDate, daysToAdd);
    return format(resultDate, "yyyy-MM-dd");
  };

  // Compile data into 2D array expected by ExcelParserService
  const compileData = () => {
    const rows: string[][] = [];
    
    // Row 0: [ "", "", "", "Ensayo:", "STUDY NAME" ]
    // We will place Ensayo at A1 so it's easier, but to be safe with config, let's just make it big enough
    const titleRow = Array(10).fill("");
    titleRow[0] = "Ensayo:";
    titleRow[1] = studyName;
    rows.push(titleRow);

    // Row 1: Empty
    rows.push([]);

    // Row 2: Patient Numbers (index 2 / FILA_PACIENTES - 1 in config)
    // config: COL_INICIO_PACIENTES = 3 (index 2)
    const patientRow = ["", ""];
    patients.forEach(p => patientRow.push(p.name));
    rows.push(patientRow);

    // Row 3: Headers
    const headerRow = ["Visita", "Setmanes"];
    patients.forEach(p => headerRow.push(p.name));
    rows.push(headerRow);

    // Row 4+ : Visits
    visits.forEach(v => {
      const vRow = [v.name, v.weeks];
      patients.forEach(p => {
        vRow.push(getComputedDate(p, v));
      });
      rows.push(vRow);
    });

    onGenerate({ estudio: studyName, rows });
  };

  return (
    <div className="w-full flex flex-col gap-6 bg-background border border-border/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/20 pb-4">
        <div className="flex flex-col">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Nom de l'assaig</label>
          <input 
            type="text" 
            value={studyName}
            onChange={(e) => setStudyName(e.target.value)}
            className="text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-foreground w-full sm:w-[300px]"
            placeholder="Escriu el nom de l'assaig..."
          />
        </div>
        <button 
          onClick={compileData}
          className="px-6 py-2 bg-gradient-to-r from-primary to-blue-600 text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2"
        >
          <CalendarIcon className="w-4 h-4" />
          Generar Calendari
        </button>
      </div>

      <div className="w-full overflow-x-auto custom-scrollbar pb-4 -mx-2 px-2">
        <div className="min-w-max">
          <table className="w-full border-separate border-spacing-x-2 border-spacing-y-1">
            <thead>
              {/* Patient Headers */}
              <tr>
                <th className="text-left font-medium text-muted-foreground w-48 text-sm pb-2">Visites</th>
                <th className="text-center font-medium text-muted-foreground w-20 text-sm pb-2">Setmanes</th>
                {patients.map((p) => (
                  <th key={p.id} className="text-center w-36 pb-2 group">
                    <div className="flex flex-col gap-1 items-center">
                      <div className="flex items-center gap-1 justify-center w-full">
                        <User className="w-3 h-3 text-primary" />
                        <input 
                          type="text"
                          value={p.name}
                          onChange={(e) => updatePatientName(p.id, e.target.value)}
                          className="font-semibold text-sm bg-muted/30 border border-transparent hover:border-border focus:border-primary focus:bg-background rounded px-1 py-0.5 text-center w-16 transition-all"
                        />
                        <button 
                          onClick={() => removePatient(p.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                          title="Eliminar pacient"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="w-full">
                        <label className="text-[10px] text-muted-foreground/70 block mb-0.5">Data Referència (Base)</label>
                        <input
                          type="date"
                          value={p.referenceDate}
                          onChange={(e) => updateReferenceDate(p.id, e.target.value)}
                          className="text-xs bg-muted/20 border border-border/50 rounded-md px-2 py-1 w-full focus:outline-none focus:border-primary text-foreground"
                        />
                      </div>
                    </div>
                  </th>
                ))}
                <th className="w-10">
                  <button onClick={addPatient} className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors mx-auto" title="Afegir pacient">
                    <Plus className="w-4 h-4" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {visits.map((v, idx) => (
                <motion.tr 
                  key={v.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <td className="py-1">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => removeVisit(v.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                        title="Eliminar visita"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <input 
                        type="text"
                        value={v.name}
                        onChange={(e) => updateVisit(v.id, "name", e.target.value)}
                        className="text-sm bg-muted/30 border border-transparent hover:border-border focus:border-primary focus:bg-background rounded-md px-2 py-1.5 w-full transition-all"
                        placeholder="Nom Visita"
                      />
                    </div>
                  </td>
                  <td className="py-1">
                    <input 
                      type="number"
                      value={v.weeks}
                      onChange={(e) => updateVisit(v.id, "weeks", e.target.value)}
                      className="text-sm text-center bg-muted/30 border border-transparent hover:border-border focus:border-primary focus:bg-background rounded-md px-2 py-1.5 w-full transition-all"
                      placeholder="0"
                    />
                  </td>
                  
                  {/* Patient Dates */}
                  {patients.map(p => {
                    const computed = getComputedDate(p, v);
                    const isManual = !!p.manualDates[v.id];
                    
                    return (
                      <td key={p.id} className="py-1 px-1">
                        <div className={cn(
                          "relative group flex items-center rounded-md overflow-hidden transition-all",
                          isManual ? "border border-amber-500/50 bg-amber-500/5" : "border border-border/30 bg-muted/10 hover:border-primary/50"
                        )}>
                          <input 
                            type="date"
                            value={computed}
                            onChange={(e) => handleManualDateChange(p.id, v.id, e.target.value)}
                            className={cn(
                              "text-xs bg-transparent w-full px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary",
                              isManual ? "text-amber-500 font-medium" : "text-foreground"
                            )}
                          />
                          {isManual && (
                            <button 
                              onClick={() => handleManualDateChange(p.id, v.id, "")}
                              className="absolute right-1 p-0.5 text-amber-500/70 hover:text-amber-500 bg-background rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Restaurar data automàtica"
                            >
                              <RefreshCcw className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td></td>
                </motion.tr>
              ))}
              <tr>
                <td colSpan={2} className="pt-2">
                  <button 
                    onClick={addVisit}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium px-2 py-1"
                  >
                    <Plus className="w-3 h-3" /> Afegir Visita
                  </button>
                </td>
                <td colSpan={patients.length + 1}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground flex gap-4 bg-muted/30 p-3 rounded-lg">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border border-border/50 bg-muted/20"></div>
          <span>Data automàtica</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border border-amber-500/50 bg-amber-500/10"></div>
          <span>Modificada manualment</span>
        </div>
      </div>
    </div>
  );
}
