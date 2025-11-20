"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Bonjour ! 👋 Comment puis-je vous aider avec ViteviteApp ?",
    },
  ]);
  const [input, setInput] = useState("");

  const quickQuestions = [
    "Comment prendre un ticket ?",
    "Quels documents pour la mairie ?",
    "Où se trouvent les services ?",
    "Comment annuler mon ticket ?",
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);

    // Réponse automatique simple
    setTimeout(() => {
      const botResponse = {
        role: "assistant",
        content: generateResponse(input),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 500);

    setInput("");
  };

  const generateResponse = (question: string) => {
    const q = question.toLowerCase();
    
    if (q.includes("ticket")) {
      return "Pour prendre un ticket, allez sur la page Services, choisissez votre service et cliquez sur 'Prendre un ticket'. C'est rapide et gratuit ! 🎫";
    } else if (q.includes("document")) {
      return "Les documents requis varient selon le service. Consultez la fiche du service pour voir la liste complète des documents nécessaires. 📄";
    } else if (q.includes("où") || q.includes("adresse")) {
      return "Tous nos services partenaires sont situés à Abidjan. L'adresse exacte est indiquée sur chaque fiche service. 📍";
    } else if (q.includes("annuler")) {
      return "Vous pouvez annuler votre ticket depuis votre tableau de bord tant qu'il n'est pas encore appelé. ❌";
    } else {
      return "Je ne suis pas sûr de comprendre. Essayez de reformuler votre question ou contactez notre support. 💬";
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all z-50 flex items-center justify-center"
        aria-label="Chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-x-4 bottom-24 lg:right-6 lg:bottom-6 lg:left-auto lg:w-96 z-50">
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col h-[70vh] lg:h-[600px] overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="font-bold">Assistant ViteviteApp</h3>
                    <div className="flex items-center space-x-1 text-xs">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span>En ligne</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white"
                          : "bg-white border border-gray-200 text-gray-900"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex items-center space-x-2 mb-2">
                          <span>🤖</span>
                          <span className="text-xs font-semibold text-gray-500">Assistant</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {messages.length === 1 && (
                  <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4">
                    <p className="text-sm text-purple-900 font-semibold mb-3">
                      💡 Questions fréquentes
                    </p>
                    <div className="space-y-2">
                      {quickQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setInput(q);
                            handleSend();
                          }}
                          className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-purple-100 transition text-sm"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white border-t">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Votre question..."
                    className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}