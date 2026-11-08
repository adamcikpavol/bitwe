"use client";

import { useEffect, useState } from "react";
import Tesseract from "tesseract.js";
import { Volume2, Star } from "lucide-react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [savedWords, setSavedWords] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("bitwe_dictionary");

    if (stored) {
      setSavedWords(JSON.parse(stored));
    }
  }, []);

  const saveWord = (word: string) => {
    if (savedWords.includes(word)) return;

    const updated = [...savedWords, word];

    setSavedWords(updated);

    localStorage.setItem(
      "bitwe_dictionary",
      JSON.stringify(updated)
    );
  };

  const speakWord = (word: string) => {
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);

    utterance.lang = "en-GB";

    speechSynthesis.speak(utterance);
  };

  const extractWords = (text: string) => {
    const foundWords = new Set<string>();

    const regex =
      /([A-Za-z][A-Za-z\s'-]{1,40})\s*\((?:n|v|adj|adv|1|rn)\)/gi;

    let match;

    while ((match = regex.exec(text)) !== null) {
      let word = match[1]
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

      if (
        word.length > 2 &&
        !word.includes("headway") &&
        !word.includes("unit") &&
        !word.includes("anglictina") &&
        !word.includes("slovicka")
      ) {
        foundWords.add(word);
      }
    }

    setWords(Array.from(foundWords).sort());
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setImage(URL.createObjectURL(file));
    setLoading(true);

    try {
      const result = await Tesseract.recognize(
        file,
        "eng"
      );

      const text = result.data.text;

      setOcrText(text);

      extractWords(text);
    } catch (error) {
      console.error(error);

      setOcrText(
        "Nepodarilo sa načítať text z fotografie."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-sky-400 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">

          <h1 className="text-5xl font-bold text-blue-700 text-center">
            BITWE
          </h1>

          <p className="text-center text-slate-700 text-xl mt-4 mb-8">
            Be In Touch With English
          </p>

          <div className="flex justify-center">
            <label className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-xl cursor-pointer font-semibold">
              📷 Odfotiť / Nahrať

              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {loading && (
            <div className="mt-6 text-center text-blue-700 font-bold">
              Rozpoznávam text...
            </div>
          )}

          {image && (
            <div className="mt-8 flex justify-center">
              <img
                src={image}
                alt="Preview"
                className="max-h-[600px] rounded-xl border shadow-lg"
              />
            </div>
          )}

          <div className="mt-8">
            <label className="block text-lg font-bold mb-2 text-slate-900">
              OCR text
            </label>

            <textarea
              value={ocrText}
              onChange={(e) =>
                setOcrText(e.target.value)
              }
              className="w-full h-72 p-4 border-2 border-slate-300 rounded-xl text-black bg-white"
            />
          </div>

          <div className="mt-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Slovíčka ({words.length})
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">

              {words.map((word) => (
                <div
                  key={word}
                  className="bg-blue-50 border border-blue-300 rounded-xl p-3 flex items-center justify-between"
                >
                  <button
                    onClick={() => speakWord(word)}
                    className="flex items-center gap-2 text-blue-700 font-semibold"
                  >
                    <Volume2 size={18} />
                    {word}
                  </button>

                  <button
                    onClick={() => saveWord(word)}
                    className="text-yellow-500"
                  >
                    <Star size={18} />
                  </button>
                </div>
              ))}

            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              ⭐ Môj slovník ({savedWords.length})
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">

              {savedWords.map((word) => (
                <button
                  key={word}
                  onClick={() => speakWord(word)}
                  className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 text-left font-semibold text-slate-900"
                >
                  🔊 {word}
                </button>
              ))}

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}