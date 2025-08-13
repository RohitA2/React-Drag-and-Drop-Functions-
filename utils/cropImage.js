export const getCroppedImg = (cropper) => {
  return new Promise((resolve, reject) => {
    try {
      if (!cropper) {
        reject(new Error("Cropper instance not found"));
        return;
      }

      cropper.getCroppedCanvas().toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve(url);
      }, "image/png");
    } catch (error) {
      reject(error);
    }
  });
};
