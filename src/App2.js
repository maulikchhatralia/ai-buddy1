
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const [documents, setDocuments] = useState({});
const [selectedComponent, setSelectedComponent] = useState('HR');

const COMPONENTS = ['HR', 'Finance', 'Engineering'];

const documents = {
  HR: 'HR document text here...',
  Finance: 'Finance document text here...',
  Engineering: 'Engineering document text here...'
};

const TVComponent = ({ playing }) => (
  <div className="tv-component text-center mb-4" style={{ position: 'relative' }}>
    <img
      src="/tv-frame.png"
      alt="TV Frame"
      style={{ width: '300px' }}
    />
    {playing && (
      <img
        src="/ai-speaking.gif"
        alt="AI Buddy"
        style={{
          position: 'absolute',
          top: '80px',
          left: '48%',
          transform: 'translateX(-50%)',
          width: '130px',
        }}
      />
    )}
  </div>
);

const ChatBot = () => {
  const [component, setComponent] = useState('HR');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [playingIndex, setPlayingIndex] = useState(null);
  const audioRefs = useRef([]);

  const handleAsk = async () => {
    if (!query.trim()) return;

    const context = messages.map(m => m.query + ' ' + m.answer).join(' ');
    const fullText = documents[component] + ' ' + context;

    const response = await axios.post('http://localhost:5000/api/ask', {
      prompt: query,
      context: fullText
    });

    setMessages([...messages, { query, answer: response.data.answer }]);
    setQuery('');
  };

  const playAudio = async (text, index) => {
    setPlayingIndex(index);

    audioRefs.current.forEach((ref, i) => {
      if (i !== index && ref) ref.pause();
    });

    const res = await axios.post('http://localhost:5000/api/tts', { text }, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);
    audioRefs.current[index] = audio;
    audio.play();

    audio.onended = () => {
      setPlayingIndex(null);
    };
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">AI Buddy</h1>

      <TVComponent playing={playingIndex !== null} />

      <div className="mb-3">
        <label>Select Component:</label>
        <select
          className="form-select"
          value={component}
          onChange={e => setComponent(e.target.value)}
        >
          {COMPONENTS.map(comp => (
            <option key={comp}>{comp}</option>
          ))}
        </select>
      </div>

      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask a question..."
        />
        <button className="btn btn-primary" onClick={handleAsk}>Ask</button>
      </div>

      <div>
        {messages.map((m, i) => (
          <div key={i} className="card mb-2">
            <div className="card-body">
              <p><strong>Q:</strong> {m.query}</p>
              <p><strong>A:</strong> {m.answer}</p>
              <button className="btn btn-outline-secondary" onClick={() => playAudio(m.answer, i)}>
                🔊 Play
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatBot;
