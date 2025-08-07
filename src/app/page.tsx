"use client";

import { useState, useEffect } from "react";
import { runLLM } from "../../lib/llm";

export default function Home() {
  // Input & AI response
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  // Feature toggles & UI states
  const [darkMode, setDarkMode] = useState(true);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [showResponse, setShowResponse] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Effects to update counts
  useEffect(() => {
    setCharCount(input.length);
    setWordCount(input.trim() === "" ? 0 : input.trim().split(/\s+/).length);
  }, [input]);

  // Save notes locally for persistence
  useEffect(() => {
    const saved = localStorage.getItem("savedNotes");
    if (saved) setSavedNotes(JSON.parse(saved));
  }, []);

  // Helper: Save notes to localStorage
  const saveNotes = (note: string) => {
    const newSaved = [note, ...savedNotes].slice(0, 10); // max 10 saved notes
    setSavedNotes(newSaved);
    localStorage.setItem("savedNotes", JSON.stringify(newSaved));
    showToastMsg("Note saved!");
  };

  // Show temporary toast message
  const showToastMsg = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Clear input field
  const clearInput = () => setInput("");

  // Copy AI response to clipboard
  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      showToastMsg("Copied AI response!");
    }
  };

  // Reset everything
  const resetAll = () => {
    setInput("");
    setResponse("");
    setHistory([]);
    setShowResponse(true);
    showToastMsg("Reset all!");
  };

  // Toggle dark/light mode
  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Handle AI generation
  const handleGenerate = async () => {
    if (input.trim().length < 10) {
      alert("Please enter at least 10 characters to analyze.");
      return;
    }
    setLoading(true);
    try {
      const output = await runLLM(input);
      setResponse(output);
      setHistory([output, ...history].slice(0, 5)); // keep last 5 responses
    } catch (e) {
      alert("Error generating AI output.");
      console.error(e);
    }
    setLoading(false);
    saveNotes(input);
  };

  // Reuse saved note
  const reuseNote = (note: string) => {
    setInput(note);
    showToastMsg("Loaded saved note");
  };

  // Feature: Word suggestions (mock)
  const wordSuggestions = ["Summarize", "Explain", "Define", "List", "Compare"];

  return (
    <main
      className={`min-h-screen p-6 md:p-10 ${
        darkMode ? "bg-black text-white" : "bg-white text-black"
      } transition-colors duration-500`}
    >
      {/* Header */}
      <header className="flex flex-col md:flex-row md:justify-between items-center mb-8">
        <h1 className="text-4xl font-bold mb-4 md:mb-0">🧠 LLM Study Copilot</h1>

        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 rounded border border-gray-500 hover:bg-gray-700 hover:text-white transition"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </header>

      {/* Input Area */}
      <section className="mb-6">
        <label htmlFor="notes" className="block mb-2 font-medium">
          Paste Your Study Notes:
        </label>

        <textarea
          id="notes"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your notes or textbook paragraphs here..."
          className={`w-full h-48 p-4 rounded border resize-none focus:outline-none focus:ring-2 ${
            darkMode
              ? "bg-gray-900 border-gray-700 text-white focus:ring-white"
              : "bg-gray-100 border-gray-300 text-black focus:ring-black"
          }`}
        />

        {/* Char and Word Count */}
        <div
          className={`mt-2 flex justify-between text-sm ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          <span>{charCount} characters</span>
          <span>{wordCount} words</span>
          <button
            onClick={clearInput}
            disabled={input.length === 0}
            className="text-red-500 hover:text-red-700 disabled:opacity-40"
            aria-label="Clear input"
          >
            Clear Input
          </button>
        </div>

        {/* Word Suggestions */}
        <div className="mt-2 flex flex-wrap gap-2">
          {wordSuggestions.map((word) => (
            <button
              key={word}
              onClick={() => setInput((prev) => prev + (prev ? " " : "") + word)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
              aria-label={`Add suggestion: ${word}`}
            >
              {word}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-4 flex flex-wrap gap-4">
          <button
            onClick={handleGenerate}
            disabled={loading || input.trim().length < 10}
            className={`px-6 py-3 rounded font-semibold transition ${
              loading || input.trim().length < 10
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Analyzing..." : "Analyze with AI"}
          </button>

          <button
            onClick={resetAll}
            className="px-6 py-3 rounded border border-gray-500 hover:bg-gray-700 hover:text-white transition"
          >
            Reset All
          </button>

          <button
            onClick={() => setShowResponse(!showResponse)}
            className="px-6 py-3 rounded border border-gray-500 hover:bg-gray-700 hover:text-white transition"
          >
            {showResponse ? "Hide Response" : "Show Response"}
          </button>

          <button
            onClick={copyResponse}
            disabled={!response}
            className="px-6 py-3 rounded border border-green-500 text-green-500 hover:bg-green-700 hover:text-white disabled:opacity-50 transition"
          >
            Copy Response
          </button>
        </div>
      </section>

      {/* AI Response */}
      {showResponse && (
        <section
          aria-live="polite"
          className={`mt-8 p-6 rounded border ${
            darkMode ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-gray-100"
          } whitespace-pre-wrap min-h-[150px]`}
        >
          {loading ? (
            <p>Loading AI response...</p>
          ) : response ? (
            response
          ) : (
            <p className="text-gray-500 italic">Your AI summary will appear here</p>
          )}
        </section>
      )}

      {/* History Toggle */}
      <section className="mt-10">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-blue-400 hover:underline"
          aria-expanded={showHistory}
        >
          {showHistory ? "Hide" : "Show"} History ({history.length})
        </button>

        {/* History List */}
        {showHistory && history.length > 0 && (
          <ul
            className={`mt-4 max-h-48 overflow-auto space-y-3 border rounded p-4 ${
              darkMode ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-gray-100"
            }`}
          >
            {history.map((item, i) => (
              <li key={i} className="cursor-pointer hover:bg-gray-700 hover:text-white p-2 rounded" onClick={() => setResponse(item)}>
                {item.length > 120 ? item.slice(0, 120) + "..." : item}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Saved Notes Section */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Saved Notes</h2>
        {savedNotes.length === 0 && <p className="italic text-gray-500">No saved notes yet.</p>}

        <ul className="space-y-2 max-h-40 overflow-auto">
          {savedNotes.map((note, i) => (
            <li
              key={i}
              className="border border-gray-600 rounded p-3 cursor-pointer hover:bg-gray-700 transition"
              onClick={() => reuseNote(note)}
              title="Click to reuse note"
            >
              {note.length > 150 ? note.slice(0, 150) + "..." : note}
            </li>
          ))}
        </ul>
      </section>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 bg-gray-800 text-white py-2 px-4 rounded shadow-lg animate-fadeInOut">
          {toastMessage}
        </div>
      )}

      {/* Footer */}
      <footer className={`mt-20 text-center text-sm ${darkMode ? "text-gray-500" : "text-gray-600"}`}>
        Built with ❤️ by Shivang Patel — Study smarter, not harder.
      </footer>

      <style jsx>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          10%, 90% { opacity: 1; }
        }
        .animate-fadeInOut {
          animation: fadeInOut 2.5s ease-in-out forwards;
        }
      `}</style>
    </main>
  );
}
