/**
 * 本地文档解析服务
 * 负责从多种文件格式（PDF, Word, PPT, Excel, Text）中提取可读文本。
 * 实现逻辑完全基于浏览器端，保护隐私且无需后端 OCR 资源。
 */

import { logger } from './logger';
import * as pdfjsLib from 'pdfjs-dist';
import { useI18nStore } from '../i18n';

/**
 * PDF Worker CDN 容灾列表
 */
const PDF_WORKER_CDNS = [
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
  'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
  'https://s4.zstatic.net/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
];

const MAX_FILE_SIZE = 20 * 1024 * 1024;

/**
 * 平台支持的文件格式定义
 */
export const SUPPORTED_TYPES = {
  PDF: {
    mimeTypes: ['application/pdf'],
    extensions: ['.pdf'],
    icon: 'PDF',
    description: 'PDF文档'
  },
  WORD: {
    mimeTypes: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    extensions: ['.doc', '.docx'],
    icon: 'DOC',
    description: 'Word文档'
  },
  POWERPOINT: {
    mimeTypes: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ],
    extensions: ['.ppt', '.pptx'],
    icon: 'PPT',
    description: () => {
      const t = useI18nStore.getState().t;
      return t('document.presentation');
    }
  },
  EXCEL: {
    mimeTypes: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    extensions: ['.xls', '.xlsx'],
    icon: 'XLS',
    description: 'Excel表格'
  },
  TEXT: {
    mimeTypes: ['text/plain', 'text/markdown', 'text/x-markdown'],
    extensions: ['.txt', '.md'],
    icon: 'TXT',
    description: () => {
      const t = useI18nStore.getState().t;
      return t('document.textFile');
    }
  }
};

/**
 * 初始化 PDF 解析运行时
 */
const initPdfWorker = async () => {
  if (pdfjsLib.GlobalWorkerOptions.workerSrc) return;

  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url
    ).href;
  } catch (e) {
    logger.warn('DocumentParser', 'Failed to load local PDF worker, setting initial fallback', e);
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_CDNS[0];
  }
};

/**
 * 文件解析预校验
 * @param {File} file - 待校验的文件对象
 * @returns {string} 文件类型标识
 */
export function validateFile(file) {
  logger.info('DocumentParser', 'Validating file:', file.name);
  
  const t = useI18nStore.getState().t;
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(t('document.fileSizeExceeded', { maxSize: (MAX_FILE_SIZE / 1024 / 1024).toFixed(0) }));
  }
  
  const fileType = getFileType(file);
  if (!fileType) {
    throw new Error(t('document.unsupportedFileType', { fileName: file.name }));
  }
  
  return fileType;
}

/**
 * 推断文件类型标识
 * @param {File|string} file - 文件对象或文件名
 * @returns {string|null} 类型标识
 */
export function getFileType(file) {
  const fileName = typeof file === 'string' ? file : file.name;
  const fileMimeType = typeof file === 'object' ? file.type : '';
  
  for (const [type, config] of Object.entries(SUPPORTED_TYPES)) {
    const ext = fileName.toLowerCase().match(/\.[^.]+$/)?.[0];
    if (ext && config.extensions.includes(ext)) {
      return type;
    }
    
    if (fileMimeType && config.mimeTypes.includes(fileMimeType)) {
      return type;
    }
  }
  return null;
}

/**
 * PDF 文件解析逻辑
 * @param {File} file - PDF 文件
 * @returns {Promise<object>} 解析结果
 */
async function parsePDF(file) {
  await initPdfWorker();
  
  const arrayBuffer = await file.arrayBuffer();
  
  let pdf = null;
  let lastError = null;
  
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    pdf = await loadingTask.promise;
  } catch (error) {
    logger.warn('DocumentParser', 'PDF parsing failed with current worker, trying fallback CDNs', error);
    lastError = error;
    
    for (const cdnUrl of PDF_WORKER_CDNS) {
      if (pdfjsLib.GlobalWorkerOptions.workerSrc === cdnUrl) continue;
      
      try {
        logger.info('DocumentParser', 'Switching PDF worker to:', cdnUrl);
        pdfjsLib.GlobalWorkerOptions.workerSrc = cdnUrl;
        
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        pdf = await loadingTask.promise;
        
        lastError = null;
        break; 
      } catch (retryError) {
        logger.warn('DocumentParser', `PDF parsing failed with CDN ${cdnUrl}`, retryError);
        lastError = retryError;
      }
    }
  }

  if (!pdf) {
    throw lastError || new Error('PDF parsing failed after trying all strategies');
  }
  
  let fullText = '';
  const totalPages = pdf.numPages;
  
  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += `--- Page ${i} ---\n${pageText}\n\n`;
  }

  return {
    text: fullText,
    metadata: {
      fileName: file.name,
      fileSize: file.size,
      fileType: 'PDF',
      pages: totalPages,
      lastModified: file.lastModified
    }
  };
}

/**
 * Word (.docx) 文件解析逻辑
 * @param {File} file - Word 文件
 * @returns {Promise<object>} 解析结果
 */
async function parseWord(file) {
  const { default: mammoth } = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  
  return {
    text: result.value,
    metadata: {
      fileName: file.name,
      fileSize: file.size,
      fileType: 'WORD',
      warnings: result.messages,
      lastModified: file.lastModified
    }
  };
}

/**
 * Excel (.xlsx, .xls) 文件解析逻辑
 * @param {File} file - Excel 文件
 * @returns {Promise<object>} 解析结果
 */
