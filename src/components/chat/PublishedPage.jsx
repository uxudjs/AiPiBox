/**
 * 已发布内容的预览页面
 * 获取并展示数据库中存储的已发布代码片段（HTML/CSS/JS），通过 iframe 进行隔离渲染。
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../db';
import { Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../i18n';

/**
 * 发布预览页面组件
 * @param {object} props - 组件属性
 * @param {string} [props.id] - 发布项的唯一 ID
 */
const PublishedPage = ({ id: propId }) => {
  const { t } = useTranslation();
  const params = useParams();
  const id = propId || params.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    db.published.get(id).then(res => {
      setData(res);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!data) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <AlertCircle className="w-12 h-12 text-destructive mb-4" />
      <h1 className="text-xl font-bold">{t('plusMenu.contentNotFound')}</h1>
      <p className="text-muted-foreground">{t('plusMenu.pageNotExist')}</p>
    </div>
  );

  const { content, language } = data;
  const srcDoc = language === 'html' ? content : `
    <html>
      <head>
        <style>${language === 'css' ? content : ''}</style>
      </head>
      <body>
        <div id="root"></div>
        <script>${language === 'javascript' || language === 'js' ? content : ''}</script>
      </body>
    </html>
  `;

  return (
    <div className="h-screen w-full bg-white">
      <iframe 
        srcDoc={srcDoc} 
        className="w-full h-full border-none"
        title="published-content"
        sandbox="allow-scripts"
      />
    </div>
  );
};

export default PublishedPage;