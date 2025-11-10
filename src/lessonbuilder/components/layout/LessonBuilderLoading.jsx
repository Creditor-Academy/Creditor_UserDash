import { Card, CardContent } from '@/components/ui/card';

const LessonBuilderLoading = ({ sidebarCollapsed }) => (
  <div className="flex min-h-screen w-full bg-white overflow-hidden">
    <div
      className="fixed top-16 h-[calc(100vh-4rem)] z-40 bg-white shadow-sm border-r border-gray-200 overflow-y-auto w-72 flex-shrink-0"
      style={{ left: sidebarCollapsed ? '4.5rem' : '17rem' }}
    >
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="sticky top-0 z-10 p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(index => (
              <Card key={index} className="border border-gray-200 h-28">
                <CardContent className="flex flex-col items-center justify-center p-3 h-full">
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div
      className={`flex-1 transition-all duration-300 relative ${
        sidebarCollapsed ? 'ml-[calc(4.5rem+16rem)]' : 'ml-[calc(17rem+16rem)]'
      }`}
    >
      <div
        className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 px-6 py-4 z-30"
        style={{
          left: sidebarCollapsed
            ? 'calc(4.5rem + 16rem)'
            : 'calc(17rem + 16rem)',
        }}
      >
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="space-y-1">
              <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="w-full h-full bg-[#fafafa] pt-20">
        <div className="py-4">
          <div className="space-y-6 max-w-3xl mx-auto">
            {[1, 2, 3].map(index => (
              <div key={index} className="relative bg-white rounded-lg p-6">
                {index === 1 && (
                  <div className="mb-8">
                    <div className="h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-pulse"></div>
                  </div>
                )}

                {index === 2 && (
                  <div className="mb-8 space-y-3">
                    <div className="h-8 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                  </div>
                )}

                {index === 3 && (
                  <div className="mb-8 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default LessonBuilderLoading;
