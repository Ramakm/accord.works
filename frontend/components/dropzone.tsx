"use client"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud } from "lucide-react"
import { cn } from "@/lib/utils"

export function FileDropzone({ onFiles, className }: { onFiles: (files: File[]) => void; className?: string }) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) onFiles(acceptedFiles)
  }, [onFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: { "application/pdf": [".pdf"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"], "text/plain": [".txt"] } })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-10 text-center transition hover:bg-slate-50",
        isDragActive && "border-indigo-400 bg-indigo-50/50",
        className
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className="mb-3 h-8 w-8 text-indigo-600" />
      <p className="text-sm text-slate-700">Drag & drop your contract here, or click to upload</p>
      <p className="text-xs text-slate-500">PDF, DOCX, or TXT</p>
    </div>
  )
}
