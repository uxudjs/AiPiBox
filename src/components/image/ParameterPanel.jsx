/**
 * þÏÂpMnb
 * Ð›¨‡	éz/Î<bÊ{Âp‚epÐ:ÍüûpI	„‚Ÿý
 */

import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { useImageGenStore } from '../../store/useImageGenStore';
import { cn } from '../../utils/cn';
import { 
  Maximize2, 
  Palette,
  ChevronDown,
  Check
} from 'lucide-react';

/**
 * þÏÂpbÄö
 */
const ParameterPanel = () => {
  const { t } = useTranslation();
  const { params, updateParams } = useImageGenStore();
  const [openDropdown, setOpenDropdown] = useState(null);

  const resolutions = [
    { label: '1024x1024', value: { width: 1024, height: 1024 }, ratio: '1:1' },
    { label: '512x512', value: { width: 512, height: 512 }, ratio: '1:1' },
    { label: '768x1024', value: { width: 768, height: 1024 }, ratio: '3:4' },
    { label: '1024x768', value: { width: 1024, height: 768 }, ratio: '4:3' },
    { label: '720x1280', value: { width: 720, height: 1280 }, ratio: '9:16' },
    { label: '1280x720', value: { width: 1280, height: 720 }, ratio: '16:9' },
  ];

  const styles = [
    { id: '', label: t('imageFactory.noStyle') },
    { id: 'cinematic', label: t('imageFactory.styles.cinematic') },
    { id: 'photographic', label: t('imageFactory.styles.photographic') },
    { id: 'anime', label: t('imageFactory.styles.anime') },
    { id: 'digital-art', label: t('imageFactory.styles.digital-art') },
    { id: 'fantasy-art', label: t('imageFactory.styles.fantasy-art') },
    { id: 'neonpunk', label: t('imageFactory.styles.neonpunk') },
    { id: '3d-model', label: t('imageFactory.styles.3d-model') },
  ];

  /**
   * 2Ó&þ„	éÉF
   */
  const renderDropdown = (id, label, options, currentValue, onSelect, Icon) => {
    const isOpen = openDropdown === id;
    const currentOption = options.find(o => {
      if (id === 'style') return o.id === currentValue;
      if (id === 'resolution') return o.value?.width === currentValue.width && o.value?.height === currentValue.height;
      return false;
    });

    return (
      <div className="space-y-2 relative">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
          <Icon className="w-3 h-3" />
          {label}
        </label>
        <button
          onClick={() => setOpenDropdown(isOpen ? null : id)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-accent/50 hover:bg-accent rounded-xl text-sm transition-all border border-transparent hover:border-primary/20"
        >
          <span className="truncate">{currentOption?.label || t('common.select')}</span>
          <ChevronDown className={cn("w-4 h-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-[80]" onClick={() => setOpenDropdown(null)} />
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-2xl shadow-2xl overflow-hidden z-[90] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                {options.map((opt) => {
                  const isSelected = id === 'style' 
                    ? opt.id === currentValue 
                    : (opt.value?.width === currentValue.width && opt.value?.height === currentValue.height);
                  
                  return (
                    <button
                      key={opt.id || opt.label}
                      onClick={() => {
                        onSelect(opt);
                        setOpenDropdown(null);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between group",
                        isSelected ? "bg-primary text-primary-foreground font-bold shadow-sm" : "hover:bg-accent"
                      )}
                    >
                      <div className="flex flex-col">
                        <span>{opt.label}</span>
                        {opt.ratio && <span className="text-[10px] opacity-60">{opt.ratio}</span>}
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  /**
   * 2ÓÑ¨a‚h
   */
  const Slider = ({ label, icon: Icon, value, min, max, step, onChange, unit = '' }) => (
    <div className="space-y-3 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
          <Icon className="w-3 h-3" />
          {label}
        </div>
        <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-md">
          {value}{unit}
        </span>
      </div>
      <div className="px-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-accent rounded-lg appearance-none cursor-pointer accent-primary transition-all"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {renderDropdown(
        'resolution',
        t('imageFactory.resolution'),
        resolutions,
        { width: params.width, height: params.height },
        (opt) => updateParams({ width: opt.value.width, height: opt.value.height }),
        Maximize2
      )}

      {renderDropdown(
        'style',
        t('imageFactory.style'),
        styles,
        params.style,
        (opt) => updateParams({ style: opt.id }),
        Palette
      )}

    </div>
  );
};

export default ParameterPanel;