/**
 * 身份验证/登录屏组件
 * 提供应用首次启动时的密码设置，以及后续使用时的解锁功能。
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Lock, ShieldAlert, ShieldCheck, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useAuthStore } from '../../store/useAuthStore';

/**
 * 登录界面组件
 * @param {object} props - 组件属性
 * @param {boolean} props.isInitialized - 应用是否已设置过主密码
 */
const LoginScreen = ({ isInitialized }) => {
  const { t } = useTranslation();
  const { setupPassword, login, validatePassword } = useAuthStore();
  
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 提交登录或注册密码请求
   * @param {Event} e - 表单提交事件
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setError('');
    setIsSubmitting(true);
    
    try {
      if (!isInitialized) {
        if (!validatePassword(password)) {
          setError(t('auth.passwordWeak'));
          setIsSubmitting(false);
          return;
        }
        await setupPassword(password);
      } else {
        const success = await login(password);
        if (!success) {
          setError(t('auth.passwordError'));
        }
      }
    } catch (err) {
      setError(err.message || t('auth.errorOccurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background p-4 animate-in fade-in duration-500">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl shadow-xl border">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {isInitialized ? (
              <Lock className="w-6 h-6 text-primary" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-primary" />
            )}
          </div>
          <h2 className="text-2xl font-bold">
            {isInitialized ? t('auth.welcomeBack') : t('auth.initSecurity')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isInitialized ? t('auth.unlockHint') : t('auth.setupHint')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              className="w-full px-4 py-3 bg-accent rounded-xl border-none focus:ring-2 focus:ring-primary transition-shadow"
              disabled={isSubmitting}
              autoFocus
            />
            {error && <p className="text-xs text-destructive px-2 pt-1 animate-in slide-in-from-top-1">{error}</p>}
          </div>
          
          {!isInitialized && (
            <div className="text-[10px] text-muted-foreground bg-accent/30 p-3 rounded-lg flex gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-primary" />
              <span>{t('auth.encryptionNote')}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !password}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isInitialized ? t('auth.unlock') : t('auth.start')}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

LoginScreen.propTypes = {
  isInitialized: PropTypes.bool.isRequired
};

export default LoginScreen;