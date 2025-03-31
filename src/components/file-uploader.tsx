
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, File, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploaderProps {
  onFileUpload: (file: File) => void
  isLoading?: boolean
  acceptedFileTypes?: Record<string, string[]>
}

export function FileUploader({ onFileUpload, isLoading = false, acceptedFileTypes }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0])
      }
    },
    [onFileUpload],
  )

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles: 1,
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: () => setDragActive(false),
  })

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer
        ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20"}
        ${isDragReject ? "border-destructive bg-destructive/5" : ""}
        hover:border-primary/50 hover:bg-primary/5
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        {isLoading ? (
          <>
            <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
            <div>
              <p className="font-medium">Processing your resume...</p>
              <p className="text-sm text-muted-foreground mt-1">This may take a moment</p>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 rounded-full bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-medium">Drag and drop your resume here</p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
            </div>
            <Button variant="outline" type="button" size="sm">
              <File className="mr-2 h-4 w-4" />
              Select File
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

