import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import style from "./DaftarPermohonan.module.css";
import { useCSRFTokenContext } from "../Context/CSRFTokenContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { confirmAlert } from "react-confirm-alert";

const DaftarPermohonan = () => {

  const catatanRef = useRef(null);
  const [dataUser, setDataUser] = useState("");
  const [kodeRs, setKodeRs] = useState("");
  const [dataUserRegistered, setDataUserRegistered] = useState([]);
  // const [statConf, setStatConf] = useState("");

  const [showModalReviewRegist, setShowModalReviewRegist] = useState(false);
  const [showReviewReqProdModal, setShowReviewReqProdModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);


  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const tableRef = useRef(null);
  const navigate = useNavigate();
  const { CSRFToken } = useCSRFTokenContext();

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
      setKodeRs(decoded.satKerId);
      getStatusRegistrasi(decoded.satKerId)
      setDataUser(decoded)
      setExpire(decoded.exp);
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
  const getStatusRegistrasi = async (e) => {


    try {
      const customConfig = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const responseApi = await axiosJWT.get(
        "/apisirs6v2/apiregistrationdetail",
        customConfig
      );
      console.log("hik ", responseApi.data.data)

      setDataUserRegistered(responseApi.data.data);
      console.log("cekitout", dataUserRegistered);
      // handleClose();
      // setSpinner(false);
    } catch (error) {
      console.log(error);
    }
  };


  const handleModalOpen = () => {
    setShowModalReviewRegist(true);
  };

  const handleModalClose = () => {
    setShowModalReviewRegist(false);
    // setLinkBukti("");
  };

  const handleSubmitLink = () => {
    // console.log("Link submitted:", linkBukti);
    handleModalClose();
  };

  const handleReviewModalOpen = (request) => {
    setSelectedRequest(request);
    if (request.statusVerifikasi === "terverifikasi" && request.statusPendaftaran === "tunda") {
      setShowModalReviewRegist(true);
    } else {

      setShowReviewReqProdModal(true);
    }
  };

  const handleReviewModalClose = () => {
    setShowReviewReqProdModal(false);
    setSelectedRequest(null);
  };




  const confirmationReview = (id) => {

    let titleConf = "Request Production"
    let statConf = "Menerima"
    if (id.apiKeyDevId === null) {
      titleConf = "Pendaftaran"
    }
    if (id.statusPendaftaran === "ditolak" || id.status === "ditolak") {
      statConf = "Menolak"
    }
    if (id.status === "revisi") {
      statConf = "Mengembalikan ke Pemohon"
    }

    confirmAlert({
      title: "Konfirmasi Review " + titleConf,
      message: (
        <div>
          <p>Apakah Anda Yakin Ingin <strong>{statConf}</strong> Permintaan Ini ? </p>
          {statConf !== "Menerima" && (
            <div>
              <label htmlFor="catatan">Masukkan Catatan :</label>
              <ToastContainer />
              <input
                type="text"
                id="catatan"
                ref={catatanRef} // Attach the ref to the input element
                defaultValue={id.catatan || ""}
                style={{ width: "100%", padding: "8px", margin: "10px 0" }}
              />
            </div>
          )}

        </div>
      ),
      buttons: [
        {
          label: "Ya",
          onClick: () => {

            const updatedCatatan = catatanRef.current ? catatanRef.current.value : '';
            if (id.apiKeyDevId === null) {
              id.catatan = updatedCatatan;
            } else {
              id.alasanPenolakan = updatedCatatan;
            }
            review(id);
          },
        },
        {
          label: "Tidak",
        },
      ],
    });
  };

  const review = async (id) => {
    const customConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "XSRF-TOKEN": CSRFToken,
      },
    };

    if (id.status === "ditolak" && id.alasanPenolakan.length == 0) {
      toast("Gagal Review Alasan Penolakan Wajib diisi", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } else {

      // const response = await axios.get("/apisirs6v2/token", customConfig);
      try {
        if (id.apiKeyDevId === null) {
          console.log("hiyaahhhh1 ", id)
          await axiosJWT.post(
            "/apisirs6v2/apiregistration/review/" + id.registrationId,
            {
              rsId: id.rsId,
              registrationId: id.registrationId,
              statusVerifikasi: id.statusVerifikasi,
              statusPendaftaran: id.statusPendaftaran,
              catatan: id.catatan,
              namaLengkap: id.namaLengkap,
              emailPendaftaran: id.emailPendaftaran
            },
            customConfig
          );
          window.location.reload(false);
          toast("Data Berhasil DiReview", {
            position: toast.POSITION.TOP_RIGHT,
          });
          setTimeout(() => {
            navigate("/");
          }, 1000);
        } else {
          await axiosJWT.post(
            "/apisirs6v2/apiproductionrequest/review/" + id.apiReqProdId,
            {
              rsId: id.rsId,
              status: id.status,
              alasanPenolakan: id.alasanPenolakan,
              namaLengkap: id.namaLengkap,
              emailPendaftaran: id.emailPendaftaran,
            },
            customConfig
          );
          window.location.reload(false);
          toast("Data Berhasil DiReview", {
            position: toast.POSITION.TOP_RIGHT,
          });
          setTimeout(() => {
            navigate("/");
          }, 1000);
        }
      } catch (error) {
        console.log(error);
        toast("Data Gagal diReview", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    }
  };


  return (

    <div
      className="container"
      style={{
        marginTop: "100px",
        marginBottom: "70px",
        fontFamily: "Calibri",
      }}
    >
      <h2 className="text-center mb-3">Daftar Permohonan API SIRS Online</h2>
      <div className="row mt-3">
        {/* <div className="row mt-3" style={{ display: "flex", justifyContent: "flex-end" }}>
          <form style={{ width: "40%", display: "flex" }}>
            <div className="form-floating" style={{ width: "100%" }}>
              <input
                name="caripenyakit"
                type="text"
                className="form-control"
                id="floatingInput"
                placeholder="Nama Penyakit / KODE ICD 10"
              />
              <label htmlFor="floatingInput">Search / Cari</label>
            </div>
            <button
              type="submit"
              className="btn btn-outline-success"
              style={{
                marginLeft: "10px",
                fontSize: "18px", // Membesarkan ukuran font tombol
                padding: "12px 20px", // Menambah padding agar tombol lebih besar
                height: "58px", // Menambah tinggi tombol
              }}
            >
              Cari
            </button>
          </form>
        </div> */}
        <div className="col-md-12">
          <div className={`${style["table-container"]} mt-2 mb-1 pb-2`}>
            <table responsive className={style.table} ref={tableRef}>
              <thead className={style.thead}>
                <tr>
                  {/* <th className={style["sticky-header"]} style={{ width: "2%", verticalAlign: "middle" }} >Nama SIMRS</th> */}
                  {/* <th className={style["sticky-header"]} style={{ width: "2%", verticalAlign: "middle" }} >
                    Link Surat Permohonan
                  </th> */}
                  <th className={style["sticky-header"]} style={{ width: "5%", verticalAlign: "middle" }} >No.</th>
                  <th className={style["sticky-header"]} style={{ width: "5%", verticalAlign: "middle" }} >Review / Aksi</th>
                  <th className={style["sticky-header"]} style={{ width: "10%", verticalAlign: "middle" }} >Rumah Sakit</th>
                  <th className={style["sticky-header"]} style={{ width: "10%", verticalAlign: "middle" }} >Nama Lengkap</th>
                  <th className={style["sticky-header"]} style={{ width: "10%", verticalAlign: "middle" }} >Email</th>
                  <th className={style["sticky-header"]} style={{ width: "10%", verticalAlign: "middle" }} >No Telepon</th>
                  <th className={style["sticky-header"]} style={{ width: "10%", verticalAlign: "middle" }} >Status Tahap Registrasi/Development</th>
                  <th className={style["sticky-header"]} style={{ width: "10%", verticalAlign: "middle" }} >Status Tahap Request Production</th>
                  <th className={style["sticky-header"]} style={{ width: "12%", verticalAlign: "middle" }} >Catatan</th>
                </tr>
              </thead>
              {dataUserRegistered.map((value, index) => {
                return (
                  <tbody>
                    <tr>
                      <td>{index + 1}</td>
                      <td>
                        <ToastContainer />
                        <button
                          className="btn btn-danger"
                          style={{
                            margin: "0 10px 0 0",
                            backgroundColor: "#5893cd",
                            border: "1px #5893cd",
                            flex: "1",
                          }}
                          type="button"
                          disabled={
                            (() => {
                              if (value.statusVerifikasi === "terverifikasi") {
                                if (value.statusPendaftaran === "tunda") {
                                  return false
                                } else if (value.statusPendaftaran === "diterima") {
                                  if (value.apiReqProd === null) {
                                    return true
                                  } else {
                                    if (value.apiReqProd.statusReqProd === "tunda") {
                                      return false
                                    }
                                    return true
                                  }
                                } else if (value.statusPendaftaran === "ditolak") {
                                  return true
                                }
                              } else {
                                return true
                              }


                              // if (value.statusVerifikasi === "terverifikasi"){
                              //   if(value.statusPendaftaran === "tunda"){
                              //     return false
                              //   } else if(value.statusPendaftaran === "diterima"){
                              //     if (value.apiReqProd === null){
                              //       return true
                              //     } else {
                              //       if(value.apiReqProd.statusReqProd === "tunda"){
                              //         return false
                              //       } else if(value.apiReqProd.statusReqProd === "revisi"){
                              //         return true
                              //       } else if(value.apiReqProd.statusReqProd === "ditolak"){
                              //         return true
                              //       } else 
                              //       return true
                              //     } 
                              //   }  else if(value.statusPendaftaran === "ditolak"){
                              //     return true
                              //   }
                              // } else if(value.statusVerifikasi === "tunda"){
                              //   if(value.statusPendaftaran === "tunda"){
                              //     return true
                              //   } else if(value.statusPendaftaran === "diterima"){
                              //     return true
                              //   }  else if(value.statusPendaftaran === "ditolak"){
                              //     return true
                              //   }
                              // }else if(value.statusVerifikasi === "kadaluarsa"){
                              //   if(value.statusPendaftaran === "tunda"){
                              //     return true
                              //   } else if(value.statusPendaftaran === "diterima"){
                              //     return true
                              //   }  else if(value.statusPendaftaran === "ditolak"){
                              //     return true
                              //   }
                              // } else {
                              //   return true
                              // }

                            })()
                          }
                          onClick={(e) => {
                            const x = {
                              "rsId": value.kodeRs,
                              "registrationId": value.registrationId,
                              "statusVerifikasi": value.statusVerifikasi,
                              "statusPendaftaran": value.statusPendaftaran,
                              "catatan": "",
                              "namaLengkap": value.namaLengkap,
                              "emailPendaftaran": value.email,
                              "linkPermohonan": value.linkPermohonan,
                              "apiKeyDevId": value.apiKeyDev?.apiKeyDevId ?? null,
                              "apiReqProdId": value.apiReqProd?.apiReqProdId ?? null,
                              "apiReqProdLinkBukti": value.apiReqProd?.linkBuktiDevelopment ?? null,
                              "status": "",
                              "alasanPenolakan": "",
                            };
                            // confirmationReview(x);
                            handleReviewModalOpen(x)
                          }}
                        >
                          REVIEW
                        </button>

                      </td>
                      <td>{value.namaRs}</td>
                      <td>{value.namaLengkap}</td>
                      <td>{value.email}</td>
                      {/* <td>{value.namaSimrs}</td> */}
                      {/* <td>
                        <a
                          href={value.linkPermohonan}
                          style={{
                            backgroundColor: "#578FCA",
                            color: "white",
                            border: "none",
                            padding: "5px 10px",
                            cursor: "pointer",
                            borderRadius: "5px",
                            fontSize: "14px",
                          }}
                          className={style["view-doc-button"]}
                          onClick={(e) => {
                            e.preventDefault(); // Mencegah aksi default dari link
                            window.open(value.linkPermohonan, "_blank"); // Membuka link di tab baru
                          }}
                        >
                          Lihat Dokumen Permohonan
                        </a>
                      </td> */}
                      <td>{value.noTelp}</td>
                      <td>
                        <>
                          {value.statusVerifikasi === "tunda" && value.statusPendaftaran === "tunda" && (
                            <span
                              className={`${style.status} ${style["status-tunda"]}`}
                            >
                              Belum Verifikasi Email
                            </span>
                          )}
                          {value.statusVerifikasi === "kadaluarsa" && (value.statusPendaftaran === "ditolak" || value.statusPendaftaran === "tunda") && (
                            <span
                              className={`${style.status} ${style["status-kadaluarsa"]}`}
                            >
                              Email Verifikasi Kadaluarsa
                            </span>
                          )}
                          {value.statusVerifikasi === "terverifikasi" && value.statusPendaftaran === "ditolak" && (
                            <span
                              className={`${style.status} ${style["status-nonaktif"]}`}
                            >
                              Ditolak
                            </span>
                          )}
                          {value.statusVerifikasi === "terverifikasi" && value.statusPendaftaran === "diterima" && (
                            <span
                              className={`${style.status} ${style["status-aktif"]}`}
                            >
                              Diterima
                            </span>
                          )}
                          {value.statusVerifikasi === "terverifikasi" && value.statusPendaftaran === "tunda" && (
                            <span
                              className={`${style.status} ${style["status-belumverifikasi"]}`}
                            >
                              Review Admin
                            </span>
                          )}
                        </>
                      </td>
                      <td>
                        <>
                          {value.statusVerifikasi === "tunda" && value.statusPendaftaran === "tunda" && (
                            <span
                              className={`${style.status} ${style["status-tunda"]}`}
                            >
                              Belum Selesai Tahap Registrasi
                            </span>
                          )}
                          {value.statusVerifikasi === "kadaluarsa" && (value.statusPendaftaran === "ditolak" || value.statusPendaftaran === "tunda") && (
                            <span
                              className={`${style.status} ${style["status-kadaluarsa"]}`}
                            >
                              Tidak Bisa Request API Production
                            </span>
                          )}
                          {value.statusVerifikasi === "terverifikasi" && value.statusPendaftaran === "ditolak" && (
                            <span
                              className={`${style.status} ${style["status-nonaktif"]}`}
                            >
                              Ditolak
                            </span>
                          )}
                          {value.statusVerifikasi === "terverifikasi" && value.statusPendaftaran === "diterima" && value.apiReqProd === null && (
                            <span
                              className={`${style.status} ${style["status-tunda"]}`}
                            >Belum Melakukan Request Production   </span>
                          )}
                          {value.statusVerifikasi === "terverifikasi" && value.statusPendaftaran === "tunda" && (

                            <span
                              className={`${style.status} ${style["status-tunda"]}`}
                            >
                              Belum Selesai Tahap Registrasi
                            </span>

                          )}
                          {value.statusVerifikasi === "terverifikasi" && value.statusPendaftaran === "diterima" && value.apiReqProd?.statusReqProd === "tunda" && (
                            <span
                              className={`${style.status} ${style["status-belumverifikasi"]}`}
                            >
                              Review Admin
                            </span>
                          )}
                          {value.statusVerifikasi === "terverifikasi" && value.statusPendaftaran === "diterima" && value.apiReqProd?.statusReqProd === "ditolak" && (
                            <span
                              className={`${style.status} ${style["status-nonaktif"]}`}
                            >
                              Ditolak
                            </span>
                          )}
                          {value.statusVerifikasi === "terverifikasi" && value.statusPendaftaran === "diterima" && value.apiReqProd?.statusReqProd === "diterima" && (
                            <span
                              className={`${style.status} ${style["status-aktif"]}`}
                            >
                              Diterima
                            </span>
                          )}
                            {value.statusVerifikasi === "terverifikasi" && value.statusPendaftaran === "diterima" && value.apiReqProd?.statusReqProd === "revisi" && (
                            <span
                              className={`${style.status} ${style["status-tunda"]}`}
                            >
                              Revisi
                            </span>
                          )}

                          {/* <p>Tidak Bisa Request API Production</p> */}
                        </>
                      </td>
                      <td>
                        <>
                          {value.apiReqProd != null && (
                            <p>{value.apiReqProd.catatanReqProd}</p>
                          )}
                          {/* {value.catatanRegistration === "kadaluarsa" && (
                            <span
                              className={`${style.status} ${style["status-kadaluarsa"]}`}
                            >
                              Kadaluarsa
                            </span>
                          )} */}
                          <p>{value.catatanRegistration}</p>
                        </>
                      </td>

                    </tr>
                  </tbody>
                )
              })}
            </table>
          </div>
        </div>
      </div>


      {showModalReviewRegist && (
        <div
          className="modal"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Review Permohonan</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleModalClose}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <p>Silahkan Review Permohonan Integrasi SIRS6.</p>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <a
                      href={selectedRequest.linkPermohonan}
                      style={{
                        backgroundColor: "#578FCA",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        cursor: "pointer",
                        borderRadius: "5px",
                        fontSize: "14px",
                      }}
                      className={style["view-doc-button"]}
                      onClick={(e) => {
                        e.preventDefault(); // Mencegah aksi default dari link
                        window.open(selectedRequest.linkPermohonan, "_blank"); // Membuka link di tab baru
                      }}
                    >
                      Lihat Dokumen Permohonan
                    </a>
                  </div>

                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={(e) => {
                    selectedRequest.statusPendaftaran = "diterima"
                    confirmationReview(selectedRequest);
                    setShowModalReviewRegist(false)
                  }}
                >
                  Terima
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={(e) => {
                    selectedRequest.statusPendaftaran = "ditolak"
                    confirmationReview(selectedRequest);
                    setShowModalReviewRegist(false)
                  }}
                >
                  Tolak
                </button>
                {/* <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReviewModalClose}
              >
                Tutup
              </button> */}
              </div>
            </div>
          </div>
        </div>
      )}


      {showReviewReqProdModal && (
        <div
          className="modal"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Review Permohonan</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleReviewModalClose}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <p>Silahkan Review Hasil Pengiriman Data pada Server Development.</p>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <a
                      href={selectedRequest.apiReqProdLinkBukti}
                      style={{
                        backgroundColor: "#578FCA",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        cursor: "pointer",
                        borderRadius: "5px",
                        fontSize: "14px",
                      }}
                      className={style["view-doc-button"]}
                      onClick={(e) => {
                        e.preventDefault(); // Mencegah aksi default dari link
                        window.open(selectedRequest.apiReqProdLinkBukti, "_blank"); // Membuka link di tab baru
                      }}
                    >
                      Lihat Dokumen Permohonan
                    </a>
                  </div>

                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={(e) => {
                    selectedRequest.statusPendaftaran = "diterima"
                    selectedRequest.status = "diterima"
                    confirmationReview(selectedRequest);
                    setShowReviewReqProdModal(false)
                  }}
                >
                  Terima
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={(e) => {
                    selectedRequest.statusPendaftaran = "diterima"
                    selectedRequest.status = "revisi"
                    confirmationReview(selectedRequest);
                    setShowReviewReqProdModal(false)
                  }}
                >
                  Revisi
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={(e) => {
                    selectedRequest.statusPendaftaran = "diterima"
                    selectedRequest.status = "ditolak"
                    confirmationReview(selectedRequest);
                    setShowReviewReqProdModal(false)
                  }}
                >
                  Tolak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



    </div>
  );
};

export default DaftarPermohonan;
