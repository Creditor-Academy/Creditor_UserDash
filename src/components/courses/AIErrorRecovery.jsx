import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Server, 
  Key, 
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AIErrorRecovery = ({ 
  errors = [], 
  onRetry, 
  onFallback, 
  showFallbackOption = true,
  className = '' 
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [apiStatus, setApiStatus] = useState({});

  // Error categorization
  const categorizeErrors = (errors) => {
    const categories = {
      network: [],
      rateLimit: [],
      authentication: [],
      payment: [],
      server: [],
      other: []
    };

    errors.forEach(error => {
      const message = error.message || error.toString();
      
      if (message.includes('ERR_CONNECTION_REFUSED') || message.includes('Network Error')) {
        categories.network.push(error);
      } else if (message.includes('429') || message.includes('Too Many Requests')) {
        categories.rateLimit.push(error);
      } else if (message.includes('401') || message.includes('Unauthorized')) {
        categories.authentication.push(error);
      } else if (message.includes('402') || message.includes('Payment Required')) {
        categories.payment.push(error);
      } else if (message.includes('500') || message.includes('Bad Request')) {
        categories.server.push(error);
      } else {
        categories.other.push(error);
      }
    });

    return categories;
  };

  const errorCategories = categorizeErrors(errors);
  const hasErrors = errors.length > 0;
  const totalErrors = errors.length;

  // Check connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('checking');
        
        // Check if we can reach the internet
        const response = await fetch('https://httpbin.org/status/200', { 
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache'
        });
        
        setConnectionStatus('online');
      } catch (error) {
        setConnectionStatus('offline');
      }
    };

    if (hasErrors) {
      checkConnection();
    }
  }, [hasErrors]);

  // Handle retry with loading state
  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      if (onRetry) {
        await onRetry();
      }
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  // Get error icon and color
  const getErrorInfo = (category) => {
    const errorMap = {
      network: { icon: WifiOff, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
      rateLimit: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
      authentication: { icon: Key, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
      payment: { icon: Shield, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
      server: { icon: Server, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
      other: { icon: AlertTriangle, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' }
    };
    return errorMap[category] || errorMap.other;
  };

  // Get recovery suggestions
  const getRecoverySuggestions = (category) => {
    const suggestions = {
      network: [
        'Check your internet connection',
        'Restart your development server',
        'Verify Vite configuration',
        'Check if ports 3000/3001 are available'
      ],
      rateLimit: [
        'Wait a few minutes before retrying',
        'Switch to a different AI provider',
        'Use fallback content generation',
        'Check your API usage limits'
      ],
      authentication: [
        'Verify your API keys are correct',
        'Check environment variables',
        'Ensure API keys are not expired',
        'Restart the development server'
      ],
      payment: [
        'Check your API subscription status',
        'Verify billing information',
        'Switch to free tier models',
        'Use alternative AI providers'
      ],
      server: [
        'Check backend server status',
        'Verify API endpoint URLs',
        'Review request payload format',
        'Check server logs for details'
      ],
      other: [
        'Review error details',
        'Check console for more information',
        'Try refreshing the page',
        'Contact support if issue persists'
      ]
    };
    return suggestions[category] || suggestions.other;
  };

  if (!hasErrors) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`space-y-4 ${className}`}
      >
        {/* Main Error Card */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              AI Service Issues Detected
              <Badge variant="destructive" className="ml-2">
                {totalErrors} error{totalErrors > 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {connectionStatus === 'checking' && (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-sm text-blue-600">Checking connection...</span>
                  </>
                )}
                {connectionStatus === 'online' && (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Internet connection: OK</span>
                  </>
                )}
                {connectionStatus === 'offline' && (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">Internet connection: Failed</span>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  variant="outline"
                  size="sm"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry AI Generation
                    </>
                  )}
                </Button>
                
                {showFallbackOption && onFallback && (
                  <Button
                    onClick={onFallback}
                    variant="secondary"
                    size="sm"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Use Fallback Content
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Categories */}
        <div className="grid gap-4">
          {Object.entries(errorCategories).map(([category, categoryErrors]) => {
            if (categoryErrors.length === 0) return null;
            
            const errorInfo = getErrorInfo(category);
            const Icon = errorInfo.icon;
            const suggestions = getRecoverySuggestions(category);

            return (
              <Card key={category} className={`${errorInfo.border} ${errorInfo.bg}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${errorInfo.color} text-sm`}>
                    <Icon className="w-4 h-4" />
                    {category.charAt(0).toUpperCase() + category.slice(1)} Issues
                    <Badge variant="outline" className="ml-2">
                      {categoryErrors.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Error Messages */}
                    <div className="space-y-1">
                      {categoryErrors.slice(0, 3).map((error, index) => (
                        <Alert key={index} className="py-2">
                          <Info className="w-4 h-4" />
                          <AlertDescription className="text-xs">
                            {error.message || error.toString()}
                          </AlertDescription>
                        </Alert>
                      ))}
                      {categoryErrors.length > 3 && (
                        <p className="text-xs text-gray-500">
                          ...and {categoryErrors.length - 3} more similar errors
                        </p>
                      )}
                    </div>

                    {/* Recovery Suggestions */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-2">
                        Suggested Solutions:
                      </h4>
                      <ul className="space-y-1">
                        {suggestions.slice(0, 3).map((suggestion, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                            <CheckCircle className="w-3 h-3 mt-0.5 text-green-500 flex-shrink-0" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recovery Tips */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Quick Recovery Tips:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Most AI service issues are temporary and resolve automatically</li>
                  <li>• Fallback content generation always works as a backup option</li>
                  <li>• Check the browser console for detailed error information</li>
                  <li>• Restart the development server if connection issues persist</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIErrorRecovery;
