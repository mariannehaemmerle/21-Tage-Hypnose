import React, { useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Progress } from "./components/ui/progress";

function App() {
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);

  const handleStart = () => {
    setProgress((prev) => (prev >= 100 ? 0 : prev + 20));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-white to-zinc-200 flex flex-col items-center justify-center p-6">
      <div className="bg-white/70 backdrop-blur-md shadow-xl rounded-2xl p-8 max-w-md w-full border border-yellow-300/30">
        <h1 className="text-3xl font-bold text-yellow-600 mb-6 text-center tracking-wide">
          ✨ Deine Hypnose-App ✨
        </h1>

        <div className="space-y-4">
          <Input
            placeholder="Dein Name"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="border-yellow-400 focus:ring-yellow-500"
          />

          <Textarea
            placeholder="Schreibe deine Notiz..."
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="border-yellow-400 focus:ring-yellow-500"
          />

          <Button
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-white font-semibold shadow-lg"
          >
            🌟 Starte Hypnose
          </Button>

          <div className="pt-2">
            <Progress value={progress} className="h-3 bg-yellow-200" />
            <p className="text-sm text-center text-yellow-700 mt-2">
              Fortschritt: {progress}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
