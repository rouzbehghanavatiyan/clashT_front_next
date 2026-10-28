let heldFile: File | null = null;
let heldObjectUrl: string | null = null;

export function setCreateMediaFile(file: File | null) {
  if (heldObjectUrl) {
    URL.revokeObjectURL(heldObjectUrl);
    heldObjectUrl = null;
  }
  heldFile = file;
}

export function getCreateMediaFile() {
  return heldFile;
}

export function createMediaObjectUrl(file: File) {
  setCreateMediaFile(file);
  heldObjectUrl = URL.createObjectURL(file);
  return heldObjectUrl;
}

export function clearCreateMediaFile() {
  setCreateMediaFile(null);
}
