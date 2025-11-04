import React, { useState } from 'react';
import {
  Globe,
  Database,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  Target,
  Layers,
  ArrowRight,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ContentSyncTab = ({
  globalContent,
  setGlobalContent,
  syncSettings,
  setSyncSettings,
  onSyncContent,
  modules,
  lessons,
}) => {
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [selectedModules, setSelectedModules] = useState([]);
  const [globalBlockType, setGlobalBlockType] = useState('text');
  const [globalBlockContent, setGlobalBlockContent] = useState('');

  // Handle sync settings change
  const handleSyncSettingChange = (setting, value) => {
    setSyncSettings(prev => ({
      ...prev,
      [setting]: value,
    }));
  };

  // Add global content block
  const addGlobalContent = async () => {
    if (!globalBlockContent.trim()) return;

    const globalBlock = {
      id: `global-${Date.now()}`,
      type: globalBlockType,
      content: globalBlockContent,
      createdAt: new Date().toISOString(),
      appliedToModules:
        selectedModules.length > 0 ? selectedModules : modules.map(m => m.id),
    };

    setGlobalContent(prev => ({
      ...prev,
      blocks: [...(prev.blocks || []), globalBlock],
    }));

    // Sync to selected modules
    setSyncStatus('syncing');
    try {
      await onSyncContent({
        type: 'global',
        blockType: globalBlockType,
        content: globalBlockContent,
        targetModules: selectedModules.length > 0 ? selectedModules : 'all',
      });
      setSyncStatus('success');
      setGlobalBlockContent('');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  // Sync existing content across modules
  const syncExistingContent = async (sourceModuleId, targetModuleIds) => {
    setSyncStatus('syncing');
    try {
      await onSyncContent({
        type: 'module',
        sourceModuleId,
        targetModuleIds,
      });
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  // Get lessons count by module
  const getLessonsCount = moduleId => {
    return lessons.filter(l => l.moduleId === moduleId).length;
  };

  return (
    <div className="p-6 overflow-y-auto h-full bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Content Synchronization
          </h3>
          <p className="text-gray-600">
            Manage content that should be shared across multiple modules and
            lessons.
          </p>
        </div>

        {/* Sync Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Synchronization Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">
                  Auto-sync across modules
                </h4>
                <p className="text-sm text-gray-500">
                  Automatically apply content changes to all modules
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={syncSettings.syncAcrossModules}
                  onChange={e =>
                    handleSyncSettingChange(
                      'syncAcrossModules',
                      e.target.checked
                    )
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Auto-save changes</h4>
                <p className="text-sm text-gray-500">
                  Automatically save content changes to backend
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={syncSettings.autoSave}
                  onChange={e =>
                    handleSyncSettingChange('autoSave', e.target.checked)
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Real-time sync</h4>
                <p className="text-sm text-gray-500">
                  Sync changes in real-time as you type
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={syncSettings.realTimeSync}
                  onChange={e =>
                    handleSyncSettingChange('realTimeSync', e.target.checked)
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Global Content Creator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Create Global Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Create content that will be added to multiple modules at once.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <select
                  value={globalBlockType}
                  onChange={e => setGlobalBlockType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="text">Text Block</option>
                  <option value="statement">Important Statement</option>
                  <option value="quote">Quote</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="link">Link</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apply to Modules
                </label>
                <select
                  multiple
                  value={selectedModules}
                  onChange={e =>
                    setSelectedModules(
                      Array.from(
                        e.target.selectedOptions,
                        option => option.value
                      )
                    )
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  size={Math.min(modules.length, 4)}
                >
                  {modules.map(module => (
                    <option key={module.id} value={module.id}>
                      {module.title} ({getLessonsCount(module.id)} lessons)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Hold Ctrl/Cmd to select multiple. Leave empty to apply to all
                  modules.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={globalBlockContent}
                onChange={e => setGlobalBlockContent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                rows={4}
                placeholder="Enter the content that should be added to all selected modules..."
              />
            </div>

            <Button
              onClick={addGlobalContent}
              disabled={!globalBlockContent.trim() || syncStatus === 'syncing'}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {syncStatus === 'syncing' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing Content...
                </>
              ) : syncStatus === 'success' ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Content Synced!
                </>
              ) : syncStatus === 'error' ? (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Sync Failed - Retry
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Add to{' '}
                  {selectedModules.length > 0
                    ? `${selectedModules.length} Modules`
                    : 'All Modules'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Module-to-Module Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5" />
              Copy Content Between Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Copy all content from one module to another.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Module
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                  <option value="">Select source module</option>
                  {modules.map(module => (
                    <option key={module.id} value={module.id}>
                      {module.title} ({getLessonsCount(module.id)} lessons)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Module(s)
                </label>
                <select
                  multiple
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  size={Math.min(modules.length, 3)}
                >
                  {modules.map(module => (
                    <option key={module.id} value={module.id}>
                      {module.title} ({getLessonsCount(module.id)} lessons)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
              disabled={syncStatus === 'syncing'}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Module Content
            </Button>
          </CardContent>
        </Card>

        {/* Global Content History */}
        {globalContent.blocks && globalContent.blocks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Global Content History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {globalContent.blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          {block.type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(block.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {typeof block.content === 'string'
                          ? block.content
                          : JSON.stringify(block.content)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Applied to: {block.appliedToModules?.length || 0}{' '}
                        modules
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sync Status */}
        {syncStatus !== 'idle' && (
          <Card
            className={`border-l-4 ${
              syncStatus === 'success'
                ? 'border-green-500 bg-green-50'
                : syncStatus === 'error'
                  ? 'border-red-500 bg-red-50'
                  : 'border-blue-500 bg-blue-50'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {syncStatus === 'syncing' && (
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                )}
                {syncStatus === 'success' && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
                {syncStatus === 'error' && (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span
                  className={`text-sm font-medium ${
                    syncStatus === 'success'
                      ? 'text-green-800'
                      : syncStatus === 'error'
                        ? 'text-red-800'
                        : 'text-blue-800'
                  }`}
                >
                  {syncStatus === 'syncing' &&
                    'Synchronizing content across modules...'}
                  {syncStatus === 'success' &&
                    'Content synchronized successfully!'}
                  {syncStatus === 'error' &&
                    'Failed to synchronize content. Please try again.'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ContentSyncTab;
