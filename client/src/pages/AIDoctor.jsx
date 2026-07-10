import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';

export default function AIDoctor() {
  const { t } = useTranslation();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    // Cleanup URL when component unmounts or file changes
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setAnalyzing(true);
    setResult(null);
    
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      try {
        const res = await api.post('/doctor/analyze', {
          base64Image: reader.result,
          mimeType: selectedFile.type
        });
        setResult(res.data);
      } catch (err) {
        console.error('API Error:', err);
        setResult({
          disease: 'Analysis Error',
          confidence: 'N/A',
          recommendation: err.response?.data?.error || 'Failed to reach AI Server. Ensure GEMINI_API_KEY is set in .env.',
          crop: 'Unknown'
        });
      } finally {
        setAnalyzing(false);
      }
    };
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
  };

  return (
    <div className="page">
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
      <div className="container" style={{ maxWidth: 600 }}>
        <h1 className="page-title animate-in">🩺 {t('ai_doctor.title')}</h1>
        
        <div className="badge badge-warning" style={{ display: 'block', padding: 12, marginBottom: 20 }}>
          {t('ai_doctor.disclaimer')}
        </div>

        <div className="card animate-slide-up">
          <div className="card-body">
            {!previewUrl ? (
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ position: 'relative', border: '2px dashed var(--color-border)', padding: '48px 24px', textAlign: 'center', borderRadius: 'var(--radius-lg)', background: 'var(--color-bg)', cursor: 'pointer', overflow: 'hidden', transition: 'all 0.3s' }} className="upload-zone">
                    <input type="file" accept="image/*" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} onChange={handleFileChange} />
                    <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>📷</span>
                    <h3 style={{ margin: '0 0 8px', color: 'var(--color-text)', fontSize: 20 }}>Upload Crop Photo</h3>
                    <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 14 }}>Tap to take a photo or select an image to scan for diseases</p>
                  </div>
                </div>
              </form>
            ) : (
              <div>
                <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000', marginBottom: 20, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={previewUrl} alt="Crop preview" style={{ width: '100%', maxHeight: 400, objectFit: 'contain', display: 'block', opacity: analyzing ? 0.7 : 1, transition: 'opacity 0.3s' }} />
                  
                  {/* Scanning Animation overlay */}
                  {analyzing && (
                    <>
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        width: '100%',
                        height: '4px',
                        background: 'var(--color-primary)',
                        boxShadow: '0 0 15px 4px var(--color-primary)',
                        animation: 'scan 2s infinite ease-in-out'
                      }}></div>
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(76,175,80,0.1), transparent)', animation: 'pulse 1s infinite alternate' }}></div>
                    </>
                  )}
                  
                  {!analyzing && !result && (
                    <button onClick={resetForm} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, zIndex: 20 }}>
                      ✕
                    </button>
                  )}
                </div>

                {!result ? (
                  <button onClick={handleAnalyze} className="btn btn-primary btn-block" disabled={analyzing} style={{ fontSize: 16, padding: '12px' }}>
                    {analyzing ? '🔍 Scanning for diseases...' : '🔍 Scan Image'}
                  </button>
                ) : (
                  <button onClick={resetForm} className="btn btn-secondary btn-block">
                    📷 Scan Another Image
                  </button>
                )}
              </div>
            )}

            {result && (
              <div className="animate-in" style={{ marginTop: 24 }}>
                <h3 style={{ color: 'var(--color-primary-dark)', marginBottom: 16 }}>📋 Analysis Result</h3>
                
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ background: 'var(--color-bg)', padding: 12, borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--color-error)' }}>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Detected Disease</div>
                    <div style={{ fontWeight: 'bold', fontSize: 16, color: 'var(--color-error)' }}>{result.disease}</div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ background: 'var(--color-bg)', padding: 12, borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--color-primary)' }}>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Confidence Score</div>
                      <div style={{ fontWeight: 'bold', fontSize: 16 }}>{result.confidence}</div>
                    </div>
                    <div style={{ background: 'var(--color-bg)', padding: 12, borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #f59e0b' }}>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Crop</div>
                      <div style={{ fontWeight: 'bold', fontSize: 16 }}>{result.crop}</div>
                    </div>
                  </div>

                  <div style={{ background: 'var(--color-accent-bg)', padding: 16, borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--color-accent)' }}>
                    <div style={{ fontSize: 12, color: 'var(--color-accent-dark)', marginBottom: 8, fontWeight: 600 }}>Recommended Treatment</div>
                    <div style={{ lineHeight: 1.5, fontSize: 15 }}>{result.recommendation}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
