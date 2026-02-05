import React from 'react';
import { useTranslation } from '../../i18n';
import { useImageGenStore } from '../../store/useImageGenStore';
import { cn } from '../../utils/cn';
import { Type, Image as ImageIcon } from 'lucide-react';

const ModeTabs = () => {
  const { t } = useTranslation();
  const { mode, setMode } = useImageGenStore();

  const modes = [
    { id: 'text-to-image', label: t('imageFactory.textToImage'), icon: Type },
    { id: 'image-to-image', label: t('imageFactory.imageToImage'), icon: ImageIcon },
  ];

  return (
    <div className="flex p-1 bg-accent/30 rounded-xl">
      {modes.map((m) => {
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
              mode === m.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ModeTabs;
