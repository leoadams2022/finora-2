// src/components/common/AttachmentUploader.jsx

import React from "react";
import { Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const AttachmentUploader = ({ files = [], onAddFiles, onRemoveFile }) => {
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(Array.from(e.target.files));
      e.target.value = ""; // Reset input
    }
  };

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 leading-tight">
        Attachments & Receipts{" "}
        <span className="text-[11px] sm:text-xs text-slate-400 font-normal block sm:inline mt-0.5 sm:mt-0">
          (JPG, PNG, WEBP, PDF - Max 5MB)
        </span>
      </label>

      {/* Upload Button Box */}
      <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 sm:p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800 transition touch-manipulation min-h-17.5 flex items-center justify-center">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileChange}
          className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center space-y-1 pointer-events-none">
          <Paperclip className="h-5 w-5 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 leading-tight">
            Click or drag files to attach receipts
          </span>
        </div>
      </div>

      {/* File Previews List */}
      {files.length > 0 && (
        <div className="space-y-1.5 pt-0.5">
          {files.map((file, idx) => {
            const isImage =
              file.type?.startsWith("image/") ||
              file.dataUrl?.startsWith("data:image/");
            return (
              <div
                key={file.id || idx}
                className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs gap-2"
              >
                <div className="flex items-center space-x-2 truncate min-w-0 flex-1">
                  {isImage ? (
                    <ImageIcon className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                  )}
                  <div className="truncate min-w-0 flex-1">
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate block leading-tight">
                      {file.fileName || file.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {formatBytes(file.fileSize || file.size || 0)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveFile(idx, file)}
                  className="p-1.5 sm:p-1 text-slate-400 hover:text-rose-500 active:bg-slate-200 dark:active:bg-slate-700 transition rounded touch-manipulation shrink-0 min-w-8 min-h-8 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                  aria-label="Remove attachment"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AttachmentUploader;
