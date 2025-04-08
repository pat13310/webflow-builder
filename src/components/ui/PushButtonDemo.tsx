import React, { useState } from 'react';
import { Play, Save, ArrowRight, Plus, Trash } from 'lucide-react';
import PushButton from './PushButton';

const PushButtonDemo = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <PushButton>Default Button</PushButton>
          <PushButton variant="secondary">Secondary</PushButton>
          <PushButton variant="outline">Outline</PushButton>
          <PushButton variant="ghost">Ghost</PushButton>
          <PushButton variant="danger">Danger</PushButton>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <PushButton size="sm">Small</PushButton>
          <PushButton size="md">Medium</PushButton>
          <PushButton size="lg">Large</PushButton>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">With Icons</h2>
        <div className="flex flex-wrap gap-4">
          <PushButton leftIcon={<Play />}>
            Play
          </PushButton>
          <PushButton variant="secondary" rightIcon={<ArrowRight />}>
            Next
          </PushButton>
          <PushButton variant="outline" leftIcon={<Plus />}>
            Add Item
          </PushButton>
          <PushButton variant="danger" leftIcon={<Trash />}>
            Delete
          </PushButton>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">States</h2>
        <div className="flex flex-wrap gap-4">
          <PushButton isLoading={isLoading} onClick={handleClick}>
            {isLoading ? 'Loading...' : 'Click Me'}
          </PushButton>
          <PushButton disabled>Disabled</PushButton>
          <PushButton fullWidth>Full Width Button</PushButton>
        </div>
      </div>
    </div>
  );
}

export default PushButtonDemo;