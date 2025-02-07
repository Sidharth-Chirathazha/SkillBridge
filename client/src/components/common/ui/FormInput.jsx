import React from 'react';
import { Controller } from 'react-hook-form';


const FormInput = ({ label, name, control, error, type = 'text', className = '', isEditMode }) => (
    <div className={`relative ${className}`}>
      <label className={`text-xs text-gray-600 ${error ? 'text-red-500' : ''}`}>
        {label}
      </label>
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <input
                    {...field}
                    type={type}
                    disabled={!isEditMode}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        error ? 'border-red-500' : 'border-text-200'
                    } focus:outline-none focus:ring-1 focus:ring-primary-500 peer ${
                        !isEditMode ? 'bg-text-50 text-text-400' : ''
                    }`}
                    placeholder=" "
                />
            )}
        />
        {error && (
            <span className="text-red-500 text-xs mt-1">{error.message}</span>
        )}
    </div>
);

export default FormInput;