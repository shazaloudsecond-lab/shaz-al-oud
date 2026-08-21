export interface UploadProgressResponse {
  url?: string;
  error?: string;
  [key: string]: any;
}

/**
 * Uploads a file/formData with real-time percentage progress callback (0 - 100)
 */
export function uploadWithProgress(
  endpoint: string,
  formData: FormData,
  onProgress?: (percentage: number) => void
): Promise<UploadProgressResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          // Calculate percentage from 0 to 95 while uploading bytes
          const percent = Math.round((event.loaded / event.total) * 95);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (onProgress) onProgress(100);
      try {
        const response: UploadProgressResponse = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response);
        } else {
          reject(new Error(response.error || `Upload failed with status ${xhr.status}`));
        }
      } catch (err) {
        reject(new Error("Failed to parse upload response."));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during file upload."));
    };

    xhr.ontimeout = () => {
      reject(new Error("Upload request timed out."));
    };

    xhr.send(formData);
  });
}
