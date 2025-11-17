import { Card, CardContent } from '@/components/ui/card';

const BLOCK_GRADIENTS = {
  text: 'from-indigo-500 to-purple-500',
  statement: 'from-fuchsia-500 to-pink-500',
  quote: 'from-sky-500 to-cyan-500',
  image: 'from-amber-500 to-orange-500',
  youtube: 'from-red-500 to-rose-500',
  video: 'from-violet-500 to-indigo-500',
  audio: 'from-emerald-500 to-teal-500',
  link: 'from-blue-500 to-indigo-500',
  pdf: 'from-slate-500 to-slate-700',
  list: 'from-teal-500 to-emerald-500',
  tables: 'from-orange-500 to-amber-500',
  interactive: 'from-purple-500 to-indigo-500',
  divider: 'from-zinc-500 to-slate-500',
};

const getBlockGradient = id =>
  BLOCK_GRADIENTS[id] || 'from-indigo-500 to-purple-500';

const ContentLibrarySidebar = ({
  sidebarCollapsed,
  contentBlockTypes,
  onBlockClick,
}) => (
  <div
    className="fixed top-16 h-[calc(100vh-4rem)] z-40 bg-gradient-to-b from-indigo-50/70 via-slate-50/60 to-white/80 shadow-sm border-r border-gray-200 overflow-y-auto w-72 flex-shrink-0"
    style={{ left: sidebarCollapsed ? '4.5rem' : '17rem' }}
  >
    <div className="w-72 bg-transparent flex flex-col h-full">
      <div className="sticky top-0 z-10 px-4 pt-4 pb-3 border-b border-white/20 bg-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm shadow-indigo-300">
            CL
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
              Content Library
            </h2>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 px-4 pt-2 pb-3">
        <div className="space-y-1">
          {contentBlockTypes.map(blockType => (
            <Card
              key={blockType.id}
              title={blockType.title}
              className="cursor-pointer group rounded-xl border border-white/15 bg-white/5 backdrop-blur-lg shadow-sm hover:shadow-lg hover:bg-white/10 transition-all duration-200"
              onClick={() => onBlockClick(blockType)}
            >
              <CardContent className="px-3 py-1.5 flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr ${getBlockGradient(
                    blockType.id
                  )} shadow-md shadow-black/10`}
                >
                  <div className="text-white">{blockType.icon}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-gray-900 truncate">
                    {blockType.title}
                  </h3>
                  {blockType.description && (
                    <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">
                      {blockType.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ContentLibrarySidebar;
