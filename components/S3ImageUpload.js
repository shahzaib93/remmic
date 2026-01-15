import { useState, useRef } from 'react';
import { useS3Upload } from '../hooks/useS3Upload';

/**
 * S3 Image Upload Component
 * Supports single and multiple image uploads with preview
 */
export default function S3ImageUpload({
  propertyId,
  type = 'gallery',
  multiple = false,
  maxFiles = 10,
  onUploadComplete,
  onError,
  existingImages = [],
}) {
  const { uploadFile, uploadFiles, deleteFile, uploading, progress, error } = useS3Upload();
  const [images, setImages] = useState(existingImages);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);

    // Filter only images
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      onError?.('Please select image files only');
      return;
    }

    // Check max files limit
    if (images.length + imageFiles.length > maxFiles) {
      onError?.(`Maximum ${maxFiles} images allowed`);
      return;
    }

    try {
      const options = { propertyId, type, category: 'property' };

      if (multiple) {
        const results = await uploadFiles(imageFiles, options);
        const newImages = [...images, ...results];
        setImages(newImages);
        onUploadComplete?.(newImages);
      } else {
        const result = await uploadFile(imageFiles[0], options);
        const newImages = [result];
        setImages(newImages);
        onUploadComplete?.(newImages);
      }
    } catch (err) {
      onError?.(err.message);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleRemove = async (index) => {
    const imageToRemove = images[index];
    try {
      if (imageToRemove.key) {
        await deleteFile(imageToRemove.key);
      }
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      onUploadComplete?.(newImages);
    } catch (err) {
      onError?.(err.message);
    }
  };

  return (
    <div className="s3-upload-container">
      {/* Drop Zone */}
      <div
        className={`upload-dropzone ${dragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        {uploading ? (
          <div className="upload-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span>Uploading... {progress}%</span>
          </div>
        ) : (
          <div className="upload-prompt">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p>Drag & drop images here or click to browse</p>
            <span>{multiple ? `Up to ${maxFiles} images` : 'Single image'}</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="upload-error">{error}</p>}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="upload-previews">
          {images.map((image, index) => (
            <div key={image.key || index} className="preview-item">
              <img src={image.fileUrl} alt={image.filename || `Image ${index + 1}`} />
              <button
                type="button"
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .s3-upload-container {
          width: 100%;
        }

        .upload-dropzone {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #fafafa;
        }

        .upload-dropzone:hover,
        .upload-dropzone.active {
          border-color: #0070f3;
          background: #f0f7ff;
        }

        .upload-dropzone.uploading {
          pointer-events: none;
          opacity: 0.8;
        }

        .upload-prompt {
          color: #666;
        }

        .upload-prompt svg {
          margin-bottom: 16px;
          color: #999;
        }

        .upload-prompt p {
          margin: 0 0 8px;
          font-size: 16px;
        }

        .upload-prompt span {
          font-size: 14px;
          color: #999;
        }

        .upload-progress {
          padding: 20px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .progress-fill {
          height: 100%;
          background: #0070f3;
          transition: width 0.3s ease;
        }

        .upload-error {
          color: #e53e3e;
          font-size: 14px;
          margin-top: 8px;
        }

        .upload-previews {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }

        .preview-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
        }

        .preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-btn:hover {
          background: rgba(229, 62, 62, 0.9);
        }
      `}</style>
    </div>
  );
}
