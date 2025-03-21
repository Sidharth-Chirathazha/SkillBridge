import React, { useState, useEffect } from 'react';
import {FaTimes} from 'react-icons/fa';

// Blog Form Modal Component
const BlogFormModal = ({ blog, onClose, onSubmit }) => {
    const [title, setTitle] = useState(blog ? blog.title : '');
    const [description, setDescription] = useState(blog ? blog.description : '');
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(blog ? blog.thumbnail : null);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }
      
      onSubmit(formData);
    };
    
    const handleThumbnailChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setThumbnail(file);
        setThumbnailPreview(URL.createObjectURL(file));
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold text-text">
              {blog ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h2>
            <button onClick={onClose} className="text-text-400 hover:text-text">
              <FaTimes />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4">
            <div className="mb-4">
              <label className="block text-text mb-2">Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-text mb-2">Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary h-32"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-text mb-2">Thumbnail</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleThumbnailChange} 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
              
              {thumbnailPreview && (
                <div className="mt-2">
                  <img 
                    src={thumbnailPreview} 
                    alt="Thumbnail preview" 
                    className="h-40 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6 gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 border border-text-300 rounded-lg hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-600 transition-colors"
              >
                {blog ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

export default BlogFormModal;