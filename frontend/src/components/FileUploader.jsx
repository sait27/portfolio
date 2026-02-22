import { useId, useState } from 'react';
import { FaUpload } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { userApi } from '../api/client';

const formatSize = (sizeInBytes) => {
  if (!Number.isFinite(sizeInBytes) || sizeInBytes <= 0) return '';
  const kb = sizeInBytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

export default function FileUploader({
  label,
  accept = '*/*',
  buttonText = 'Upload file',
  helpText = 'Max size: 10MB',
  disabled = false,
  uploadContext = '',
  onUploaded,
}) {
  const inputId = useId();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileLabel, setSelectedFileLabel] = useState('');

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || disabled || isUploading) return;

    setSelectedFileLabel(`${file.name} (${formatSize(file.size)})`);
    setIsUploading(true);
    try {
      const response = await userApi.uploadFile(file, { upload_context: uploadContext });
      const uploadedUrl = response?.data?.download_url || response?.data?.url;
      if (!uploadedUrl) {
        toast.error('Upload succeeded but no URL was returned.');
        return;
      }
      onUploaded?.(uploadedUrl, file);
      toast.success('File uploaded successfully');
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(detail || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="admin-upload-field">
      <label htmlFor={inputId} className="form-label">{label}</label>
      <div className="admin-upload-field__controls">
        <input
          id={inputId}
          type="file"
          accept={accept}
          className="admin-upload-field__input"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
        />
        <label
          htmlFor={inputId}
          className={`btn btn-outline btn-sm admin-upload-field__trigger ${disabled || isUploading ? 'admin-upload-field__trigger--disabled' : ''}`}
        >
          <FaUpload />
          {isUploading ? 'Uploading...' : buttonText}
        </label>
        <span className="admin-upload-field__file" title={selectedFileLabel || 'No file selected'}>
          {selectedFileLabel || 'No file selected'}
        </span>
      </div>
      {helpText ? <p className="admin-upload-field__hint">{helpText}</p> : null}
    </div>
  );
}
