import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Camera, RefreshCw, Check, RotateCcw, Crop, Sun, Moon, SwitchCamera } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { cn } from '../../utils/cn';
import { logger } from '../../services/logger';
import { isMobileDevice } from '../../utils/envDetect';

const CameraCapture = ({ onCapture, onClose, initialImage = null }) => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const nativeRetakeInputRef = useRef(null);
  
  // States
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(initialImage ? 'edit' : 'camera'); // 'camera' | 'edit'
  const [capturedImage, setCapturedImage] = useState(initialImage); // base64 string
  const [facingMode, setFacingMode] = useState('user'); // 'user' | 'environment'
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  
  // Edit states
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [aspectRatio, setAspectRatio] = useState('original'); // 'original', '1:1', '4:3', '16:9', 'custom'
  const [aspectRatioValue, setAspectRatioValue] = useState(1); // Width / Height

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
      
      // Check for multiple cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);
      
    } catch (err) {
      logger.error('CameraCapture', 'Camera access error', err);
      setError(t('inputArea.cameraAccessError') + (err.message || 'Unknown error'));
    }
  }, [facingMode, t]);

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mode, startCamera]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    // Mirror if using user camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0);
    
    setCapturedImage(canvas.toDataURL('image/jpeg', 1.0));
    setMode('edit');
    stopCamera();
    
    // Reset edit controls
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setAspectRatio('original');
  };

  // Draw edited image to canvas for preview and final output
  useEffect(() => {
    if (mode === 'edit' && capturedImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        // 1. Calculate dimensions based on crop/rotation
        // For simplicity, we implement rotation and simple center crop based on aspect ratio
        
        // Handling Rotation logic to determine canvas size
        let drawWidth = img.width;
        let drawHeight = img.height;
        
        // Swap dimensions if rotated 90 or 270 degrees
        if (rotation % 180 !== 0) {
          drawWidth = img.height;
          drawHeight = img.width;
        }

        // Apply Aspect Ratio Crop logic
        let cropX = 0, cropY = 0, cropW = drawWidth, cropH = drawHeight;
        
        if (aspectRatio !== 'original') {
          const [rw, rh] = aspectRatio.split(':').map(Number);
          const ratio = rw / rh;
          const currentRatio = drawWidth / drawHeight;
          
          if (currentRatio > ratio) {
            // Image is wider than target ratio - crop width
            cropW = drawHeight * ratio;
            cropX = (drawWidth - cropW) / 2;
          } else {
            // Image is taller than target ratio - crop height
            cropH = drawWidth / ratio;
            cropY = (drawHeight - cropH) / 2;
          }
        }
        
        // Set Canvas Size to the final Cropped Size
        canvas.width = cropW;
        canvas.height = cropH;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Apply filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        
        // Save context state before transformations
        ctx.save();
        
        // Translate to center of canvas for rotation handling
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        // Apply rotation
        ctx.rotate((rotation * Math.PI) / 180);
        
        // If rotated 90/270, the drawing dimensions are swapped relative to the image
        if (rotation % 180 !== 0) {
            // When drawing, we center the image. 
            // The image is w x h.
            // We are rotated.
            // We need to account for crop offset.
            // This coordinate math gets tricky. Let's simplify:
            // Draw image on a temp canvas first with rotation, then crop from that?
            // Or just draw image centered and let crop logic handle view window.
        }
        
        // Simplified approach: Draw rotated image, then crop via canvas viewport?
        // Actually, easiest way is: 
        // 1. Rotate context
        // 2. Draw image centered
        // But cropping needs to happen after rotation.
        
        // Re-thinking for robustness:
        // Use an intermediate canvas for rotation
      };
      img.src = capturedImage;
    }
  }, [mode, capturedImage, rotation, brightness, contrast, aspectRatio]);

  // Robust rendering function
  const renderEditedImage = useCallback(() => {
    if (!capturedImage || !canvasRef.current) return;
    
    const img = new Image();
    img.onload = () => {
      // Step 1: Create a canvas for Rotation
      const rotateCanvas = document.createElement('canvas');
      const rotCtx = rotateCanvas.getContext('2d');
      
      if (rotation % 180 === 0) {
        rotateCanvas.width = img.width;
        rotateCanvas.height = img.height;
      } else {
        rotateCanvas.width = img.height;
        rotateCanvas.height = img.width;
      }
      
      rotCtx.translate(rotateCanvas.width / 2, rotateCanvas.height / 2);
      rotCtx.rotate((rotation * Math.PI) / 180);
      rotCtx.drawImage(img, -img.width / 2, -img.height / 2);
      
      // Step 2: Calculate Crop on the Rotated Image
      let finalW = rotateCanvas.width;
      let finalH = rotateCanvas.height;
      let startX = 0;
      let startY = 0;
      
      if (aspectRatio !== 'original') {
        const targetRatio = aspectRatio === 'custom' ? aspectRatioValue : aspectRatio.split(':').reduce((w, h) => w / h);
        const currentRatio = finalW / finalH;
        
        if (currentRatio > targetRatio) {
          // Wider than target: crop width
          const newW = finalH * targetRatio;
          startX = (finalW - newW) / 2;
          finalW = newW;
        } else {
          // Taller than target: crop height
          const newH = finalW / targetRatio;
          startY = (finalH - newH) / 2;
          finalH = newH;
        }
      }
      
      // Step 3: Draw final result to display canvas with filters
      const canvas = canvasRef.current;
      canvas.width = finalW;
      canvas.height = finalH;
      const ctx = canvas.getContext('2d');
      
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(rotateCanvas, startX, startY, finalW, finalH, 0, 0, finalW, finalH);
    };
    img.src = capturedImage;
  }, [capturedImage, rotation, brightness, contrast, aspectRatio]);

  useEffect(() => {
    if (mode === 'edit') {
      renderEditedImage();
    }
  }, [renderEditedImage, mode]);

  const handleConfirm = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
      onCapture(dataUrl);
      handleClose();
    }
  };

  const rotateImage = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleRetake = () => {
    if (isMobileDevice() && nativeRetakeInputRef.current) {
      nativeRetakeInputRef.current.click();
    } else {
      setMode('camera');
    }
  };

  const handleNativeRetakeChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target.result);
      setMode('edit');
      // Reset edit controls for the new photo
      setRotation(0);
      setBrightness(100);
      setContrast(100);
      setAspectRatio('original');
    };
    reader.readAsDataURL(file);
    
    // Reset input
    e.target.value = '';
  };

  const cycleAspectRatio = () => {
    const ratios = ['original', '1:1', '4:3', '16:9', 'custom'];
    const currentIndex = ratios.indexOf(aspectRatio);
    setAspectRatio(ratios[(currentIndex + 1) % ratios.length]);
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="bg-destructive/20 p-4 rounded-full mb-4">
          <X className="w-12 h-12 text-destructive" />
        </div>
        <h3 className="text-xl font-bold mb-2">{t('inputArea.cameraAccessError') || 'Camera Access Error'}</h3>
        <p className="text-center mb-6 max-w-md text-white/70">{error}</p>
        <button onClick={handleClose} className="px-6 py-2 bg-white text-black rounded-full font-medium">
          {t('common.close') || 'Close'}
        </button>
      </div>
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-black flex flex-col animate-in fade-in duration-300 overflow-hidden">
      <input
        type="file"
        ref={nativeRetakeInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleNativeRetakeChange}
      />
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm z-10 flex-shrink-0">
         <button onClick={handleClose} className="p-2 bg-black/50 rounded-full text-white hover:bg-white/20 transition-colors">
            <X className="w-6 h-6" />
         </button>
         <div className="text-white font-medium">
            {mode === 'camera' ? (t('inputArea.takePhoto') || 'Take Photo') : (t('common.edit') || 'Edit')}
         </div>
         <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden p-4">
        {mode === 'camera' ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-contain"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
             <canvas ref={canvasRef} className="max-w-full max-h-full shadow-2xl border border-white/10 object-contain" />
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-black/80 backdrop-blur-md pb-8 pt-4 px-6 z-10 rounded-t-3xl border-t border-white/10 flex-shrink-0">
        
        {mode === 'camera' ? (
          <div className="flex items-center justify-around max-w-sm mx-auto">
            {/* Gallery Placeholder / Empty */}
            <div className="w-12 h-12"></div>
            
            {/* Shutter Button */}
            <div className="relative flex items-center justify-center w-24 h-24">
              <button 
                onClick={takePhoto}
                className="w-16 h-16 rounded-full border-[3px] border-white flex items-center justify-center bg-white/10 active:bg-white/30 transition-all hover:scale-105 active:scale-95 z-10"
              >
                <div className="w-12 h-12 bg-white rounded-full"></div>
              </button>
            </div>
            
            {/* Switch Camera */}
            <div className="w-12 h-12 flex items-center justify-center">
              {hasMultipleCameras && (
                <button onClick={switchCamera} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                  <SwitchCamera className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
            
            {/* Adjustment Sliders */}
            <div className="flex flex-col gap-3">
               <div className="flex items-center gap-3 text-white/80">
                  <Sun className="w-4 h-4 flex-shrink-0" />
                  <input 
                    type="range" 
                    min="50" 
                    max="150" 
                    value={brightness} 
                    onChange={(e) => setBrightness(e.target.value)}
                    className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
               </div>
               <div className="flex items-center gap-3 text-white/80">
                  <Moon className="w-4 h-4 flex-shrink-0" />
                  <input 
                    type="range" 
                    min="50" 
                    max="150" 
                    value={contrast} 
                    onChange={(e) => setContrast(e.target.value)}
                    className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
               </div>
               {aspectRatio === 'custom' && (
                 <div className="flex items-center gap-3 text-white/80 animate-in slide-in-from-top-1">
                    <Crop className="w-4 h-4 flex-shrink-0" />
                    <input 
                      type="range" 
                      min="0.5" 
                      max="2" 
                      step="0.01"
                      value={aspectRatioValue} 
                      onChange={(e) => setAspectRatioValue(parseFloat(e.target.value))}
                      className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    />
                    <span className="text-[10px] w-8 font-mono">{aspectRatioValue.toFixed(2)}</span>
                 </div>
               )}
            </div>

            {/* Edit Tools */}
            <div className="flex items-center justify-between px-2">
               <button onClick={rotateImage} className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
                  <div className="p-2.5 bg-white/10 rounded-full"><RotateCcw className="w-5 h-5" /></div>
                  <span className="text-[10px]">{t('inputArea.camera.rotate') || 'Rotate'}</span>
               </button>
               
               <button onClick={cycleAspectRatio} className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
                  <div className="p-2.5 bg-white/10 rounded-full relative">
                    <Crop className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 bg-primary text-[8px] px-1 rounded-full text-black font-bold">
                        {aspectRatio === 'original' ? 'Orig' : aspectRatio}
                    </span>
                  </div>
                  <span className="text-[10px]">{t('common.edit') || 'Crop'}</span>
               </button>

               <button onClick={handleRetake} className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
                  <div className="p-2.5 bg-white/10 rounded-full"><RefreshCw className="w-5 h-5" /></div>
                  <span className="text-[10px]">{t('inputArea.camera.retake') || 'Retake'}</span>
               </button>
            </div>
            
            {/* Confirm Actions */}
            <div className="flex items-center gap-3 mt-2">
               <button onClick={handleRetake} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors">
                  {t('common.cancel') || 'Cancel'}
               </button>
               <button onClick={handleConfirm} className="flex-1 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  {t('inputArea.camera.usePhoto') || 'Use Photo'}
               </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default CameraCapture;
