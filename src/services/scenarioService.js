// Service to handle scenario-related API calls
import { getAuthHeader } from './authHeader';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  };
  console.log('Auth headers being sent:', headers);
  return headers;
};

/**
 * Create a new scenario
 * @param {Object} scenarioData - The scenario data to create
 * @returns {Promise<Object>} The created scenario
 */
export async function createScenario(scenarioData) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scenario`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(scenarioData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create scenario: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error creating scenario:', error);
    throw error;
  }
}

/**
 * Update an existing scenario
 * @param {string} scenarioId - The ID of the scenario to update
 * @param {Object} scenarioData - The updated scenario data
 * @returns {Promise<Object>} The updated scenario
 */
export async function updateScenario(scenarioId, scenarioData) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scenario/${scenarioId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(scenarioData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update scenario: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error updating scenario:', error);
    throw error;
  }
}

/**
 * Delete a scenario
 * @param {string} scenarioId - The ID of the scenario to delete
 * @returns {Promise<void>}
 */
export async function deleteScenario(scenarioId) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scenario/${scenarioId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete scenario: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting scenario:', error);
    throw error;
  }
}

/**
 * Fetches all scenarios for a specific module
 * @param {string} moduleId - The ID of the module to fetch scenarios for
 * @returns {Promise<Array>} Array of scenario objects
 * @throws {Error} If the request fails or returns an error
 */
export async function fetchScenariosByModule(moduleId) {
  if (!moduleId) {
    throw new Error('Module ID is required to fetch scenarios');
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/scenario/modules/${moduleId}/scenarios`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      }
    );

    const responseData = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      const errorMessage = responseData.message || `Failed to fetch scenarios for module (${response.status})`;
      console.error('Error fetching scenarios:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData
      });
      throw new Error(errorMessage);
    }

    // Normalize to consistent shape with id and module_id
    if (Array.isArray(responseData.data)) {
      return responseData.data.map((s) => ({
        ...s,
        id: s.id || s.scenarioId,
        scenarioId: s.scenarioId || s.id,
        module_id: moduleId,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error in fetchScenariosByModule:', error);
    throw error;
  }
}

/**
 * Fetches all scenarios
 * @returns {Promise<Array>} Array of all scenario objects
 */
export async function fetchAllScenarios() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scenario/scenarios`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch all scenarios');
    }
    
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching all scenarios:', error);
    throw error;
  }
}

/**
 * Get scenario details by ID
 * @param {string} scenarioId - The ID of the scenario
 * @returns {Promise<Object>} Scenario details
 */
export async function getScenarioById(scenarioId) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scenario/${scenarioId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch scenario: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching scenario by id:', error);
    throw error;
  }
}

/**
 * Get scenario decisions by scenario ID
 * @param {string} scenarioId - The ID of the scenario
 * @returns {Promise<Array>} Array of scenario decisions
 */
export async function getScenarioDecisions(scenarioId) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scenario/${scenarioId}/decisions`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch scenario decisions: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching scenario decisions:', error);
    throw error;
  }
}

/**
 * Save scenario decisions
 * @param {string} scenarioId - The ID of the scenario
 * @param {Object} decisionsData - The decisions data to save
 * @returns {Promise<Object>} The saved decisions
 */
export async function saveScenarioDecisions(scenarioId, decisionsData) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scenario/${scenarioId}/decisions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(decisionsData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to save scenario decisions: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error saving scenario decisions:', error);
    throw error;
  }
}

/**
 * Submit scenario response
 * @param {string} scenarioId - The ID of the scenario
 * @param {Object} responses - The user's responses to the scenario
 * @returns {Promise<Object>} The submission result
 */
export async function submitScenario(scenarioId, responses = {}) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scenario/${scenarioId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ responses }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to submit scenario: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error submitting scenario:', error);
    throw error;
  }
}
