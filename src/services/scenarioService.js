// Scenario Service for handling scenario-related API calls
import { getAuthHeader } from './authHeader';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
  // Backend handles authentication via cookies
  return {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  };
};

/**
 * Create a new scenario
 * @param {Object} scenarioData - The scenario data to create
 * @param {string} scenarioData.moduleId - Module ID to associate scenario with
 * @param {string} scenarioData.title - Scenario title
 * @param {string} scenarioData.description - Scenario description
 * @param {number} scenarioData.max_attempts - Maximum attempts allowed
 * @param {string} scenarioData.avatar_url - Avatar image URL
 * @param {string} scenarioData.background_url - Background image URL
 * @returns {Promise<Object>} Created scenario data
 */
export async function createScenario(scenarioData) {
  try {
    const response = await fetch(`${API_BASE}/api/scenario/createscenario`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(scenarioData)
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
 * @returns {Promise<Object>} Updated scenario data
 */
export async function updateScenario(scenarioId, scenarioData) {
  try {
    const response = await fetch(`${API_BASE}/api/scenario/${scenarioId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(scenarioData)
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
 * Get scenario by ID
 * @param {string} scenarioId - The ID of the scenario
 * @returns {Promise<Object>} Scenario data
 */
export async function getScenarioById(scenarioId) {
  try {
    const response = await fetch(`${API_BASE}/api/scenario/${scenarioId}`, {
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
    console.error('Error fetching scenario:', error);
    throw error;
  }
}

/**
 * Get specific scenario with full details including decisions and choices
 * @param {string} scenarioId - The ID of the scenario
 * @returns {Promise<Object>} Complete scenario data with decisions
 */
export async function getSpecificScenario(scenarioId) {
  try {
    const response = await fetch(`${API_BASE}/api/scenario/${scenarioId}/getspecificscenario`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch specific scenario: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching specific scenario:', error);
    throw error;
  }
}

/**
 * Save scenario decisions
 * @param {string} scenarioId - The ID of the scenario
 * @param {Array} decisions - Array of decision objects
 * @returns {Promise<Object>} Response indicating success
 */
export async function saveScenarioDecisions(scenarioId, decisions) {
  try {
    const response = await fetch(`${API_BASE}/api/scenario/${scenarioId}/decisions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ decisions })
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
 * Bulk create decisions for a scenario
 * POST /api/scenario/{scenarioId}/createdecisions
 * Body: { decisions: [{ description, decisionOrder }] }
 */
export async function createDecisionsBulk(scenarioId, decisionsPayload) {
  try {
    const response = await fetch(`${API_BASE}/api/scenario/${scenarioId}/createdecisions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ decisions: decisionsPayload })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create decisions: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error creating decisions in bulk:', error);
    throw error;
  }
}

/**
 * Create choices for a decision (and link to next decisions when provided)
 * POST /api/scenario/admin/decisions/{decisionId}/choices
 * Body: { choices: [{ text, outcomeType, feedback, nextAction, nextDecisionId, points }] }
 */
export async function createDecisionChoices(decisionId, choicesPayload) {
  try {
    const response = await fetch(`${API_BASE}/api/scenario/admin/decisions/${decisionId}/choices`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ choices: choicesPayload })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create decision choices: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error creating decision choices:', error);
    throw error;
  }
}

/**
 * Get all scenarios for a module
 * @param {string} moduleId - The ID of the module
 * @returns {Promise<Array>} Array of scenario objects
 */
export async function getModuleScenarios(moduleId) {
  try {
    // Try preferred endpoint shape: /api/scenario/{moduleId}/allscenarios
    let url = `${API_BASE}/api/scenario/${moduleId}/allscenarios`;
    let response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    // If not found, try prefixed variant: /api/scenario/module-{moduleId}/allscenarios
    if (response.status === 404) {
      if (!String(moduleId).startsWith('module-')) {
        url = `${API_BASE}/api/scenario/module-${moduleId}/allscenarios`;
        response = await fetch(url, {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include',
        });
      }
    }

    // If still not found, fall back to older shape: /api/scenario/modules/{moduleId}/scenarios
    if (response.status === 404) {
      url = `${API_BASE}/api/scenario/modules/${moduleId}/scenarios`;
      response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
    }

    if (!response.ok) {
      // If still 404, treat as no scenarios rather than hard error
      if (response.status === 404) {
        return [];
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch module scenarios: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.data && Array.isArray(data.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  } catch (error) {
    console.error('Error fetching module scenarios:', error);
    throw error;
  }
}

/**
 * Get scenarios for a specific module using the new API endpoint
 * @param {string} moduleId - The ID of the module
 * @returns {Promise<Array>} Array of scenario objects
 */
export async function getModuleScenariosNew(moduleId) {
  try {
    const response = await fetch(`${API_BASE}/api/scenario/${moduleId}/allscenarios`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch module scenarios: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching module scenarios:', error);
    throw error;
  }
}

/**
 * Delete a scenario
 * @param {string} scenarioId - The ID of the scenario to delete
 * @returns {Promise<Object>} Response indicating success
 */
export async function deleteScenario(scenarioId) {
  try {
    const response = await fetch(`${API_BASE}/api/scenario/${scenarioId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete scenario: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error deleting scenario:', error);
    throw error;
  }
}