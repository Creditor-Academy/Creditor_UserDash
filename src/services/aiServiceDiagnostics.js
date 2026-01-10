/**
 * AI Service Diagnostics Utility
 *
 * This utility helps diagnose AI service issues by testing all endpoints
 * and providing detailed feedback about what's working and what's not.
 *
 * Usage:
 *   import { runAIServiceDiagnostics } from './aiServiceDiagnostics';
 *   const results = await runAIServiceDiagnostics();
 *   console.log(results);
 */

import secureAIService from "./secureAIService";

/**
 * Run comprehensive diagnostics on AI service
 * @returns {Promise<Object>} Diagnostic results
 */
export async function runAIServiceDiagnostics() {
  const results = {
    timestamp: new Date().toISOString(),
    overall: {
      status: "unknown",
      message: "",
      score: 0,
      totalChecks: 0,
      passedChecks: 0,
    },
    checks: [],
    recommendations: [],
  };

  console.log("🔍 Starting AI Service Diagnostics...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Check 1: Backend URL Configuration
  const backendUrlCheck = checkBackendUrl();
  results.checks.push(backendUrlCheck);
  results.overall.totalChecks++;

  // Check 2: Authentication Token
  const authCheck = checkAuthentication();
  results.checks.push(authCheck);
  results.overall.totalChecks++;

  // Check 3: Backend Status Endpoint
  const statusCheck = await checkBackendStatus();
  results.checks.push(statusCheck);
  results.overall.totalChecks++;

  // Check 4: Text Generation Endpoint (Quick Test)
  const textGenCheck = await checkTextGeneration();
  results.checks.push(textGenCheck);
  results.overall.totalChecks++;

  // Check 5: Image Generation Endpoint (Quick Test)
  const imageGenCheck = await checkImageGeneration();
  results.checks.push(imageGenCheck);
  results.overall.totalChecks++;

  // Calculate overall status
  results.overall.passedChecks = results.checks.filter((c) => c.passed).length;
  results.overall.score = Math.round(
    (results.overall.passedChecks / results.overall.totalChecks) * 100,
  );

  if (results.overall.score === 100) {
    results.overall.status = "healthy";
    results.overall.message = "All AI services are working correctly! ✅";
  } else if (results.overall.score >= 60) {
    results.overall.status = "degraded";
    results.overall.message =
      "Some AI services have issues. Check individual checks below. ⚠️";
  } else {
    results.overall.status = "unhealthy";
    results.overall.message =
      "Multiple AI services are not working. Immediate attention required! ❌";
  }

  // Generate recommendations
  results.recommendations = generateRecommendations(results.checks);

  // Print summary
  printDiagnosticSummary(results);

  return results;
}

/**
 * Check if backend URL is configured
 */
function checkBackendUrl() {
  const check = {
    name: "Backend URL Configuration",
    passed: false,
    message: "",
    details: {},
  };

  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";
  check.details.apiBase = apiBase;

  if (!apiBase || apiBase === "undefined") {
    check.message = "Backend URL not configured (VITE_API_BASE_URL missing)";
    check.recommendation =
      "Set VITE_API_BASE_URL in your .env file (e.g., http://localhost:9000)";
  } else if (apiBase.includes("localhost") || apiBase.includes("127.0.0.1")) {
    check.passed = true;
    check.message = "Backend URL configured (local development)";
  } else {
    check.passed = true;
    check.message = "Backend URL configured";
  }

  return check;
}

/**
 * Check if authentication token exists
 */
function checkAuthentication() {
  const check = {
    name: "Authentication Token",
    passed: false,
    message: "",
    details: {},
  };

  const token = localStorage.getItem("token");
  check.details.hasToken = !!token;
  check.details.tokenLength = token ? token.length : 0;

  if (!token) {
    check.message = "No authentication token found";
    check.recommendation = "Please login to access AI features";
  } else if (token.length < 10) {
    check.message = "Token appears to be invalid (too short)";
    check.recommendation = "Please login again to refresh your token";
  } else {
    check.passed = true;
    check.message = "Authentication token found";
  }

  return check;
}

/**
 * Check backend status endpoint
 */
async function checkBackendStatus() {
  const check = {
    name: "Backend Status Endpoint",
    passed: false,
    message: "",
    details: {},
    duration: 0,
  };

  try {
    const startTime = Date.now();
    const status = await secureAIService.getStatus();
    check.duration = Date.now() - startTime;
    check.details.status = status;

    if (status && status.available) {
      check.passed = true;
      check.message = `Backend is available (${check.duration}ms)`;
      check.details.aiAvailable = true;
    } else {
      check.message = "Backend status indicates AI service is not available";
      check.details.aiAvailable = false;
      check.recommendation =
        "Check backend AI configuration and service credentials";
    }
  } catch (error) {
    check.message = `Backend status check failed: ${error.message}`;
    check.details.error = error.message;
    check.details.stack = error.stack;
    check.recommendation =
      "Verify backend is running and /api/ai-proxy/status endpoint exists";
  }

  return check;
}

/**
 * Test text generation endpoint
 */
async function checkTextGeneration() {
  const check = {
    name: "Text Generation Endpoint",
    passed: false,
    message: "",
    details: {},
    duration: 0,
  };

  try {
    const testPrompt = 'Say "test" and nothing else.';
    const startTime = Date.now();
    const result = await secureAIService.generateText(testPrompt, {
      maxTokens: 10,
      skipStatusCheck: true, // Skip status check to test endpoint directly
    });
    check.duration = Date.now() - startTime;

    if (result && typeof result === "string" && result.length > 0) {
      check.passed = true;
      check.message = `Text generation works (${check.duration}ms)`;
      check.details.responseLength = result.length;
      check.details.responsePreview = result.substring(0, 50);
    } else {
      check.message = "Text generation returned invalid response";
      check.details.result = result;
    }
  } catch (error) {
    check.message = `Text generation failed: ${error.message}`;
    check.details.error = error.message;
    check.details.stack = error.stack;

    if (error.message.includes("401")) {
      check.recommendation = "Authentication required. Please login.";
    } else if (error.message.includes("500")) {
      check.recommendation = "Backend server error. Check backend logs.";
    } else if (error.message.includes("Network")) {
      check.recommendation =
        "Network error. Check internet connection and backend URL.";
    } else {
      check.recommendation = "Check backend AI configuration and credentials.";
    }
  }

  return check;
}

/**
 * Test image generation endpoint
 */
async function checkImageGeneration() {
  const check = {
    name: "Image Generation Endpoint",
    passed: false,
    message: "",
    details: {},
    duration: 0,
  };

  try {
    const testPrompt = "A simple red circle";
    const startTime = Date.now();
    const result = await secureAIService.generateImage(testPrompt, {
      size: "256x256", // Smaller size for faster test
      skipStatusCheck: true, // Skip status check to test endpoint directly
    });
    check.duration = Date.now() - startTime;

    if (result && result.success && result.url) {
      check.passed = true;
      check.message = `Image generation works (${check.duration}ms)`;
      check.details.hasUrl = true;
      check.details.hasS3Url = result.uploadedToS3 || false;
    } else {
      check.message = "Image generation returned invalid response";
      check.details.result = result;
    }
  } catch (error) {
    check.message = `Image generation failed: ${error.message}`;
    check.details.error = error.message;
    check.details.stack = error.stack;

    if (error.message.includes("401")) {
      check.recommendation = "Authentication required. Please login.";
    } else if (error.message.includes("500")) {
      check.recommendation = "Backend server error. Check backend logs.";
    } else if (error.message.includes("Network")) {
      check.recommendation =
        "Network error. Check internet connection and backend URL.";
    } else if (error.message.includes("unavailable")) {
      check.recommendation =
        "AI service unavailable. Check backend configuration.";
    } else {
      check.recommendation = "Check backend AI configuration and credentials.";
    }
  }

  return check;
}

/**
 * Generate recommendations based on check results
 */
function generateRecommendations(checks) {
  const recommendations = [];

  // Check for common issues
  const backendUrlCheck = checks.find(
    (c) => c.name === "Backend URL Configuration",
  );
  if (backendUrlCheck && !backendUrlCheck.passed) {
    recommendations.push({
      priority: "high",
      issue: "Backend URL not configured",
      solution: "Set VITE_API_BASE_URL environment variable",
    });
  }

  const authCheck = checks.find((c) => c.name === "Authentication Token");
  if (authCheck && !authCheck.passed) {
    recommendations.push({
      priority: "high",
      issue: "No authentication token",
      solution: "Login to the application to get an authentication token",
    });
  }

  const statusCheck = checks.find((c) => c.name === "Backend Status Endpoint");
  if (statusCheck && !statusCheck.passed) {
    recommendations.push({
      priority: "high",
      issue: "Backend status endpoint not working",
      solution:
        "Verify backend is running and /api/ai-proxy/status endpoint exists and is accessible",
    });
  }

  const textCheck = checks.find((c) => c.name === "Text Generation Endpoint");
  if (textCheck && !textCheck.passed) {
    recommendations.push({
      priority: "medium",
      issue: "Text generation not working",
      solution: textCheck.recommendation || "Check backend AI configuration",
    });
  }

  const imageCheck = checks.find((c) => c.name === "Image Generation Endpoint");
  if (imageCheck && !imageCheck.passed) {
    recommendations.push({
      priority: "medium",
      issue: "Image generation not working",
      solution:
        imageCheck.recommendation ||
        "Check backend image generation configuration",
    });
  }

  return recommendations;
}

/**
 * Print diagnostic summary to console
 */
function printDiagnosticSummary(results) {
  console.log("\n📊 Diagnostic Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Overall Status: ${results.overall.status.toUpperCase()}`);
  console.log(
    `Score: ${results.overall.score}% (${results.overall.passedChecks}/${results.overall.totalChecks} checks passed)`,
  );
  console.log(`Message: ${results.overall.message}\n`);

  console.log("📋 Individual Checks:");
  results.checks.forEach((check, index) => {
    const icon = check.passed ? "✅" : "❌";
    const duration = check.duration ? ` (${check.duration}ms)` : "";
    console.log(
      `${icon} ${index + 1}. ${check.name}: ${check.message}${duration}`,
    );
    if (check.recommendation) {
      console.log(`   💡 Recommendation: ${check.recommendation}`);
    }
  });

  if (results.recommendations.length > 0) {
    console.log("\n💡 Recommendations:");
    results.recommendations.forEach((rec, index) => {
      const priorityIcon =
        rec.priority === "high"
          ? "🔴"
          : rec.priority === "medium"
            ? "🟡"
            : "🟢";
      console.log(
        `${priorityIcon} ${index + 1}. ${rec.issue}\n   → ${rec.solution}`,
      );
    });
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Diagnostics complete!\n");
}

/**
 * Quick health check (lightweight version)
 */
export async function quickHealthCheck() {
  try {
    const status = await secureAIService.getStatus();
    return {
      healthy: status?.available || false,
      message: status?.available
        ? "AI service is available"
        : "AI service is unavailable",
    };
  } catch (error) {
    return {
      healthy: false,
      message: `Health check failed: ${error.message}`,
    };
  }
}

// Auto-run diagnostics if imported in development
if (import.meta.env.DEV && import.meta.hot) {
  // Only run in browser console for manual testing
  window.runAIServiceDiagnostics = runAIServiceDiagnostics;
  window.quickAIServiceHealthCheck = quickHealthCheck;
  console.log(
    "💡 AI Service Diagnostics available:",
    "\n  - window.runAIServiceDiagnostics() for full diagnostics",
    "\n  - window.quickAIServiceHealthCheck() for quick check",
  );
}

export default {
  runAIServiceDiagnostics,
  quickHealthCheck,
};
