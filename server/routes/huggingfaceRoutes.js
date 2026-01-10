const express = require('express');
const router = express.Router();
const axios = require('axios');

// POST route to generate text using Hugging Face Inference API
router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Hugging Face API configuration
    const model = req.body.model || 'tiiuae/Falcon-H1R-7B'; // Default to Falcon if no model specified
    const HF_API_URL = `https://api-inference.huggingface.co/models/${model}`;
    const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;

    if (!HF_API_KEY) {
      return res
        .status(500)
        .json({ error: 'Hugging Face API key not configured' });
    }

    // Call Hugging Face Inference API
    const response = await axios.post(
      HF_API_URL,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.7,
          return_full_text: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    // Extract the generated text from the response
    const generatedText = response.data[0]?.generated_text || '';

    res.json({ response: generatedText });
  } catch (error) {
    console.error('Error calling Hugging Face API:', error);

    // Return a user-friendly error message
    if (error.response?.status === 503) {
      return res.status(503).json({
        error: 'Model is currently loading. Please try again in a moment.',
      });
    }

    res.status(500).json({
      error: 'Failed to generate response. Please try again later.',
    });
  }
});

module.exports = router;