async function parseExcel(file) {
  const XLSX = await import('xlsx');
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  let fullText = '';
  
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const txt = XLSX.utils.sheet_to_csv(worksheet);
    if (txt.trim()) {
      fullText += `--- Sheet: ${sheetName} ---\n${txt}\n\n`;
    }
  });

  return {
    text: fullText,
    metadata: {
      fileName: file.name,
      fileSize: file.size,
      fileType: 'EXCEL',
      sheets: workbook.SheetNames,
      lastModified: file.lastModified
    }
  };
}

/**
 * PowerPoint (.pptx) 文件解析逻辑
 * @param {File} file - PPT 文件
 * @returns {Promise<object>} 解析结果
 */
async function parsePowerPoint(file) {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const content = await zip.loadAsync(file);
  let fullText = '';
  let slideCount = 0;
  
  const slideFiles = Object.keys(content.files).filter(fileName => 
    fileName.match(/ppt\/slides\/slide\d+\.xml/)
  );
  
  slideFiles.sort((a, b) => {
    const numA = parseInt(a.match(/slide(\d+)\.xml/)[1]);
    const numB = parseInt(b.match(/slide(\d+)\.xml/)[1]);
    return numA - numB;
  });

  for (const fileName of slideFiles) {
    slideCount++;
    const xmlContent = await content.files[fileName].async('text');
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    const textNodes = xmlDoc.getElementsByTagName("a:t");
    
    let slideText = '';
    for (let i = 0; i < textNodes.length; i++) {
      slideText += textNodes[i].textContent + ' ';
    }
    
    if (slideText.trim()) {
      fullText += `--- Slide ${slideCount} ---\n${slideText.trim()}\n\n`;
    }
  }

  if (fullText.trim() === '') {
    if (file.name.endsWith('.ppt')) {
      const t = useI18nStore.getState().t;
      throw new Error(t('document.pptxOnly'));
    }
    fullText = '[未提取到文本内容，可能是纯图片幻灯片]';
  }

  return {
    text: fullText,
    metadata: {
      fileName: file.name,
      fileSize: file.size,
      fileType: 'POWERPOINT',
      slides: slideCount,
      lastModified: file.lastModified
    }
  };
}

/**
 * 文本类文件解析（Markdown/TXT）
 * @param {File} file - 文本文件
 * @returns {Promise<object>} 解析结果
 */
async function parseText(file) {
  const t = useI18nStore.getState().t;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        text: e.target.result,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: 'TEXT',
          lastModified: file.lastModified
        }
      });
    };
    reader.onerror = () => reject(new Error(t('document.readFailed')));
    reader.readAsText(file);
  });
}

/**
 * 文档解析调度中心
 * @param {File} file - 待解析的文件
 * @param {Function} onProgress - 进度回调函数
 * @returns {Promise<object>} 解析后的结构化数据
 */
export async function parseDocument(file, onProgress = null) {
  logger.info('DocumentParser', 'Start parsing document:', file.name);
  
  try {
    const fileType = validateFile(file);
    
    if (onProgress) onProgress({ status: 'loading_parser', progress: 10 });
    
    let result;
    
    switch (fileType) {
      case 'PDF':
        if (onProgress) onProgress({ status: 'parsing', progress: 20 });
        result = await parsePDF(file);
        break;
      case 'WORD':
        if (onProgress) onProgress({ status: 'parsing', progress: 20 });
        result = await parseWord(file);
        break;
      case 'EXCEL':
        if (onProgress) onProgress({ status: 'parsing', progress: 20 });
        result = await parseExcel(file);
        break;
      case 'POWERPOINT':
        if (onProgress) onProgress({ status: 'parsing', progress: 20 });
        result = await parsePowerPoint(file);
        break;
      case 'TEXT':
        if (onProgress) onProgress({ status: 'reading', progress: 50 });
        result = await parseText(file);
        break;
      default:
        throw new Error('Unsupported file type');
    }
    
    if (onProgress) onProgress({ status: 'completed', progress: 100 });
    
    logger.info('DocumentParser', 'Parsing completed');
    return {
      ...result,
      fileType,
      icon: SUPPORTED_TYPES[fileType].icon
    };
    
  } catch (error) {
    logger.error('DocumentParser', 'Parsing failed:', error);
    throw error;
  }
}

/**
 * 将解析出的数据序列化为 AI 可读文本
 * @param {object} parsedDoc - 解析后的文档对象
 * @param {number} maxLength - 最大文本长度限制
 * @returns {string} 序列化后的文本
 */
export function formatDocumentForAI(parsedDoc, maxLength = 32000) {
  const t = useI18nStore.getState().t;
  let content = parsedDoc.text || '';
  
  content = content.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  
  if (content.length > maxLength) {
    const truncated = content.substring(0, maxLength);
    content = truncated + '\n\n[... ' + t('document.contentTruncated') + ' ...]';
  }
  
  const metadata = parsedDoc.metadata || {};
  let header = t('document.info') + '\n';
  header += t('document.fileName') + ': ' + metadata.fileName + '\n';
  header += t('document.type') + ': ' + metadata.fileType + '\n';
  if (metadata.pages) header += t('document.pages') + ': ' + metadata.pages + '\n';
  if (metadata.sheets) header += t('document.sheets') + ': ' + metadata.sheets.join(', ') + '\n';
  if (metadata.slides) header += t('document.slides') + ': ' + metadata.slides + '\n';
  header += t('document.size') + ': ' + (metadata.fileSize / 1024).toFixed(2) + ' KB\n';
  header += '-------------------\n\n';
  
  return header + content;
}