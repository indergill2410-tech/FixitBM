export const jobPhotoBucket = "job-photos";
export const verificationBucket = "verification-documents";
export const safetyCheckPhotoBucket = "safety-check-photos";

export const jobPhotoTypes = ["image/jpeg", "image/png", "image/webp"];
export const verificationTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
export const safetyCheckPhotoTypes = ["image/jpeg", "image/png", "image/webp"];

export const maxJobPhotoBytes = 10 * 1024 * 1024;
export const maxVerificationBytes = 15 * 1024 * 1024;
export const maxSafetyCheckPhotoBytes = 10 * 1024 * 1024;

export function safeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

export function storagePath(parts: string[], fileName: string) {
  return [...parts.map((part) => part.replace(/[^a-zA-Z0-9_-]/g, "")), `${Date.now()}-${safeFileName(fileName)}`].join("/");
}
