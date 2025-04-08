import React, { useCallback } from 'react';
import type { Node as FlowNode } from 'reactflow';

// Assuming formData is passed down from PropertiesPanel, containing the current state of edits
interface SchedulePropertiesProps {
  selectedNode: FlowNode;
  onNodeUpdate: (field: string, value: any) => void;
  formData: Record<string, any>; // Receive formData from parent
}

const timezones = [
    'UTC', 'GMT', 'US/Pacific', 'US/Mountain', 'US/Central', 'US/Eastern',
    'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Europe/Moscow',
    'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney',
    'Australia/Melbourne', 'Pacific/Auckland',
    // Add more as needed, or consider using a library for a comprehensive list
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ScheduleProperties = ({ selectedNode, onNodeUpdate, formData }: SchedulePropertiesProps) => {

    // Use formData for displaying values, provide defaults using ||
    const scheduleType = formData?.scheduleType || 'interval';
    const intervalValue = formData?.intervalValue || '1';
    const intervalUnit = formData?.intervalUnit || 'seconds';
    const cronExpression = formData?.cronExpression || '* * * * *';
    const fixedTime = formData?.fixedTime || '09:00';
    const fixedDays = formData?.fixedDays || []; // Default to empty array
    const timezone = formData?.timezone || 'UTC'; // Default timezone
    const isActive = formData?.active === undefined ? true : !!formData.active; // Default to true, handle boolean

    // Memoize the change handler to avoid unnecessary re-renders if passed down
    const handlePropertyChange = useCallback((field: string, value: any) => {
        onNodeUpdate(field, value);
    }, [onNodeUpdate]);

    const handleDayToggle = useCallback((dayIndex: number) => {
        const currentDays: number[] = formData?.fixedDays || [];
        const newDays = currentDays.includes(dayIndex)
          ? currentDays.filter((d) => d !== dayIndex).sort((a,b) => a - b) // Keep sorted
          : [...currentDays, dayIndex].sort((a,b) => a - b); // Keep sorted
        handlePropertyChange('fixedDays', newDays);
      }, [formData?.fixedDays, handlePropertyChange]);

    const nodeId = selectedNode.id; // Use for unique IDs

    return (
        <div className="space-y-4"> {/* Increased spacing slightly */}
            {/* Schedule Type */}
            <div>
                <label htmlFor={`${nodeId}-scheduleType`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Schedule Type
                </label>
                <select
                    id={`${nodeId}-scheduleType`}
                    value={scheduleType}
                    onChange={(e) => handlePropertyChange('scheduleType', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 appearance-none bg-no-repeat bg-right pr-8"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.2em 1.2em'
                    }}
                >
                    <option value="interval">Interval</option>
                    <option value="cron">Cron Expression</option>
                    <option value="fixed">Fixed Time</option>
                </select>
            </div>

            {/* Interval Fields */}
            {scheduleType === 'interval' && (
                <div className="space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-gray-800/30">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 -mb-2">
                        Run Every
                    </label>
                    <div className="flex items-center space-x-2">
                        <input
                            id={`${nodeId}-intervalValue`}
                            type="number"
                            min="1"
                            value={intervalValue}
                            onChange={(e) => handlePropertyChange('intervalValue', e.target.value)}
                            className="w-20 px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
                        />
                        <select
                            id={`${nodeId}-intervalUnit`}
                            value={intervalUnit}
                            onChange={(e) => handlePropertyChange('intervalUnit', e.target.value)}
                            className="flex-1 px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 appearance-none bg-no-repeat bg-right pr-8"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: 'right 0.5rem center',
                                backgroundSize: '1.2em 1.2em'
                            }}
                        >
                            <option value="seconds">Seconds</option>
                            <option value="minutes">Minutes</option>
                            <option value="hours">Hours</option>
                            <option value="days">Days</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Cron Fields */}
            {scheduleType === 'cron' && (
                <div className="space-y-1 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-gray-800/30">
                    <label htmlFor={`${nodeId}-cronExpression`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Cron Expression
                    </label>
                    <input
                        id={`${nodeId}-cronExpression`}
                        type="text"
                        value={cronExpression}
                        onChange={(e) => handlePropertyChange('cronExpression', e.target.value)}
                        placeholder="* * * * *"
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 font-mono"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                        Format: minute hour day(month) month day(week).{' '}
                        <a href="https://crontab.guru/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                             Need help?
                        </a>
                    </p>
                </div>
            )}

            {/* Fixed Time Fields */}
            {scheduleType === 'fixed' && (
                <div className="space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-gray-800/30">
                    <div>
                        <label htmlFor={`${nodeId}-fixedTime`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Run At Time
                        </label>
                        <input
                            id={`${nodeId}-fixedTime`}
                            type="time"
                            value={fixedTime}
                            onChange={(e) => handlePropertyChange('fixedTime', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                            Repeat On Days
                        </label>
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5"> {/* Adjusted grid for responsiveness */}
                            {daysOfWeek.map((day, index) => (
                                <button
                                    type="button" // Ensure buttons don't submit forms if wrapped
                                    key={day}
                                    onClick={() => handleDayToggle(index)}
                                    className={`py-1 px-1.5 text-xs rounded-md transition-colors duration-150 ${
                                        fixedDays.includes(index)
                                        ? 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400'
                                    }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Timezone */}
            <div>
                <label htmlFor={`${nodeId}-timezone`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Timezone
                </label>
                <select
                    id={`${nodeId}-timezone`}
                    value={timezone}
                    onChange={(e) => handlePropertyChange('timezone', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 appearance-none bg-no-repeat bg-right pr-8"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.2em 1.2em'
                    }}
                >
                    {timezones.map(tz => (
                        <option key={tz} value={tz}>{tz.replace('_', ' ')}</option> // Replace underscore for display
                    ))}
                    {/* Consider adding a "Detect Browser Timezone" option */}
                </select>
            </div>

            {/* Active Toggle */}
            <div className="pt-2">
                <label htmlFor={`${nodeId}-active`} className="flex items-center space-x-2 cursor-pointer">
                    <input
                        id={`${nodeId}-active`}
                        type="checkbox"
                        // Use !! to ensure boolean, handle undefined case defaulting to true
                        checked={isActive}
                        // Pass the actual boolean value
                        onChange={(e) => handlePropertyChange('active', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
                        Schedule Active
                    </span>
                </label>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                    Inactive schedules will not trigger runs.
                </p>
            </div>
        </div>
    );
};

export default ScheduleProperties;