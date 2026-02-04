import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../db';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * 发布页面组件
 * 用于展示已发布的代码内容（HTML/CSS/JavaScript）
 * @param {Object} props
 * @param {string} props.id - 发布页面的ID（可选，兼容路由参数）
 */
const PublishedPage = ({ id: propId }) => {
  const params = useParams();
  const id = propId || params.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 加载发布的内容
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

  // 内容不存在
  if (!data) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <AlertCircle className="w-12 h-12 text-destructive mb-4" />
      <h1 className="text-xl font-bold">内容未找到</h1>
      <p className="text-muted-foreground">该发布页面不存在或已被删除。</p>
    </div>
  );

  // 根据语言类型构建预览内容
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
