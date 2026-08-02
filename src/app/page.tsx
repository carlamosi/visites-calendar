
import { UploadWidget } from "@/components/UploadWidget";
import { Heart } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col relative overflow-hidden selection:bg-primary/30">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />


      {/* Hero Section & Widget */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 z-10 w-full max-w-3xl mx-auto">
        <div className="text-center mb-8 max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4 text-rose-500">
            <Heart className="w-6 h-6 fill-current animate-pulse" />
            <span className="font-medium text-sm uppercase tracking-wider">Per a la millor infermera</span>
            <Heart className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            Genera els calendaris <br className="hidden md:block"/> en un tres i no res.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground font-medium">
            Puja el teu fitxer d'Excel o enganxa les dades del calendari i l'obtindràs a l'instant. <br/> Gràcies per cuidar tan bé dels pacients cada dia! 💙
          </p>
        </div>

        <UploadWidget />
      </div>

      {/* Footer */}
      <footer className="w-full p-4 text-center text-xs text-muted-foreground z-10">
        <p>© {new Date().getFullYear()} Creat amb molt d'amor per facilitar-te la feina.</p>
      </footer>
    </main>
  );
}
