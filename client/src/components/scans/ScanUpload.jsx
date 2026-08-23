import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, File, AlertCircle } from 'lucide-react';
import SearchableSelect from '../common/SearchableSelect';

const ScanUpload = ({ onUpload }) => {
  const [files, setFiles] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [imageType, setImageType] = useState('xray');
  const [bodyPart, setBodyPart] = useState('');
  const [clinicalContext, setClinicalContext] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'application/dicom': []
    },
    maxSize: 50000000 // 50MB
  });

  const removeFile = (indexToRemove) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[indexToRemove].preview);
      newFiles.splice(indexToRemove, 1);
      return newFiles;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length === 0 || !patientId || !bodyPart) return;
    
    onUpload({ 
      files: files.map(f => f.file), 
      patientId, 
      imageType, 
      bodyPart, 
      clinicalContext 
    });
  };

  return (
    <div className="glass-panel p-6 sm:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--border-color)]">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] flex items-center justify-center">
          <UploadCloud size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Upload New Scan</h2>
          <p className="text-[var(--text-secondary)] text-sm">Select a patient and upload their medical image</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Metadata */}
        <div className="space-y-5">
          <div>
            <label className="label-text">Select Patient</label>
            <SearchableSelect 
              value={patientId} 
              onChange={setPatientId} 
              placeholder="-- Search Patient --" 
            />
          </div>

          <div>
            <label className="label-text">Modality (Image Type)</label>
            <select 
              className="input-field"
              value={imageType}
              onChange={(e) => setImageType(e.target.value)}
              required
            >
              <option value="xray">X-Ray</option>
              <option value="ctscan">CT Scan</option>
              <option value="mri">MRI</option>
              <option value="ultrasound">Ultrasound</option>
            </select>
          </div>

          <div>
            <label className="label-text">Body Part / Region</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Chest, Brain, Left Knee"
              value={bodyPart}
              onChange={(e) => setBodyPart(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label-text">Clinical Context (Optional)</label>
            <textarea 
              className="input-field min-h-[100px] resize-y" 
              placeholder="Brief clinical history or reason for scan to aid AI analysis..."
              value={clinicalContext}
              onChange={(e) => setClinicalContext(e.target.value)}
            />
          </div>
        </div>

        {/* Right Column - File Upload */}
        <div>
          <label className="label-text mb-2 block">Image Files ({files.length} selected)</label>
          
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 mb-4
              ${isDragActive ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5' : 'border-[var(--border-color)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-elevated)]'}
              ${files.length > 0 ? 'h-auto py-6' : 'h-[300px]'}
            `}
          >
            <input {...getInputProps()} />
            <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] mb-3">
              <UploadCloud size={24} />
            </div>
            <p className="text-white font-medium mb-1">Drag & drop files here</p>
            <p className="text-[var(--text-secondary)] text-sm">or click to browse</p>
          </div>
          
          {files.length > 0 && (
            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
              {files.map((item, index) => (
                <div key={index} className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--bg-secondary)] relative h-[120px] flex flex-col">
                  <button 
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-500/80 text-white rounded-md transition-colors z-10 backdrop-blur-sm"
                  >
                    <X size={14} />
                  </button>
                  <div className="flex-1 bg-black/40 flex items-center justify-center overflow-hidden">
                    {item.file.type.includes('image') ? (
                      <img src={item.preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <File size={24} className="opacity-50 text-[var(--text-secondary)]" />
                    )}
                  </div>
                  <div className="p-2 border-t border-[var(--border-color)] bg-[var(--bg-elevated)] text-xs truncate text-[var(--text-primary)]">
                    {item.file.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex gap-3 text-amber-400/90 text-sm">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <p>Ensure patient PHI is anonymized before uploading if this is a development environment.</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 mt-4 pt-6 border-t border-[var(--border-color)] flex justify-end">
          <button 
            type="submit" 
            className="btn-primary w-full md:w-auto px-8 py-3 text-base flex items-center justify-center gap-2"
            disabled={files.length === 0 || !patientId || !bodyPart}
          >
            <UploadCloud size={20} />
            Upload {files.length > 0 ? files.length : ''} File{files.length !== 1 ? 's' : ''}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScanUpload;
