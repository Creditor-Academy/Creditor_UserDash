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
  
  /* Fix size picker to show actual size names */
  .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
    content: "Small" !important;
  }
  .ql-picker.ql-size .ql-picker-item[data-value=""]::before {
    content: "Normal" !important;
  }
  .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
    content: "Large" !important;
  }
  .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
    content: "Huge" !important;
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
  
  /* Font size CSS for Quill editor */
  .ql-size-small {
    font-size: 0.75em;
  }
  .ql-size-large {
    font-size: 1.5em;
  }
  .ql-size-huge {
    font-size: 2.5em;
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