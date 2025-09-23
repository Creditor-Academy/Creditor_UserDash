# AI-Powered Course Creator Setup

## Environment Configuration

### 1. Backend Environment Variables
Create `.env` file in backend directory:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/creditor_db

# JWT Secret  
JWT_SECRET=your-super-secret-jwt-key-here

# AI Service Configuration
AI_API_KEY=your-ai-service-key-here
AI_PROVIDER_NAME=AI_SERVICE
AI_BASE_URL=https://api.ai-service.com
AI_API_VERSION=v2

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 2. AI Service Setup
The application uses a generic AI service interface that can work with multiple providers.

**For Development:**
- Set `VITE_BYTEZ_KEY` to your Bytez AI service key in `.env.development`
- All AI implementation details are handled by the deployed backend
- Frontend uses deployed backend APIs via `VITE_API_BASE_URL`

**For Production:**
- Use environment variables for all sensitive configuration
- Never commit actual API keys or provider details
- The frontend only sees generic "AI Assistant" responses

## Security Features

### 1. Hidden AI Implementation
- ✅ All AI models and providers are abstracted behind proxy endpoints
- ✅ Frontend code contains no AI service implementation details  
- ✅ Model names and API calls are hidden from client-side inspection
- ✅ Configuration is environment-based and excluded from Git

### 2. Git Security
Files excluded from version control:
- `.env` files (API keys)
- `ai-config.json` (model configurations)
- `bytez-config.js` (provider-specific settings)
- `**/bytezAPI.js` (direct API implementations)

## API Endpoints

### Public AI Proxy Endpoints
```
POST /api/ai-proxy/summarize    - Text summarization
POST /api/ai-proxy/question     - Question answering  
POST /api/ai-proxy/image        - Image generation
GET  /api/ai-proxy/status       - Service health
```

### Response Format
All endpoints return generic responses without exposing implementation:
```json
{
  "success": true,
  "data": "...",
  "model": "AI Assistant"
}
```

## Development Notes

- Frontend uses `aiProxyService.js` instead of direct AI SDK calls
- All AI operations go through backend proxy for security
- Fallback mechanisms ensure functionality even when AI services fail
- No AI provider names or model details visible in browser dev tools

## Deployment

1. Set environment variables on your hosting platform
2. Ensure `.env` files are not deployed
3. Configure AI service credentials securely
4. All AI implementation details remain server-side only
