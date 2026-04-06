import { useState, useRef, ChangeEvent } from "react";
import { Camera, Upload, X, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";
import { validateImageFormat } from "@/services/diseaseService";

export interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

export default function ImageUpload({
  onImageSelect,
  disabled = false,
  maxSizeMB = 5,
  acceptedFormats = ["image/jpeg", "image/png", "image/webp"],
}: ImageUploadProps) {
  const isMobile = useIsMobile();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }

    // Clear previous error
    setError(null);

    // Validate file format and size
    const validation = validateImageFormat(file);
    
    if (!validation.isValid) {
      setError(validation.error || "Invalid file type. Please upload JPEG, PNG, or WebP.");
      // Clear the input
      if (event.target) {
        event.target.value = "";
      }
      return;
    }

    // Set selected file
    setSelectedFile(file);
    
    // Generate preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    
    // Notify parent component
    onImageSelect(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setError(null);
    
    // Revoke the preview URL to free memory
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    
    // Clear file inputs
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(",")}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
        aria-label="Upload image"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept={acceptedFormats.join(",")}
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
        aria-label="Capture image"
      />

      {/* Image Preview */}
      {preview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/20 bg-[#141e14]"
        >
          <img
            src={preview}
            alt="Selected crop image"
            className="w-full h-auto max-h-[400px] object-contain"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
            onClick={handleClearImage}
            disabled={disabled}
            aria-label="Clear image"
          >
            <X size={16} />
          </motion.button>
          {selectedFile && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-slate-200 text-xs p-2">
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Upload Buttons */}
      {!preview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {/* Camera Button (Mobile Only) */}
          {isMobile && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button
                onClick={handleCameraClick}
                disabled={disabled}
                className="w-full h-auto min-h-[44px] py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white"
                variant="default"
              >
                <Camera className="mr-2" size={20} />
                Capture Photo
              </Button>
            </motion.div>
          )}
          
          {/* Upload Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1"
          >
            <Button
              onClick={handleUploadClick}
              disabled={disabled}
              className={`w-full h-auto min-h-[44px] py-3 px-4 ${
                isMobile 
                  ? "bg-[#141e14] border-2 border-emerald-500/30 hover:border-emerald-500/50 text-slate-200" 
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
              variant={isMobile ? "outline" : "default"}
            >
              <Upload className="mr-2" size={20} />
              Upload Image
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Upload Area (when no image selected) */}
      {!preview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            boxShadow: [
              "0 0 0 0 rgba(16, 185, 129, 0.4)",
              "0 0 0 8px rgba(16, 185, 129, 0)",
              "0 0 0 0 rgba(16, 185, 129, 0)"
            ]
          }}
          transition={{
            opacity: { duration: 0.3, delay: 0.2 },
            y: { duration: 0.3, delay: 0.2 },
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              repeatType: "loop"
            }
          }}
          whileHover={{ 
            scale: 1.01,
            borderColor: "rgba(16, 185, 129, 0.5)"
          }}
          className="border-2 border-dashed border-emerald-500/20 rounded-2xl p-8 text-center cursor-pointer bg-[#141e14] hover:bg-[#1a2820] transition-all duration-300"
          onClick={handleUploadClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleUploadClick();
            }
          }}
          aria-label="Click to upload image"
        >
          <motion.div
            animate={{ 
              y: [0, -8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut"
            }}
          >
            <ImageIcon className="mx-auto mb-3 text-emerald-500" size={48} />
          </motion.div>
          <p className="text-sm text-slate-300 mb-1 font-medium">
            Select or capture an image to begin
          </p>
          <p className="text-xs text-slate-400">
            JPEG, PNG, or WebP (max {maxSizeMB}MB)
          </p>
        </motion.div>
      )}
    </div>
  );
}
