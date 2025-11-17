import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { CalendarDays, CheckSquare, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const upcomingTasks = [
  {
    id: 1,
    title: 'Complete Insurance Sales Assignment',
    due: 'Due Mon, 10 Jul',
    status: 'overdue',
  },
  {
    id: 2,
    title: 'Review Life Insurance Documentation',
    due: 'Due Wed, 12 Jul',
    status: 'dueSoon',
  },
  {
    id: 3,
    title: 'Watch Lecture on Sales Techniques',
    due: 'Due Sat, 8 Jul',
    status: 'onTrack',
  },
];

const recentlyCompleted = [
  {
    id: 'completed-1',
    title: 'Submit Sales Proposal',
    completedAt: 'Today',
  },
];

const statusStyles = {
  overdue: 'bg-red-100 text-red-600',
  dueSoon: 'bg-amber-100 text-amber-600',
  onTrack: 'bg-emerald-100 text-emerald-600',
};

export function DashboardTodo({ className = '' }) {
  const [tasks, setTasks] = React.useState(upcomingTasks);

  const toggleTask = id => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, isDone: !task.isDone } : task
      )
    );
  };

  return (
    <Card
      className={cn(
        'w-full rounded-2xl border border-gray-200 bg-white shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
        <div>
          <p className="text-sm font-medium text-gray-500">My Tasks</p>
          <h3 className="text-2xl font-semibold text-gray-900">
            Stay on track
          </h3>
          <p className="text-sm text-gray-500">3 due this week</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
          asChild
        >
          <Link to="/dashboard/tasks">
            <Plus size={16} className="mr-1" />
            Add
          </Link>
        </Button>
      </div>

      <div className="space-y-4 px-5 py-4">
        {tasks.map(task => (
          <div
            key={task.id}
            className="flex items-start justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
          >
            <div className="flex flex-1 items-start gap-3">
              <Checkbox
                id={`task-${task.id}`}
                checked={!!task.isDone}
                onCheckedChange={() => toggleTask(task.id)}
                className="mt-1 h-4 w-4 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
              />
              <div className="space-y-1">
                <label
                  htmlFor={`task-${task.id}`}
                  className={cn(
                    'font-medium text-gray-900',
                    task.isDone && 'line-through text-gray-500'
                  )}
                >
                  {task.title}
                </label>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CalendarDays size={14} />
                  <span>{task.due}</span>
                </div>
              </div>
            </div>
            <div
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
                statusStyles[task.status]
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {task.status === 'overdue'
                ? 'Overdue'
                : task.status === 'dueSoon'
                  ? 'Due soon'
                  : 'On track'}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 px-5 py-4">
        <p className="text-sm font-semibold text-gray-900">
          Recently Completed
        </p>
        <div className="mt-3 space-y-2">
          {recentlyCompleted.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <CheckSquare size={16} className="text-emerald-500" />
                <span className="line-through">{item.title}</span>
              </div>
              <span>{item.completedAt}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 px-5 py-4">
        <Button
          variant="ghost"
          className="w-full justify-between text-blue-600 hover:bg-blue-50"
          asChild
        >
          <Link to="/dashboard/tasks">
            View All Tasks
            <span aria-hidden="true">→</span>
          </Link>
        </Button>
      </div>
    </Card>
  );
}

export default DashboardTodo;
