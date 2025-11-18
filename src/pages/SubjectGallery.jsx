// src/pages/SubjectGallery.jsx
import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

export const SubjectGallery = () => {
  const { id: subject } = useParams();
  const { user } = useAuth();

  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // للـ Gallery
  const fileInputRef = useRef(null);

  // لمعاينة الصورة بحجم كبير
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // للكاميرا
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // ================== أدوات مساعدة ==================

  // تحويل ملف لصيغة base64
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // تحميل كل الصور لهذه المادة + هذا المستخدم من Firestore
  const fetchPhotos = async () => {
    if (!user) return;

    setLoadingPhotos(true);
    setError("");

    try {
      const q = query(
        collection(db, "photos"),
        where("subject", "==", subject),
        where("userId", "==", user.uid)
      );

      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPhotos(list);
    } catch (err) {
      console.error("fetchPhotos error:", err);
      setError(err.message);
    } finally {
      setLoadingPhotos(false);
    }
  };

  // استدعاء أولي عند فتح صفحة المادة أو تغيير المستخدم
  useEffect(() => {
    fetchPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, user?.uid]);

  // رفع dataUrl إلى Firestore ثم إعادة تحميل الصور
  const uploadDataUrl = async (dataUrl) => {
    if (!user) return;
    setUploading(true);
    setError("");

    try {
      await addDoc(collection(db, "photos"), {
        subject,
        dataUrl,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      // بعد نجاح الرفع، نعيد تحميل القائمة
      await fetchPhotos();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // ================== GALLERY ==================

  const handleGalleryClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleGalleryChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      await uploadDataUrl(dataUrl);
    } finally {
      e.target.value = "";
    }
  };

  // ================== CAMERA ==================

  const openCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera is not supported in this browser.");
      return;
    }

    try {
      setCameraError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraOpen(true);
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError(err.message);
    }
  };

  const stopCamera = () => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOpen(false);
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const width = video.videoWidth || 800;
    const height = video.videoHeight || 600;

    // تصغير الصورة حتى لا تكون ثقيلة جداً
    const maxWidth = 900;
    const scale = Math.min(maxWidth / width, 1);
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

    stopCamera();
    await uploadDataUrl(dataUrl);
  };

  // إيقاف الكاميرا عند مغادرة الصفحة
  useEffect(() => {
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================== DELETE & PREVIEW ==================

  const handleDelete = async (photoId) => {
    const ok = window.confirm("Delete this photo?");
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "photos", photoId));
      await fetchPhotos();
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message);
    }
  };

  const openPreview = (photo) => {
    setPreviewPhoto(photo);
  };

  const closePreview = () => {
    setPreviewPhoto(null);
  };

  // ================== RENDER ==================

  return (
    <div className="subject-page subject-page-mobile">
      <header className="subject-header">
        <div>
          <h1>{subject.toUpperCase()}</h1>
          <p>Lecture photos</p>
        </div>
        <Link to="/" className="back-link">
          ← Back
        </Link>
      </header>

      {/* أزرار للموبايل: كاميرا + Gallery + Refresh */}
      <section className="subject-actions mobile-actions">
        <button
          type="button"
          className="primary-mobile-btn"
          onClick={openCamera}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Take photo (Camera)"}
        </button>

        <button
          type="button"
          className="secondary-mobile-btn"
          onClick={handleGalleryClick}
          disabled={uploading}
        >
          Upload from gallery
        </button>

        <button
          type="button"
          className="secondary-mobile-btn"
          onClick={fetchPhotos}
          disabled={loadingPhotos}
        >
          {loadingPhotos ? "Refreshing..." : "Refresh photos"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleGalleryChange}
          style={{ display: "none" }}
        />
      </section>

      <section className="photos-section">
        <div className="photos-header">
          <h2>Photos</h2>
          {loadingPhotos && <span>Loading...</span>}
        </div>

        {error && (
          <p className="auth-message" style={{ color: "#fca5a5" }}>
            {error}
          </p>
        )}

        {!loadingPhotos && photos.length === 0 && !error && (
          <p className="empty-state">No photos yet for this subject.</p>
        )}

        <div className="photos-grid">
          {photos.map((p) => (
            <div key={p.id} className="photo-card">
              <img
                src={p.dataUrl}
                alt={subject}
                onClick={() => openPreview(p)}
                style={{ cursor: "pointer" }}
              />
              <button
                className="delete-btn"
                type="button"
                onClick={() => handleDelete(p.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* مودال تكبير الصورة */}
      {previewPhoto && (
        <div className="photo-modal-overlay" onClick={closePreview}>
          <div
            className="photo-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={previewPhoto.dataUrl} alt={subject} />
            <div className="photo-modal-footer">
              <span>{subject.toUpperCase()}</span>
              <button
                type="button"
                className="photo-modal-close"
                onClick={closePreview}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال الكاميرا */}
      {cameraOpen && (
        <div className="camera-modal-overlay" onClick={stopCamera}>
          <div
            className="camera-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <video ref={videoRef} autoPlay playsInline muted />
            {cameraError && (
              <p className="auth-message" style={{ color: "#fca5a5" }}>
                {cameraError}
              </p>
            )}
            <div className="camera-controls">
              <button
                type="button"
                className="camera-btn"
                onClick={handleCapture}
              >
                Capture
              </button>
              <button
                type="button"
                className="camera-btn camera-btn-cancel"
                onClick={stopCamera}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
