import React, { useEffect, useState, useRef } from 'react';
import './App.css'; // Optional: for custom styles

const ChatBot = () => {
  const [playingIndex, setPlayingIndex] = useState(null);
  const [components] = useState(['HR', 'Finance', 'Engineering']);
  const [selectedComponent, setSelectedComponent] = useState('HR');
  const [documents, setDocuments] = useState({});
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const audioRef = useRef(null);
  const gifRef = useRef(null);

  // Fetch documents (.txt, .pdf, .docx parsed on server)
  useEffect(() => {
    const fetchDocs = async () => {
      const newDocs = {};
      for (const type of components) {
        try {
          const res = await fetch(`/api/docs/${type}`);
          const text = await res.text();
          newDocs[type] = text;
        } catch (err) {
          newDocs[type] = 'Document not found or unreadable.';
        }
      }
      setDocuments(newDocs);
    };
    fetchDocs();
  }, [components]);

  // Ask question to backend
  const handleAsk = async () => {
    if (!prompt.trim()) return;

    const context = documents[selectedComponent];
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context }),
    });
    const data = await res.json();
    const answer = data.answer || 'No response';

    setChatHistory(prev => [...prev, { question: prompt, answer }]);
    setPrompt('');
  };

  // Play audio from text
  const handlePlayAudio = async (text, index) => {
  // Stop existing audio if any
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }

  // If clicked the same one that's already playing → toggle off
  if (playingIndex === index) {
    setPlayingIndex(null);
    return;
  }

  // Fetch audio
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const blob = await res.blob();
  const audioURL = URL.createObjectURL(blob);

  const audio = new Audio(audioURL);
  audioRef.current = audio;

  // Play new audio
  setPlayingIndex(index);
  audio.play();

  audio.onended = () => {
    setPlayingIndex(null); // Reset when done
  };
};

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">🤖 AI Buddy</h2>

      <div className="mb-3">
        <label>Select Component:</label>
        <select
          className="form-select"
          value={selectedComponent}
          onChange={(e) => setSelectedComponent(e.target.value)}
        >
          {components.map((comp) => (
            <option key={comp} value={comp}>{comp}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label>Ask a question:</label>
        <input
          className="form-control"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask something about the selected document..."
        />
        <button className="btn btn-primary mt-2" onClick={handleAsk}>Ask</button>
      </div>

      <div>
        <h5>Chat History</h5>
        {chatHistory.map((item, idx) => (
          <div key={idx} className="card mb-3">
            <div className="card-body">
              <p><strong>Q:</strong> {item.question}</p>
              <p><strong>A:</strong> {item.answer}</p>
              <div className="d-flex align-items-center gap-3">
                 <button
    className="btn btn-sm btn-success"
    onClick={() => handlePlayAudio(item.answer, idx)}
  >
    {playingIndex === idx ? '⏸️ Pause' : '🔊 Play'}
  </button>

                {/* Animated TV Component */}
                 <div className="tv-frame" style={{ width: '100px', position: 'relative' }}>
    <img
      id={`gif-${idx}`}
        src="/ai-speaking.gif"
        alt="AI Buddy"
      style={{
        width: '100%',
        visibility: playingIndex === idx ? 'visible' : 'hidden',
      }}
    />
  </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <hr />
      {/* <h6>📄 Raw Document Preview:</h6>
      <pre style={{ background: '#f9f9f9', padding: '10px', maxHeight: '200px', overflowY: 'auto' }}>
        {documents[selectedComponent]}
      </pre> */}
    </div>
  );
};

export default ChatBot;
