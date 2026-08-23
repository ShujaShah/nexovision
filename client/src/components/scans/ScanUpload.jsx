import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, File, AlertCircle } from 'lucide-react';
import SearchableSelect from '../common/SearchableSelect';

const ScanUpload = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [patientId, setPatientId] = useState('');
  const [imageType, setImageType] = useState('xray');
  const [bodyPart, setBodyPart] = useState('');
  const [clinicalContext, setClinicalContext] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'application/dicom': []
    },
    maxFiles: 1,
    maxSize: 50000000 // 50MB
  });

  const clearFile = () => {
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file || !patientId || !bodyPart) return;
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('patientId', patientId);
    formData.append('imageType', imageType);
    formData.append('bodyPart', bodyPart);
    if (clinicalContext) {
      formData.append('clinicalContext', clinicalContext);
    }

    onUpload(formData);
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
          <label className="label-text mb-2 block">Image File</label>
          
          {!file ? (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl h-[300px] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200
                ${isDragActive ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5' : 'border-[var(--border-color)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-elevated)]'}
              `}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] mb-4">
                <UploadCloud size={32} />
              </div>
              <p className="text-white font-medium mb-1">Drag & drop your file here</p>
              <p className="text-[var(--text-secondary)] text-sm mb-4">or click to browse from your computer</p>
              <div className="flex gap-2">
                <span className="badge">JPEG</span>
                <span className="badge">PNG</span>
                <span className="badge">DICOM</span>
              </div>
              <p className="text-[var(--text-muted)] text-xs mt-4">Max file size: 50MB</p>
            </div>
          ) : (
            <div className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--bg-secondary)] relative h-[300px] flex flex-col">
              <button 
                type="button"
                onClick={clearFile}
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 text-white rounded-lg transition-colors z-10 backdrop-blur-sm"
              >
                <X size={16} />
              </button>
              
              <div className="flex-1 bg-black/40 flex items-center justify-center p-2 overflow-hidden">
                {file.type.includes('image') ? (
                  <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center text-[var(--text-secondary)]">
                    <File size={48} className="mb-2 opacity-50" />
                    <span>DICOM File Selected</span>
                  </div>
                )}
              </div>
              
              <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-elevated)] text-sm flex justify-between items-center">
                <span className="truncate pr-4 text-[var(--text-primary)]">{file.name}</span>
                <span className="text-[var(--text-secondary)] whitespace-nowrap">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
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
            disabled={!file || !patientId || !bodyPart}
          >
            <UploadCloud size={20} />
            Upload and Analyze
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScanUpload;
