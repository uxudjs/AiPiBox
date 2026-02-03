/**
 * 云端同步状态指示器组件
 * 显示当前同步状态、最后同步时间等信息
 */

import { useConfigStore } from '../../store/useConfigStore';
import { useTranslation } from '../../i18n';
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle, Clock } from 'lucide-react';

export default function SyncStatusIndicator({ className = '' }) {
  const { t } = useTranslation();
  const { cloudSync } = useConfigStore();

  if (!cloudSync?.enabled) {
    return null;
  }

  const { syncStatus, lastSyncTime, lastError } = cloudSync;

  // 格式化最后同步时间
  const formatLastSyncTime = () => {
    if (!lastSyncTime) {
      return t('settings.security.neverSynced');
    }

    const now = Date.now();
    const diff = now - lastSyncTime;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return t('settings.security.timeAgo', { value: days, unit: t('settings.security.days') });
    } else if (hours > 0) {
      return t('settings.security.timeAgo', { value: hours, unit: t('settings.security.hours') });
    } else if (minutes > 0) {
      return t('settings.security.timeAgo', { value: minutes, unit: t('settings.security.minutes') });
    } else {
      return t('settings.security.justNow');
    }
  };

  // 根据状态选择图标和样式
  const getStatusConfig = () => {
    switch (syncStatus) {
      case 'syncing':
        return {
          icon: RefreshCw,
          iconClass: 'animate-spin text-blue-500',
          text: t('settings.security.syncStatusSyncing'),
          bgClass: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        };
      case 'success':
        return {
          icon: Check,
          iconClass: 'text-green-500',
          text: t('settings.security.syncStatusSuccess'),
          bgClass: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        };
      case 'error':
        return {
          icon: AlertCircle,
          iconClass: 'text-red-500',
          text: t('settings.security.syncStatusError'),
          bgClass: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        };
      default:
        return {
          icon: Cloud,
          iconClass: 'text-gray-500',
          text: t('settings.security.syncStatusIdle'),
          bgClass: 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${statusConfig.bgClass} ${className}`}>
      <StatusIcon className={`w-4 h-4 ${statusConfig.iconClass}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {statusConfig.text}
        </div>
        {syncStatus !== 'syncing' && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{formatLastSyncTime()}</span>
          </div>
        )}
        {lastError && syncStatus === 'error' && (
          <div className="text-xs text-red-600 dark:text-red-400 mt-1 truncate" title={lastError}>
            {lastError}
          </div>
        )}
      </div>
    </div>
  );
}
