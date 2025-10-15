import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { featureGuides } from '@/data/featureGuides';
import FeaturePage from './FeaturePage';

const FeatureGuideContainer = () => {
  const { featureId } = useParams();
  const feature = featureGuides[featureId];

  if (!feature) {
    return <Navigate to="/dashboard/guide" replace />;
  }

  return <FeaturePage feature={feature} />;
};

export default FeatureGuideContainer;
