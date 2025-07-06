import ReactDOM from 'react-dom'
import React from 'react';
import ChatBot from './App';
import 'bootstrap/dist/css/bootstrap.min.css';

import { createRoot } from 'react-dom/client'; // New import


// ReactDOM.render(
//   <React.StrictMode>
//     <ChatBot />
//   </React.StrictMode>,
//   document.getElementById('root')
// );


const container = document.getElementById('root');
const root = createRoot(container); // Create a root
root.render(<ChatBot />); // Render your App component