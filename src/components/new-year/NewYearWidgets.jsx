import React from 'react';
import { Target, TrendingUp, Award, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function NewYearWidgets() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Learning Goals Widget */}
      <Card className="newyear-widget-card dashboard-newyear-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-base">Goals for This Year</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Set and track your learning objectives for this year
          </p>
        </CardContent>
      </Card>

      {/* Progress Reset Indicator */}
      <Card className="newyear-widget-card dashboard-newyear-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <CardTitle className="text-base">Fresh Start</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            New year, new opportunities to excel
          </p>
        </CardContent>
      </Card>

      {/* Last Year Highlights */}
      <Card className="newyear-widget-card dashboard-newyear-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-base">Your Achievements</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Review your accomplishments from last year
          </p>
        </CardContent>
      </Card>

      {/* Recommended Courses */}
      <Card className="newyear-widget-card dashboard-newyear-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-base">Recommended</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Discover courses to start your journey
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default NewYearWidgets;
