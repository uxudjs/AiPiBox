/**
 * 本地文档解析服务
 * 负责从多种文件格式（PDF, Word, PPT, Excel, Text）中提取可读文本
 * 实现逻辑完全基于浏览器端，保护隐私且无需后端 OCR 资源
 */
import { logger } from './logger';
import * as pdfjsLib from 'pdfjs-dist';

/**
 * PDF Worker CDN 容灾列表
 * 确保在本地 Worker 加载受阻时仍能正常解析 PDF
 */
const PDF_WORKER_CDNS = [
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
  'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
  'https://s4.zstatic.net/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
];

// 单个文件最大解析限制 (20MB)，避免大文件导致浏览器卡顿
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
    description: '演示文稿'
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
    description: '文本文件'
  }
};

/**
 * 初始化 PDF 解析运行时
 * 优先采用 Vite 资源路径，其次自动轮询 CDN 回退
 */
const initPdfWorker = async () => {
  if (pdfjsLib.GlobalWorkerOptions.workerSrc) return;

  try {
    // 尝试使用 Vite 推荐的资源导入方式加载本地 worker
    // 优先尝试本地 node_modules 中的 worker 文件
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url
    ).href;
  } catch (e) {
    logger.warn('DocumentParser', 'Failed to load local PDF worker, setting initial fallback', e);
    // 设置第一个 CDN 作为默认回退
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_CDNS[0];
  }
};

/**
 * 文件解析预校验
 */
export function validateFile(file) {
  logger.info('DocumentParser', 'Validating file:', file.name);
  
  // 检查文件大小
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`文件大小超过限制 (${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB)`);
  }
  
  // 检查文件类型
  const fileType = getFileType(file);
  if (!fileType) {
    throw new Error(`不支持的文件类型: ${file.name}`);
  }
  
  return fileType;
}

/**
 * 推断文件类型标识
 * 结合文件扩展名与 MIME 类型进行二次确认
 */
export function getFileType(file) {
  const fileName = typeof file === 'string' ? file : file.name;
  const fileMimeType = typeof file === 'object' ? file.type : '';
  
  for (const [type, config] of Object.entries(SUPPORTED_TYPES)) {
    // 优先检查扩展名，因为MIME类型可能不准确
    const ext = fileName.toLowerCase().match(/\.[^.]+$/)?.[0];
    if (ext && config.extensions.includes(ext)) {
      return type;
    }
    
    // 其次检查MIME类型
    if (fileMimeType && config.mimeTypes.includes(fileMimeType)) {
      return type;
    }
  }
  return null;
}

/**
 * PDF 文件解析逻辑
 * 实现多层级错误重试与文本层提取
 */
async function parsePDF(file) {
  await initPdfWorker();
  
  const arrayBuffer = await file.arrayBuffer();
  
  let pdf = null;
  let lastError = null;
  
  // 第一次尝试：使用当前配置的 workerSrc (本地或首选CDN)
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    pdf = await loadingTask.promise;
  } catch (error) {
    logger.warn('DocumentParser', 'PDF parsing failed with current worker, trying fallback CDNs', error);
    lastError = error;
    
    // 如果失败，轮询所有 CDN 尝试恢复
    for (const cdnUrl of PDF_WORKER_CDNS) {
      // 如果当前 workerSrc 已经是这个 CDN，跳过以避免重复尝试
      if (pdfjsLib.GlobalWorkerOptions.workerSrc === cdnUrl) continue;
      
      try {
        logger.info('DocumentParser', 'Switching PDF worker to:', cdnUrl);
        pdfjsLib.GlobalWorkerOptions.workerSrc = cdnUrl;
        
        // 重新尝试加载文档
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        pdf = await loadingTask.promise;
        
        lastError = null; // 成功恢复
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
 */
async function parseWord(file) {
  const { default: mammoth } = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  
  return {
    text: result.value, // 提取的原始文本
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
 * 将各 sheet 转换为 CSV 风格的纯文本
 */
async function parseExcel(file) {
  const XLSX = await import('xlsx');
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  let fullText = '';
  
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    // 将工作表转换为CSV格式的文本
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
 * 通过解压并解析 OpenXML 结构提取每页幻灯片的文字
 */
async function parsePowerPoint(file) {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const content = await zip.loadAsync(file);
  let fullText = '';
  let slideCount = 0;
  
  // 查找所有幻灯片文件
  const slideFiles = Object.keys(content.files).filter(fileName => 
    fileName.match(/ppt\/slides\/slide\d+\.xml/)
  );
  
  // 按顺序排序 (slide1.xml, slide2.xml ...)
  slideFiles.sort((a, b) => {
    const numA = parseInt(a.match(/slide(\d+)\.xml/)[1]);
    const numB = parseInt(b.match(/slide(\d+)\.xml/)[1]);
    return numA - numB;
  });

  for (const fileName of slideFiles) {
    slideCount++;
    const xmlContent = await content.files[fileName].async('text');
    
    // 使用简单的正则提取文本 (a:t 标签通常包含文本)
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
    // 处理旧版二进制格式
    if (file.name.endsWith('.ppt')) {
      throw new Error('仅支持 .pptx 格式的 PowerPoint 文件，请将文件另存为 .pptx 后重试。');
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
 */
async function parseText(file) {
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
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file);
  });
}

/**
 * 文档解析调度中心
 * 根据文件类型自动分配相应的解析器
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
 * 将解析出的结构化数据序列化
 * 生成包含文件元信息的提示词上下文，并自动截断超长文本
 */
export function formatDocumentForAI(parsedDoc, maxLength = 32000) {
  let content = parsedDoc.text || '';
  
  // 文本预清洗：统一换行符并折叠连续空白
  content = content.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  
  if (content.length > maxLength) {
    const truncated = content.substring(0, maxLength);
    content = truncated + '\n\n[... 内容已截断，完整内容请查看原文档 ...]';
  }
  
  const metadata = parsedDoc.metadata || {};
  let header = `文档信息\n`;
  header += `文件名: ${metadata.fileName}\n`;
  header += `类型: ${metadata.fileType}\n`;
  if (metadata.pages) header += `页数: ${metadata.pages}\n`;
  if (metadata.sheets) header += `工作表: ${metadata.sheets.join(', ')}\n`;
  if (metadata.slides) header += `幻灯片数: ${metadata.slides}\n`;
  header += `大小: ${(metadata.fileSize / 1024).toFixed(2)} KB\n`;
  header += `-------------------\n\n`;
  
  return header + content;
}
