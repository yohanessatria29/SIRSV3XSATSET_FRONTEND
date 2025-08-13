import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import { FaEye, FaPencilAlt, FaExclamation } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import style from "./bridging.module.css";
import { DownloadTableExcel } from "react-export-table-to-excel";
import { useCSRFTokenContext } from "../Context/CSRFTokenContext";

const RegistrasiUser = () => {
  const [namaRS, setNamaRS] = useState("");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const tableRef = useRef(null);
  const [buttonStatus, setButtonStatus] = useState(false)
  const navigate = useNavigate();
  const { CSRFToken } = useCSRFTokenContext();
  const [namaLengkap, setNamaLengkap] = useState("");
  const [emailPendaftaran, setEmailPendaftaran] = useState("");
  const [namaAplikasi, setNamaAplikasi] = useState("");
  const [tujuanPenggunaan, setTujuanPenggunaan] = useState("");
  const [linkPermohonan, setLinkPermohonan] = useState("");
  const [noTelp, setNoTelp] = useState("");

  useEffect(() => {
    refreshToken();
  }, []);

  const refreshToken = async () => {
    try {
      const customConfig = {
        headers: {
          "XSRF-TOKEN": CSRFToken,
        },
      };
      const response = await axios.get("/apisirs6v2/token", customConfig);
      setToken(response.data.accessToken);
      const decoded = jwt_decode(response.data.accessToken);
      setExpire(decoded.exp);
      setNamaRS(decoded.rsname);
    } catch (error) {
      if (error.response) {
        navigate("/");
      }
    }
  };

  const axiosJWT = axios.create();
  axiosJWT.interceptors.request.use(
    async (config) => {
      const currentDate = new Date();
      if (expire * 1000 < currentDate.getTime()) {
        const customConfig = {
          headers: {
            "XSRF-TOKEN": CSRFToken,
          },
        };
        const response = await axios.get("/apisirs6v2/token", customConfig);
        config.headers.Authorization = `Bearer ${response.data.accessToken}`;
        setToken(response.data.accessToken);
        const decoded = jwt_decode(response.data.accessToken);
        setExpire(decoded.exp);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const Registrasi = async (e) => {
    e.preventDefault();

    // setButtonStatus(true);
    try {
      const dataRegistrasi = {
            namaLengkap: namaLengkap,
            emailPendaftaran: emailPendaftaran,
            namaAplikasi: namaAplikasi,
            tujuanPenggunaan: tujuanPenggunaan,
            linkPermohonan: linkPermohonan,
            noTelp: noTelp,
          };

      const customConfig = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "XSRF-TOKEN": CSRFToken,
        },
      };

    //  await axios.get("/apisirs6v2/token", customConfig);
      // if (bulan === "00" || bulan === 0) {
      //   toast(`Data tidak bisa disimpan karena belum pilih periode laporan`, {
      //     position: toast.POSITION.TOP_RIGHT,
      //   });
      //   setButtonStatus(false);
      // } else {
        // await axiosJWT.post(
        //   "/apisirs6v2/apiregistration",dataRegistrasi, customConfig
        // );

        const responseAPI = await axiosJWT.post("/apisirs6v2/apiregistration",dataRegistrasi, customConfig)

        console.log(responseAPI.data.message);
        toast(responseAPI.data.message, {
          position: toast.POSITION.TOP_RIGHT,
        });
        setTimeout(() => {
          navigate("/");
        }, 1000);
      
    } catch (error) {
      toast(`Registrasi Gagal, ${error.response.data.message}`, {
        position: toast.POSITION.TOP_RIGHT,
      });
      setButtonStatus(false);
    }
  };

  // ------------------------------------------------------------------------------------
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    simrs: "",
    purpose: "",
    applicationLetter: "",
    phoneNumber: "",
    agreement: false,
  });

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ marginTop: "20px", marginBottom: "70px", minHeight: "100vh" }}
    >
      <form
        onSubmit={Registrasi}
        style={{ width: "100%", maxWidth: "600px" }}
      >
        <div
          className="card"
          style={{
            boxShadow:
              "0 4px 8px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)",
          }}
        >
          <div className="card-body">
            <h3 className="text-center mb-4">Registrasi Akun API SIRS</h3>
            {/* <div className="alert alert-info mb-3">Rumah Sakit: {namaRS}</div> */}
            <div className="form-floating mb-3">
              <input
                type="text"
                name="fullName"
                className="form-control"
                placeholder="Full Name"
                value={namaLengkap}
                onChange={e => setNamaLengkap(e.target.value)}
                required
              />
              <label htmlFor="fullName">Nama Lengkap</label>
            </div>
            <div className="form-floating mb-3">
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Email"
                value={emailPendaftaran}
                onChange={e => setEmailPendaftaran(e.target.value)}
                required
              />
              <label htmlFor="email">Email</label>
            </div>
            <div className="form-floating mb-3">
              <input
                type="text"
                name="simrs"
                className="form-control"
                placeholder="SIMRS"
                value={namaAplikasi}
                onChange={e => setNamaAplikasi(e.target.value)}
                required
              />
              <label htmlFor="simrs"> Nama Aplikasi</label>
            </div>
            <div className="form-floating mb-3">
              <input
                type="url"
                name="applicationLetter"
                className="form-control"
                placeholder="tessss"
                value={linkPermohonan}
                onChange={e => setLinkPermohonan(e.target.value)}
                required
              />
              <label htmlFor="applicationLetter">Link Upload/Drive Surat Permohonan</label>
              <div className="text-end">
                <a
                  href="/Contoh Surat Permohonan.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary"
                  style={{
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    textDecoration: "none",
                  }}
                >
                  Contoh Surat Permohonan
                </a>
              </div>
            </div>
            <div className="form-floating mb-3">
              <input
                type="tel"
                name="tujuanPenggunaan"
                className="form-control"
                placeholder="Tujuan Penggunaan"
                value={tujuanPenggunaan}
                onChange={e => setTujuanPenggunaan(e.target.value)}
                required
              />
              <label htmlFor="tujuanPenggunaan">Tujuan Penggunaan</label>
            </div>
            <div className="form-floating mb-3">
              <input
                type="number"
                name="phoneNumber"
                className="form-control"
                placeholder="Phone Number"
                value={noTelp}
                onChange={e => setNoTelp(e.target.value)}
                required
              />
              <label htmlFor="phoneNumber">No Telepon/Handphone</label>
            </div>
            <div className="mb-3 form-check">
              <input
                type="checkbox"
                name="agreement"
                className="form-check-input"
                id="agreement"
                checked={formData.agreement}
                onChange={(e) =>
                  setFormData({ ...formData, agreement: e.target.checked })
                }
                required
              />
              <label className="form-check-label" htmlFor="agreement">
                Saya menyetujui{" "}
                <span
                  className="text-primary"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowModal(true)}
                >
                  Syarat dan Ketentuan
                </span>{" "}
                yang berlaku
              </label>
            </div>
            <div className="mt-3">
               <ToastContainer />
              <button
                type="submit"
                className="btn btn-outline-success w-100"
                disabled={!formData.agreement}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </form>

      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        style={{ display: showModal ? "block" : "none" }}
      >
        <div
          className="modal-dialog modal-dialog-scrollable"
          style={{ maxWidth: "75%", width: "75%" }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Persyaratan dan Persetujuan Penggunaan API Bridging SIMRS
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <h6>Penggunaan API</h6>
              <ul>
                <li>
                  API ini hanya diperbolehkan digunakan untuk kepentingan
                  integrasi sistem informasi rumah sakit (SIMRS) dengan SIRS
                  Online.
                </li>
                <li>
                  Dilarang menggunakan API untuk tujuan yang bertentangan dengan
                  hukum, merugikan pihak lain, atau melanggar hak privasi
                  pasien.
                </li>
              </ul>

              <h6>Keamanan dan Kerahasiaan</h6>
              <ul>
                <li>
                  Pemohon bertanggung jawab penuh terhadap keamanan kredensial
                  API (seperti API Key dan Secret Key) yang diberikan.
                </li>
                <li>
                  Data pasien dan informasi sensitif yang diperoleh melalui API
                  harus dijaga kerahasiaannya sesuai dengan ketentuan
                  perlindungan data pribadi dan peraturan perundang-undangan
                  yang berlaku.
                </li>
              </ul>

              <h6>Kepatuhan Hukum</h6>
              <p>
                Pemohon wajib mematuhi seluruh peraturan pemerintah dan
                perundang-undangan yang mengatur mengenai sistem informasi
                kesehatan, termasuk Undang-Undang Perlindungan Data Pribadi (UU
                PDP).
              </p>

              <h6>Audit dan Monitoring</h6>
              <ul>
                <li>
                  Setiap aktivitas pemanggilan API dapat direkam dan diaudit
                  sewaktu-waktu oleh pihak pengelola sistem.
                </li>
                <li>
                  Penyalahgunaan API atau pelanggaran terhadap ketentuan ini
                  dapat mengakibatkan pencabutan akses tanpa pemberitahuan
                  terlebih dahulu.
                </li>
              </ul>

              <h6>Tanggung Jawab dan Risiko</h6>
              <p>
                Pemohon bertanggung jawab atas setiap kerugian, kerusakan, atau
                tuntutan hukum yang timbul akibat penggunaan API yang tidak
                sesuai dengan ketentuan ini.
              </p>

              <h6>Pernyataan Persetujuan</h6>
              <p>Dengan mencentang kotak persetujuan, Anda menyatakan bahwa:</p>
              <ul>
                <li>
                  Anda telah membaca, memahami, dan menyetujui seluruh syarat
                  dan ketentuan penggunaan API Bridging SIMRS ini.
                </li>
                <li>
                  Anda bersedia bertanggung jawab atas penggunaan API oleh
                  sistem/aplikasi yang Anda daftarkan.
                </li>
              </ul>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
      {showModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default RegistrasiUser;
