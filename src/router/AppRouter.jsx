import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import LoadingFallback from '../components/ui/LoadingFallback';
import ErrorBoundary from '../components/ErrorBoundary';

// 懒加载页面组件
const ChatArea = lazy(() => import('../components/chat/ChatArea'));
const ImageFactory = lazy(() => import('../components/image/ImageFactory'));
const PublishedPage = lazy(() => import('../components/chat/PublishedPage'));

/**
 * 应用路由配置
 * 定义了应用的主要导航结构和视图注册机制
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ChatArea />
          </Suspense>
        ),
      },
      {
        path: 'image',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ImageFactory />
          </Suspense>
        ),
      },
      {
        path: 'c/:conversationId',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ChatArea />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/publish/:id',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <PublishedPage />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
