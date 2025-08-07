import { useEffect, useState,useRef    } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import LoadingSpinner from "./LoadingSpinner";
import { useCSRFTokenContext } from "../Context/CSRFTokenContext";

const Konfirmasi_Email = () => {

  const [expire, setExpire] = useState("");


  const [title, setTitle] = useState("Verifikasi Email Berhasil");
  const [contain, setContain] = useState("");
  const [footer, setFoot] = useState("Terima kasih telah melakukan pendaftaran integrasi pelaporan SIRS.");

  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { simpanCSRFToken, CSRFToken } = useCSRFTokenContext();
  const [token, setToken] = useState("");
  const [statusExp, setStatusExp] = useState("");
  const styles = {
    // Outer container untuk memusatkan semua elemen
    outerContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh', // Mengatur tinggi penuh layar
    },
    container: {
      textAlign: 'center',
      padding: '50px',
      backgroundColor: '#f4f4f9',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      marginTop: '-200px',
      maxWidth: '600px',
      width: '100%', // Memastikan elemen tidak terlalu besar
    },
    heading: {
      // color: '#000000',
      color: title === "Verifikasi Email Berhasil" ? '#4CAF50' : '#F44336',
      fontSize: '32px',
    },
    message: {
      fontSize: '18px',
      color: '#555',
    },
    subMessage: {
      fontSize: '16px',
      color: '#777',
    },
  }

   const hasRunRef = useRef(false);

  useEffect(() => {

if (hasRunRef.current) return; 

    const url = window.location.href; 
    // const baseUrl = url.substring(0, url.lastIndexOf('/')); 
    const dynamicParam = url.substring(url.lastIndexOf('/') + 1);  
    checkToken(dynamicParam)
      // refreshToken();
      // tokenAPI(tokenFromUrl);
      hasRunRef.current = true;
    
  }, []);

  const cek = async (tokenEmail) => {
    
  };

  const checkToken = async (param) => {
    
    try {
      
      const results = await axios.get("/apisirs6v2/apiregistration/verifikasiemail/"+ param);
      console.log("holla ",results.data.message)
      if (results.status == 201){
        setContain("Proses Registrasi Dalam Proses Review oleh Admin. Silakan Login ke https://sirs6.kemkes.go.id/v3/ untuk Monitoring Progress Validasi.")
        // navigate("/verifikasiberhasil");
      }
      else {
        // console.log(results)
        setTitle("Verifikasi Email Gagal")
        setContain("Proses Registrasi Gagal. Anda akan diarahkan ke beranda dalam beberapa detik.")
       
      }
    } catch (error) {
      // console.log("holla3 ",error.response.data.message)
      console.log("holla3 ",error.response)
      setLoading(false);

      toast(error.response.data.message, {
        position: toast.POSITION.TOP_RIGHT,
      });

      setTitle("Verifikasi Email Gagal")
      setContain(error.response.data.message)

      if ((error.response.status = 404)) {
        // toast("Token Tidak ditemukan", {
        //   position: toast.POSITION.TOP_RIGHT,
        // });

        // setTimeout(() => {
        //   // Setelah delay, arahkan ke halaman lain
        //   // window.location.replace("http://192.168.50.86/single-sign-on/");
        //   window.location.replace("https://akun-yankes.kemkes.go.id/");
        // }, 2000); // Delay selama 3 detik (3000ms)
      } 
      // else {
      //   window.location.replace(
      //     "https://akun-yankes.kemkes.go.id/?continued=" +
      //       window.location.href
      //   );
      // }
    }
  };

  return (

<div style={styles.outerContainer}>
<div style={styles.container}>
  <h1 style={styles.heading}> {title}</h1>
  <br></br>
  <p style={styles.message}> {contain}</p>
  <br></br>
  <p style={styles.subMessage}>{footer}</p>
</div>
</div>
  );
};

;

export default Konfirmasi_Email;
