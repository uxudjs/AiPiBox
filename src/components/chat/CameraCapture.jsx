/**
 * 相机拍摄与图片编辑组件
 * 提供调用摄像头拍照、前后摄像头切换、以及照片拍摄后的裁剪、旋转、亮度对比度调节等编辑功能。
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Camera, RefreshCw, Check, RotateCcw, Crop, Sun, Moon, SwitchCamera } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { cn } from '../../utils/cn';
import { logger } from '../../services/logger';
import { isMobileDevice } from '../../utils/envDetect';

/**
 * 相机捕获组件
 * @param {object} props - 组件属性
 * @param {Function} props.onCapture - 完成拍摄并确认后的回调，返回 base64 数据
 * @param {Function} props.onClose - 关闭弹窗回调
 * @param {string} [props.initialImage] - 初始进入编辑模式的图片数据
 */
const CameraCapture = ({ onCapture, onClose, initialImage = null }) => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const nativeRetakeInputRef = useRef(null);
  
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(initialImage ? 'edit' : 'camera');
  const [capturedImage, setCapturedImage] = useState(initialImage);
  const [facingMode, setFacingMode] = useState('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [aspectRatio, setAspectRatio] = useState('original');
  const [aspectRatioValue, setAspectRatioValue] = useState(1);

  /**
   * 初始化并开启摄像头流
   */
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
        videoRef.current.play().catch(e => logger.error('CameraCapture', 'Video play error', e));
      }
      setError(null);
      
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

  /**
   * 停止摄像头流
   */
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  /**
   * 关闭组件
   */
  const handleClose = () => {
    stopCamera();
    onClose();
  };

  /**
   * 切换前后摄像头
   */
  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  /**
   * 执行拍照动作并进入编辑模式
   */
  const takePhoto = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0);
    
    setCapturedImage(canvas.toDataURL('image/jpeg', 1.0));
    setMode('edit');
    stopCamera();
    
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setAspectRatio('original');
  };

  /**
   * 渲染应用了滤镜和变换后的编辑预览图
   */
  const renderEditedImage = useCallback(() => {
    if (!capturedImage || !canvasRef.current) return;
    
    setIsImageLoaded(false);
    const img = new Image();
    img.onload = () => {
      if (!canvasRef.current) return;
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
      
      let finalW = rotateCanvas.width;
      let finalH = rotateCanvas.height;
      let startX = 0;
      let startY = 0;
      
      if (aspectRatio !== 'original') {
        const targetRatio = aspectRatio === 'custom' ? aspectRatioValue : aspectRatio.split(':').reduce((w, h) => w / h);
        const currentRatio = finalW / finalH;
        
        if (currentRatio > targetRatio) {
          const newW = finalH * targetRatio;
          startX = (finalW - newW) / 2;
          finalW = newW;
        } else {
          const newH = finalW / targetRatio;
          startY = (finalH - newH) / 2;
          finalH = newH;
        }
      }
      
      const canvas = canvasRef.current;
      canvas.width = finalW;
      canvas.height = finalH;
      const ctx = canvas.getContext('2d');
      
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(rotateCanvas, startX, startY, finalW, finalH, 0, 0, finalW, finalH);
      setIsImageLoaded(true);
    };
    img.onerror = (err) => {
      logger.error('CameraCapture', 'Failed to load image for editing', err);
      setIsImageLoaded(false);
    };
    img.src = capturedImage;
  }, [capturedImage, rotation, brightness, contrast, aspectRatio, aspectRatioValue]);

  useEffect(() => {
    if (mode === 'edit') {
      renderEditedImage();
    }
  }, [renderEditedImage, mode]);

  /**
   * 确认编辑结果并输出
   */
  const handleConfirm = async () => {
    if (canvasRef.current && isImageLoaded) {
      try {
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
        if (!dataUrl || dataUrl === 'data:,') {
          throw new Error('Generated empty image');
        }
        await onCapture(dataUrl);
        handleClose();
      } catch (err) {
        logger.error('CameraCapture', 'Confirm failed', err);
        alert(t('inputArea.error') + ': Failed to export image');
      }
    }
  };

  /**
   * 顺时针旋转图片 90 度
   */
  const rotateImage = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  /**
   * 重新拍摄
   */
  const handleRetake = () => {
    if (isMobileDevice() && nativeRetakeInputRef.current) {
      nativeRetakeInputRef.current.click();
    } else {
      setMode('camera');
    }
  };

  /**
   * 处理原生相机重拍后的文件输入
   */
  const handleNativeRetakeChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target.result);
      setMode('edit');
      setRotation(0);
      setBrightness(100);
      setContrast(100);
      setAspectRatio('original');
    };
    reader.readAsDataURL(file);
    
    e.target.value = '';
  };

  /**
   * 循环切换预设的裁剪比例
   */
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
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm z-10 flex-shrink-0">
         <button onClick={handleClose} className="p-2 bg-black/50 rounded-full text-white hover:bg-white/20 transition-colors">
            <X className="w-6 h-6" />
         </button>
         <div className="text-white font-medium">
            {mode === 'camera' ? (t('inputArea.takePhoto') || 'Take Photo') : (t('common.edit') || 'Edit')}
         </div>
         <div className="w-10"></div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden p-4">
        {mode === 'camera' ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-contain"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
             <canvas ref={canvasRef} className="max-w-full max-h-full shadow-2xl border border-white/10 object-contain" />
          </div>
        )}
      </div>

      <div className="bg-black/80 backdrop-blur-md pb-8 pt-4 px-6 z-10 rounded-t-3xl border-t border-white/10 flex-shrink-0">
        
        {mode === 'camera' ? (
          <div className="flex items-center justify-around max-w-sm mx-auto">
            <div className="w-12 h-12"></div>
            
            <div className="relative flex items-center justify-center w-24 h-24">
              <button 
                onClick={takePhoto}
                className="w-16 h-16 rounded-full border-[3px] border-white flex items-center justify-center bg-white/10 active:bg-white/30 transition-all hover:scale-105 active:scale-95 z-10"
              >
                <div className="w-12 h-12 bg-white rounded-full"></div>
              </button>
            </div>
            
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
            
            <div className="flex items-center gap-3 mt-2">
               <button onClick={handleRetake} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors">
                  {t('common.cancel') || 'Cancel'}
               </button>
               <button 
                  onClick={handleConfirm} 
                  disabled={!isImageLoaded}
                  className={cn(
                    "flex-1 py-3 text-primary-foreground rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                    isImageLoaded ? "bg-primary hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                  )}
               >
                  {isImageLoaded ? <Check className="w-5 h-5" /> : <RefreshCw className="w-4 h-4 animate-spin" />}
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