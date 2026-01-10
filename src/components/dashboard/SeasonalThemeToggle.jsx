import React, { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { SeasonalThemeContext } from '@/contexts/SeasonalThemeContext';
import { seasonalThemeConfig } from '@/config/seasonalThemeConfig';
import { Palette } from 'lucide-react';
import { motion } from 'framer-motion';

export function SeasonalThemeToggle() {
  const { activeTheme, isEnabled, setTheme } = useContext(SeasonalThemeContext);

  // Don't render if theme system is disabled
  if (!isEnabled) {
    return null;
  }

  // Get the configured seasonal theme from config
  const seasonalTheme = seasonalThemeConfig.activeTheme || 'active';
  
  // Determine if seasonal theme is currently active
  const isSeasonalThemeActive = activeTheme === seasonalTheme;
  
  // Toggle between seasonal theme and default
  const handleToggle = () => {
    if (isSeasonalThemeActive) {
      setTheme('default');
    } else {
      setTheme(seasonalTheme);
    }
  };

  // Get the icon and label based on current state
  const getThemeDisplay = () => {
    if (isSeasonalThemeActive) {
      // Show seasonal theme info
      const themeMap = {
        active: { icon: '', label: 'Active' },
      };
      return themeMap[seasonalTheme] || { icon: '', label: 'Active' };
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        className="flex items-center gap-2 border-gray-200 hover:bg-gray-50"
        title="Apply Active Theme"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden md:inline text-xs font-medium">
          Change Theme
        </span>
      </Button>
    </motion.div>
  );
}

export default SeasonalThemeToggle;
