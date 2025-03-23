
import React from 'react';
import { Controller } from 'react-hook-form';
import { AdvancedImage } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';


const cld = new Cloudinary({ cloud: { cloudName: 'dz9kgofdy' } });

const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split('/upload/');
  return parts.length > 1 ? parts[1].split('.')[0] : null;
};

const FileUploadInput = ({ label, name, control, error, accept, existingImage }) => {
  return (
    <div className="relative">
      <label className={`text-xs text-gray-600 ${error ? 'text-red-500' : ''}`}>
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="relative">
            {existingImage && !field.value && (
              <div className="mb-2">
                <AdvancedImage
                  cldImg={cld.image(getPublicIdFromUrl(existingImage))}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <span className="text-xs text-gray-500 mt-1 block">Current thumbnail</span>
              </div>
            )}
            <input
              type="file"
              accept={accept}
              onChange={(e) => field.onChange(e.target.files[0])}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                error ? 'border-red-500' : 'border-text-200'
              } focus:outline-none focus:ring-1 focus:ring-primary-500`}
            />
            <span className="text-sm text-text-400 mt-1 block">
              {field.value?.name || 'No file chosen'}
            </span>
          </div>
        )}
      />
      {error && <span className="text-red-500 text-xs mt-1">{error.message}</span>}
    </div>
  );
};

export default FileUploadInput;