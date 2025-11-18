// src/pages/SubjectGallery.jsx
import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
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
  const [showPhotos, setShowPhotos] = useState(false);

  // لفتح الكاميرا / اختيار الصورة
  const fileInputRef = useRef(null);

  // للصورة التي نعرضها بشكل كبير
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // تحويل ملف لصيغة base64
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // تحميل صور هذه المادة فقط عندما نضغط "Show photos"
  useEffect(() => {
    if (!showPhotos) return;

    setLoadingPhotos(true);
    setError("");

    const q = query(
      collection(db, "photos"),
      where("subject", "==", subject)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPhotos(list);
        setLoadingPhotos(false);
      },
      (err) => {
        console.error("Firestore onSnapshot error:", err);
        setError(err.message);
        setLoadingPhotos(false);
      }
    );

    return () => unsub();
  }, [subject, showPhotos]);

  const handleAddPhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAddPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setError("");

    try {
      const dataUrl = await fileToDataUrl(file);

      await addDoc(collection(db, "photos"), {
        subject,
        dataUrl,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (photoId) => {
    const ok = window.confirm("Delete this photo?");
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "photos", photoId));
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

      {/* أزرار مهيأة للموبايل */}
      <section className="subject-actions mobile-actions">
        <button
          type="button"
          className="primary-mobile-btn"
          onClick={handleAddPhotoClick}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Add photo (Camera)"}
        </button>

        <button
          type="button"
          className="secondary-mobile-btn"
          onClick={() => setShowPhotos(true)}
        >
          {showPhotos ? "Refresh photos" : "Show photos"}
        </button>

        {/* input مخفي مربوط بالكاميرا على الهاتف */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleAddPhoto}
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

        {showPhotos && !loadingPhotos && photos.length === 0 && !error && (
          <p className="empty-state">No photos yet for this subject.</p>
        )}

        <div className="photos-grid">
          {photos.map((p) => (
            <div key={p.id} className="photo-card">
              {/* عند الضغط على الصورة تفتح في مودال كبير */}
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
            onClick={(e) => e.stopPropagation()} // حتى لا يُغلق عند الضغط داخل المودال
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
    </div>
  );
};
