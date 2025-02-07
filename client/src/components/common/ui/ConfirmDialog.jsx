import { useState } from 'react';

export const ConfirmDialog = ({
  trigger,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'admin',
  destructive = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error('Error during confirmation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {trigger(() => setIsOpen(true))}

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div
            className={`rounded-lg p-6 w-full max-w-md ${
              variant === 'user'
                ? 'bg-background-500 text-text-500'
                : 'bg-background-100 text-text-500'
            }`}
          >
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-text-700">{description}</p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className={`px-4 py-2 rounded-md ${
                  variant === 'user'
                    ? 'bg-primary-500 hover:bg-primary-600 text-white'
                    : 'bg-background-300 hover:bg-background-400'
                }`}
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md text-white ${
                  destructive
                    ? 'bg-secondary-500 hover:bg-secondary-600'
                    : variant === 'user'
                    ? 'bg-primary-400 hover:bg-primary-500'
                    : 'bg-primary-500 hover:bg-primary-600'
                } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Processing...' : confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};