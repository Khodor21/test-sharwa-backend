const { bucket } = require("../config/firebase");

const getContentType = (mimetype) => {
  const mimeTypes = {
    "image/jpeg": "image/jpeg",
    "image/jpg": "image/jpeg",
    "image/png": "image/png",
    "image/svg+xml": "image/svg+xml",
  };
  return mimeTypes[mimetype] || "application/octet-stream";
};

const uploadImageToFirebase = async (buffer, fileName, mimetype, type) => {
  const destination = `${type}/${fileName}`;
  const file = bucket.file(destination);
  const contentType = getContentType(mimetype);

  try {
    await file.save(buffer, { metadata: { contentType } });

    const [url] = await file.getSignedUrl({
      action: "read",
      expires: "03-01-2050",
    });

    return url;
  } catch (error) {
    console.error("Error uploading file to Firebase:", error);
    throw error;
  }
};

module.exports = { uploadImageToFirebase };
