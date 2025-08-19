import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { confirmAlert } from "react-confirm-alert"; // Pastikan kamu mengimpor confirmAlert

const Beranda = () => {
  const [title, setTitle] = useState("Verifikasi Email Berhasil");
  const [contain, setContain] = useState("");
  const [footer, setFoot] = useState(
    "Terima kasih telah melakukan pendaftaran integrasi pelaporan SIRS."
  );

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("HAIIII")
    const segments = window.location.pathname.split("/").filter(Boolean);
    const getSubdomain = segments[segments.length - 2] || "";
    const dynamicParam = segments[segments.length - 1] || "";

    if (getSubdomain === "konfirmasiemail" && dynamicParam) {
      checkToken(dynamicParam);
    } else {
      // Kalau bukan konfirmasiemail, tidak tampilkan apa-apa
      setLoading(false); 
    }
  }, []);

  const checkToken = async (param) => {
    try {
      const results = await axios.get(
        `/apisirs6v2/apiregistration/verifikasiemail/${param}`
      );

      // Tentukan warna dan konten berdasarkan status
      if (results.status === 201) {
        const okTitle = "Verifikasi Email Berhasil";
        const okMsg =
          "Proses Registrasi Dalam Proses Review oleh Admin. Silakan Login ke https://sirs6.kemkes.go.id/v3/ untuk Monitoring Progress Validasi.";

        setTitle(okTitle);
        setContain(okMsg);
        showAlert(okTitle, okMsg, "#4CAF50");  // Hijau (Success)
      } else {
        const failTitle = "Verifikasi Email Gagal";
        const failMsg =
          "Proses Registrasi Gagal. Anda akan diarahkan ke beranda dalam beberapa detik.";

        setTitle(failTitle);
        setContain(failMsg);
        showAlert(failTitle, failMsg, "#F44336");  // Merah (Error)
      }
    } catch (error) {
      const apiMsg =
        error?.response?.data?.message ||
        "Terjadi kesalahan saat memverifikasi email.";

      setTitle("Verifikasi Email Gagal");
      setContain(apiMsg);
      toast(apiMsg, { position: toast.POSITION.TOP_RIGHT });
      showAlert("Verifikasi Email Gagal", apiMsg, "#F44336");  // Merah (Error)
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (alertTitle, alertMessage, titleColor) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div style={styles.customDialog}>
          <h2 style={{ ...styles.dialogTitle, color: titleColor }}>
            {alertTitle}
          </h2>
          <p style={styles.dialogMessage}>{alertMessage}</p>
          <div style={styles.dialogFooter}>
            <button
              onClick={onClose}
              style={styles.dialogButton}
            >
              Tutup
            </button>
          </div>
        </div>
      ),
    });
  };

  const styles = {
    customDialog: {
      padding: "20px",
      borderRadius: "8px",
      backgroundColor: "#f4f4f9",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      textAlign: "center",
      width: "400px",
      maxWidth: "100%",
      margin: "0 auto",
    },
    dialogTitle: {
      fontSize: "24px",
      fontWeight: "bold",
    },
    dialogMessage: {
      fontSize: "18px",
      color: "#555",
    },
    dialogFooter: {
      marginTop: "20px",
    },
    dialogButton: {
      padding: "10px 20px",
      fontSize: "16px",
      color: "#fff",
      backgroundColor: "#4CAF50",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
  };

  return (
    <>
      {/* <ToastContainer /> */}
    </>
  );
};

export default Beranda;
