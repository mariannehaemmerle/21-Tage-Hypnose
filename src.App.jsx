import React, { useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Progress } from "./components/ui/progress";

function App() {
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);

  const handleStart = () => {
    // Demo: Fortschritt hochzählen
    setProgress((prev) => (prev >= 100 ? 0 : prev + 20));
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-emerald-600 mb-6">
        Hypnose App 🌿
      </h1>

      <div className="w-full max-w-md space-y-4">
        <Input
          placeholder="Dein Name"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <Textarea
          placeholder="Schreibe deine Notiz..."
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <Button onClick={handleStart} className="w-full">
          Starte Hypnose
        </Button>

        <Progress value={progress} />
      </div>
    </div>
  );
}

export default App;
