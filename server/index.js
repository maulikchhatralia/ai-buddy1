const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve React build
app.use(express.static(path.join(__dirname, '../build')));

// API endpoints
app.post('/api/ask', async (req, res) => {
  const { prompt, context } = req.body;
  res.json({ answer: `Mocked answer to: "${prompt}"` });
});

app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  const tokenRes = await axios.post(
    'https://<your-region>.api.cognitive.microsoft.com/sts/v1.0/issueToken',
    null,
    { headers: { 'Ocp-Apim-Subscription-Key': '<your-azure-key>' } }
  );
  const token = tokenRes.data;

  const ssml = `<speak version='1.0' xml:lang='en-US'><voice name='en-US-AriaNeural'>${text}</voice></speak>`;
  const ttsRes = await axios.post(
    'https://<your-region>.tts.speech.microsoft.com/cognitiveservices/v1',
    ssml,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
      },
      responseType: 'arraybuffer',
    }
  );

  res.setHeader('Content-Type', 'audio/mpeg');
  res.send(ttsRes.data);
});

// Fallback route
// app.get('*', (req, res) => {
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(5000, () => console.log('✅ Server running at http://localhost:5000'));
