// src/components/common/AttachmentItem.jsx
import React from "react";
import { Eye, Download } from "lucide-react";

/**
 * Reusable row item for displaying, previewing, and downloading an attachment record.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.attachment - Attachment record object containing `{ fileName, dataUrl }`.
 * @param {Function} [props.onPreview] - Optional custom preview callback `(attachment)`.
 * @param {Function} [props.onDownload] - Optional custom download callback `(attachment)`.
 * @param {string} [props.className=""] - Additional class overrides for the container.
 */
export const AttachmentItem = ({
  attachment,
  onPreview,
  onDownload,
  className = "",
}) => {
  if (!attachment) return null;

  const handleDefaultDownload = (att) => {
    if (onDownload) {
      onDownload(att);
      return;
    }
    const link = document.createElement("a");
    link.href = att.dataUrl;
    link.download = att.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDefaultPreview = (att) => {
    if (onPreview) {
      onPreview(att);
      return;
    }
    const win = window.open();
    if (win) {
      win.document.write(
        `<iframe src="${att.dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`,
      );
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-2 sm:p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs ${className}`}
    >
      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-40 sm:max-w-xs">
        {attachment.fileName}
      </span>

      <div className="flex items-center space-x-1 shrink-0 ml-2">
        <button
          type="button"
          onClick={() => handleDefaultPreview(attachment)}
          className="p-1.5 sm:p-1 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 active:bg-slate-200 dark:active:bg-slate-700 rounded transition touch-manipulation min-w-8 min-h-8 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
          title="Preview File"
          aria-label="Preview File"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleDefaultDownload(attachment)}
          className="p-1.5 sm:p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 active:bg-slate-200 dark:active:bg-slate-700 rounded transition touch-manipulation min-w-8 min-h-8 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
          title="Download File"
          aria-label="Download File"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AttachmentItem;
