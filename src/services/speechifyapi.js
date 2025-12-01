import axios from 'axios';

const SPEECHIFY_API_URL = 'http://localhost:5000/speechify';

/**
 * Converts text to speech using the backend speechify endpoint
 * @param {string} text - The text to convert to speech
 * @param {string} voice - The voice ID to use (e.g., "21m00Tcm4TlvDq8ikWAM")
 * @returns {Promise<Blob>} - Returns a Blob containing the MP3 audio data
 */
export async function speechify(text, voice) {
  try {
    const response = await axios.post(
      SPEECHIFY_API_URL,
      {
        text,
        voice,
      },
      {
        responseType: 'blob', // Important: expect binary data (MP3)
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Return the blob directly - the response.data is already a Blob when responseType is 'blob'
    return response.data;
  } catch (error) {
    console.error('Speechify API error:', error);

    let errorMessage = 'Failed to generate speech. Please try again.';

    // Handle blob error responses - try to extract error message
    if (error.response?.data instanceof Blob) {
      // For blob responses, we'll use a generic error message
      // The backend should ideally return proper error codes
      errorMessage = `Server error (${error.response.status}): ${error.response.statusText || 'Failed to generate speech'}`;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
}

/**
 * Creates an object URL from a Blob for audio playback
 * @param {Blob} audioBlob - The audio blob from speechify
 * @returns {string} - Object URL that can be used in an audio element
 */
export function createAudioUrl(audioBlob) {
  return URL.createObjectURL(audioBlob);
}

/**
 * Revokes an object URL to free up memory
 * @param {string} url - The object URL to revoke
 */
export function revokeAudioUrl(url) {
  if (url) {
    URL.revokeObjectURL(url);
  }
}
