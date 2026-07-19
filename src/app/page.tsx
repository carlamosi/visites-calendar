import { ThemeToggle } from "@/components/ThemeToggle";
import { UploadWidget } from "@/components/UploadWidget";
import { CalendarRange } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col relative overflow-hidden selection:bg-primary/30">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full flex items-center justify-between p-6 max-w-6xl mx-auto z-10">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <CalendarRange className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">VisitesCalendar</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero Section & Widget */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full max-w-6xl mx-auto">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            Generate patient <br className="hidden md:block"/> calendars instantly.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium">
            Upload your Excel study file and get a ready-to-import <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">.ics</code> file in seconds. No configuration needed.
          </p>
        </div>

        <UploadWidget />
      </div>

      {/* Footer */}
      <footer className="w-full p-6 text-center text-sm text-muted-foreground z-10">
        <p>© {new Date().getFullYear()} VisitesCalendar. All rights reserved.</p>
      </footer>
    </main>
  );
}
