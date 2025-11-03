import { initializeGlobalFunctions } from './interactiveHelpers';

export { initializeGlobalFunctions };

export const slideInLeftStyle = `
  @keyframes slide-in-left {
    0% {
      transform: translateX(-100%);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in-left {
    animation: slide-in-left 0.3s ease-out;
  }
  
  /* Font family CSS for Quill editor */
  .ql-font-arial {
    font-family: Arial, sans-serif;
  }
  .ql-font-helvetica {
    font-family: Helvetica, sans-serif;
  }
  .ql-font-times {
    font-family: Times, serif;
  }
  .ql-font-courier {
    font-family: Courier, monospace;
  }
  .ql-font-verdana {
    font-family: Verdana, sans-serif;
  }
  .ql-font-georgia {
    font-family: Georgia, serif;
  }
  .ql-font-impact {
    font-family: Impact, sans-serif;
  }
  .ql-font-roboto {
    font-family: Roboto, sans-serif;
  }
  
  /* Fix font picker to show actual font names */
  .ql-picker.ql-font .ql-picker-item[data-value=""]::before {
    content: "Sans Serif" !important;
  }
  .ql-picker.ql-font .ql-picker-item[data-value="arial"]::before {
    content: "Arial" !important;
    font-family: Arial, sans-serif !important;
  }
  .ql-picker.ql-font .ql-picker-item[data-value="helvetica"]::before {
    content: "Helvetica" !important;
    font-family: Helvetica, sans-serif !important;
  }
  .ql-picker.ql-font .ql-picker-item[data-value="times"]::before {
    content: "Times New Roman" !important;
    font-family: Times, serif !important;
  }
  .ql-picker.ql-font .ql-picker-item[data-value="courier"]::before {
    content: "Courier New" !important;
    font-family: Courier, monospace !important;
  }
  .ql-picker.ql-font .ql-picker-item[data-value="verdana"]::before {
    content: "Verdana" !important;
    font-family: Verdana, sans-serif !important;
  }
  .ql-picker.ql-font .ql-picker-item[data-value="georgia"]::before {
    content: "Georgia" !important;
    font-family: Georgia, serif !important;
  }
  .ql-picker.ql-font .ql-picker-item[data-value="impact"]::before {
    content: "Impact" !important;
    font-family: Impact, sans-serif !important;
  }
  .ql-picker.ql-font .ql-picker-item[data-value="roboto"]::before {
    content: "Roboto" !important;
    font-family: Roboto, sans-serif !important;
  }
  
  /* Hide original text and show only ::before content */
  .ql-picker.ql-font .ql-picker-item {
    font-size: 0 !important;
    position: relative !important;
    height: 32px !important;
  }
  
  .ql-picker.ql-font .ql-picker-item::before {
    font-size: 14px !important;
    position: absolute !important;
    left: 12px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    white-space: nowrap !important;
  }
  
  /* Fix size picker to show actual size values */
  .ql-picker.ql-size .ql-picker-item[data-value="10px"]::before {
    content: "10px" !important;
  }
  .ql-picker.ql-size .ql-picker-item[data-value="12px"]::before {
    content: "12px" !important;
  }
  .ql-picker.ql-size .ql-picker-item[data-value="14px"]::before {
    content: "14px" !important;
  }
  .ql-picker.ql-size .ql-picker-item[data-value="16px"]::before {
    content: "16px" !important;
  }
  .ql-picker.ql-size .ql-picker-item[data-value="18px"]::before {
    content: "18px" !important;
  }
  .ql-picker.ql-size .ql-picker-item[data-value="20px"]::before {
    content: "20px" !important;
  }
  .ql-picker.ql-size .ql-picker-item[data-value="24px"]::before {
    content: "24px" !important;
  }
  .ql-picker.ql-size .ql-picker-item[data-value="28px"]::before {
    content: "28px" !important;
  }
  .ql-picker.ql-size .ql-picker-item[data-value="32px"]::before {
    content: "32px" !important;
  }
  .ql-picker.ql-size .ql-picker-item[data-value="36px"]::before {
    content: "36px" !important;
  }
  .ql-picker.ql-size .ql-picker-item[data-value="40px"]::before {
    content: "40px" !important;
  }
  .ql-picker.ql-size .ql-picker-item[data-value="48px"]::before {
    content: "48px" !important;
  }
  .ql-picker.ql-size .ql-picker-item[data-value="56px"]::before {
    content: "56px" !important;
  }
  .ql-picker.ql-size .ql-picker-item[data-value="64px"]::before {
    content: "64px" !important;
  }
  .ql-picker.ql-size .ql-picker-item[data-value="72px"]::before {
    content: "72px" !important;
  }
  
  .ql-picker.ql-size .ql-picker-item {
    font-size: 0 !important;
    position: relative !important;
    height: 32px !important;
  }
  
  .ql-picker.ql-size .ql-picker-item::before {
    font-size: 14px !important;
    position: absolute !important;
    left: 12px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    white-space: nowrap !important;
  }
  
  /* Ensure dropdown positioning works properly */
  .ql-picker-options {
    position: absolute !important;
    top: 100% !important;
    left: 0 !important;
    z-index: 10000 !important;
    background: white !important;
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    min-width: 120px !important;
  }
  
  .ql-picker-item {
    padding: 8px 12px !important;
    cursor: pointer !important;
    white-space: nowrap !important;
  }
  
  .ql-picker-item:hover {
    background-color: #f5f5f5 !important;
  }
  
  /* Font size CSS for Quill editor - expanded sizes */
  .ql-size-10px {
    font-size: 10px;
  }
  .ql-size-12px {
    font-size: 12px;
  }
  .ql-size-14px {
    font-size: 14px;
  }
  .ql-size-16px {
    font-size: 16px;
  }
  .ql-size-18px {
    font-size: 18px;
  }
  .ql-size-20px {
    font-size: 20px;
  }
  .ql-size-24px {
    font-size: 24px;
  }
  .ql-size-28px {
    font-size: 28px;
  }
  .ql-size-32px {
    font-size: 32px;
  }
  .ql-size-36px {
    font-size: 36px;
  }
  .ql-size-40px {
    font-size: 40px;
  }
  .ql-size-48px {
    font-size: 48px;
  }
  .ql-size-56px {
    font-size: 56px;
  }
  .ql-size-64px {
    font-size: 64px;
  }
  .ql-size-72px {
    font-size: 72px;
  }
`;

// Inject the CSS
export const injectStyles = () => {
  if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = slideInLeftStyle;
    document.head.appendChild(styleSheet);
  }
};