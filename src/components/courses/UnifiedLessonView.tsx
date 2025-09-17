// This component has been disabled - UnifiedLessonView functionality removed

interface UnifiedLessonViewProps {
  lesson?: any;
  isOpen?: boolean;
  onClose?: () => void;
  isAILesson?: boolean;
  onSectionComplete?: (sectionId: string) => void;
  completedSections?: Set<string>;
  onSave?: (updatedLesson: any) => void;
}

function UnifiedLessonView(props: UnifiedLessonViewProps) {
  return (
    <div className="p-4 text-center text-gray-500">
      UnifiedLessonView component disabled
    </div>
  );
}

export default UnifiedLessonView;