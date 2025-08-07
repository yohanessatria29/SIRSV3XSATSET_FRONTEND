import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { useNavigate, Link } from "react-router-dom";
import { HiSaveAs } from "react-icons/hi";
import { FaEye, FaPencilAlt, FaExclamation } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import "./bridging.module.css";
import { DownloadTableExcel } from "react-export-table-to-excel";
import { useCSRFTokenContext } from "../Context/CSRFTokenContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { confirmAlert } from "react-confirm-alert";
import { Card, Button, Row, Col } from 'react-bootstrap';

const StatusRegistrasi = () => {
  const linkRef = useRef(null);
  const [reqProd, setReqProd] = useState();
  // const [showModal, setShowModal] = useState(false);
  const [linkBukti, setLinkBukti] = useState("");
  const [buttonStatus, setButtonStatus] = useState(false);

  const catatanRef = useRef(null);
  const [dataUser, setDataUser] = useState("");
  const [kodeRs, setKodeRs] = useState("");

  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");

  const [namafile, setNamaFile] = useState("");
  const tableRef = useRef(null);
  const [dataUserRegistered, setDataUserRegistered] = useState([]);
  const navigate = useNavigate();
  const { CSRFToken } = useCSRFTokenContext();

  useEffect(() => {
    refreshToken();
    // getProvinsi()
    // getStatusRegistrasi(kodeRs)
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
      // console.log(decoded)
      // console.log("hiks ", decoded)
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
        params: {
          rsId: kodeRs,
        },
      };

      const responseApi = await axiosJWT.get(
        "/apisirs6v2/apiregistration",
        customConfig
      );
      // console.log("hiks ", responseApi)

      const listRegistered = responseApi.data.data.map((value, index) => {
        return {
          apiKeyDev: value.api_key_development && value.api_key_development ? value.api_key_development : null,
          rsId: value.rs_id,
          registrationId: value.id,
          nama_lengkap: value.nama_lengkap,
          email_pendaftaran: value.email_pendaftaran,
          nama_aplikasi: value.nama_aplikasi,
          link_permohonan: value.link_permohonan,
          no_telp: value.no_telp,
          status_verifikasi: value.status_verifikasi,
          status_pendaftaran: value.status_pendaftaran,
          catatan: value.catatan,
          waktu_daftar: value.email_verification_tokens && value.email_verification_tokens.length > 0 ? value.email_verification_tokens[0].created_at : null,
          expired: value.email_verification_tokens && value.email_verification_tokens.length > 0 ? value.email_verification_tokens[0].expired_at : null,
        };
      });

      console.log("cekitout", responseApi.data.data);
      const modifiedData = listRegistered.map(item => {
        const modifiedItem = { ...item };
      
        const apiProductionRequests = modifiedItem.apiKeyDev?.api_production_requests;
        if (modifiedItem.apiKeyDev) {
          if (Array.isArray(apiProductionRequests) && apiProductionRequests.length > 1) {
            const latestRequest = apiProductionRequests.reduce((max, current) => {
              return current.id > max.id ? current : max;
            });
      
            modifiedItem.apiKeyDev.api_production_requests = latestRequest;
          } 
          else if (Array.isArray(apiProductionRequests) && apiProductionRequests.length === 1) {
            modifiedItem.apiKeyDev.api_production_requests = apiProductionRequests[0];
          }
          else {
            modifiedItem.apiKeyDev.api_production_requests = null;
          }
        }
      
        return modifiedItem;
      });
      
      // console.log(JSON.stringify(modifiedData, null, 2));

    console.log("tes ", modifiedData)
      setDataUserRegistered(modifiedData);
      // handleClose();
      // setSpinner(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleButtonClick = (link) => {
    window.open(link, "_blank");
  };

  const renderActionButtons = (value) => {

    // const canRequestProduction = (value.status_verifikasi === "terverifikasi"&& value.status_pendaftaran === "diterima");
    // const cantRequestProduction = (value.status_verifikasi === "terverifikasi"&& value.status_pendaftaran === "tunda" );
    // if (canRequestProduction) {
    //   if (!value.apiKeyDev.api_production_request) {
    //     return (
    //       <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
    //           <ToastContainer />
    //           <ActionButton label="Klik Disini Untuk Request API Production" color="#578FCA" onClick={() => handleRequestProduction(value)} />

    //         </div>
    //       );
    //   } else if(value.apiKeyDev.api_production_request.status === "diterima"){
    //     return (
    //       <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
    //         <ActionButtonDisabled label="Request Production Diterima Silakan Cek Email" disabled />
    //       </div>
    //     );
    //   } else {
    //     return (
    //       <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
    //         <ActionButtonDisabled label="Mohon Tunggu Request Production Sedang Dalam Proses Review Admin" disabled />
    //       </div>
    //     );
    //   }
    // }

    // if (cantRequestProduction) {
    //   return <div style={{ textAlign: "center", verticalAlign: "middle" }}>Proses Registrasi Masih Menunggu Review Admin</div>;
    // } else if( value.status_verifikasi === "kadaluarsa"){
    //   return (
    //     <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
    //       <ActionButtonDisabled label="Permohonan Gagal" disabled />
    //     </div>
    //   );
    // }
    // return <div style={{ textAlign: "center", verticalAlign: "middle" }}>Proses Registrasi Belum Selesai</div>;

    if (value.status_verifikasi === "tunda" && value.status_pendaftaran === "tunda") {

      return (
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <ActionButtonDisabled label="Silakan Cek Email Untuk Verifikasi Email" disabled />
        </div>
      );

    } else if (value.status_verifikasi === "kadaluarsa" && value.status_pendaftaran === "tunda") {

      return (
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <ActionButtonDisabled label="Permohonan Gagal Verifikasi Email Kadaluarsa" disabled />
        </div>
      );

    } else if (value.status_verifikasi === "terverifikasi" && value.status_pendaftaran === "tunda") {

      return (
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <ActionButtonDisabled label="Mohon Tunggu Permohonan Sedang Dalam Proses Review Admin" disabled />
        </div>
      );

    } else if (value.status_verifikasi === "terverifikasi" && value.status_pendaftaran === "ditolak") {

      return (
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <ActionButtonDisabled label="Permohonan Ditolak" disabled />
        </div>
      );

    } else if (value.status_verifikasi === "terverifikasi" && value.status_pendaftaran === "diterima") {
      if (!value.apiKeyDev || !value.apiKeyDev.api_production_requests) {
        return (
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <ToastContainer />
            <ActionButton label="Klik Disini Untuk Request API Production" color="#578FCA" onClick={() => handleRequestProduction(value)} />
          </div>
        );
      } else {
        const status = value.apiKeyDev.api_production_requests.status;
      
        if (status === "tunda") {
          return (
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <ActionButtonDisabled label="Mohon Tunggu Request Production Sedang Dalam Proses Review Admin" disabled />
            </div>
          );
        } else if (status === "diterima") {
          return (
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <ActionButtonDisabled label="Permohonan Production Diterima Silakan Cek Email" disabled />
            </div>
          );
        } else if (status === "revisi") {
          return (
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <ToastContainer />
              <ActionButton label="Klik Disini Untuk Melakukan Revisi Request API Production" color="#578FCA" onClick={() => handleRequestProduction(value)} />
            </div>
          );
        } else if (status === "ditolak") {
          return (
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <ActionButtonDisabled label="Permohonan Di Tolak" disabled />
            </div>
          );
        }
      }
      
    }
  };


  const ActionButton = ({ label, color, onClick }) => (
    <button
      className="btn btn-danger"
      style={{
        margin: "0 10px 0 0",
        backgroundColor: "#A0C878",
        border: `1px solid #A0C878`,
        flex: "1",
      }}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );

  const ActionButtonDisabled = ({ label, color, onClick }) => (
    <button
      className="btn btn-danger"
      style={{
        margin: "0 10px 0 0",
        backgroundColor: "#999797",
        border: `1px solid #999797`,
        flex: "1",
      }}
      type="button"
      disabled
    >
      {label}
    </button>
  );

  const handleRequestProduction = (value) => {
    console.log("tekek ", value)
    const z = {
      apiKeyDev: value.apiKeyDev,
      rsId: value.rsId,
      status: "diterima",
      alasanPenolakan: "",
      namaLengkap: value.nama_lengkap,
      emailPendaftaran: value.email_pendaftaran,
    };
    setReqProd(z);
    confirmationReview(z);
  };



  const confirmationReview = (id) => {

    // let titleConf = "Request Production"
    // let statConf = "Menerima"
    // if (id.apiKeyDevId === null) {
    //   titleConf = "Pendaftaran"
    // }
    // if (id.statusPendaftaran === "ditolak" || id.status === "ditolak") {
    //   statConf = "Menolak"
    // }
    // if (id.status === "revisi") {
    //   statConf = "Mengembalikan ke Pemohon Untuk di Melakukan Revisi"
    // }

    confirmAlert({
      title: "Konfirmasi",
      message: (
        <div>
          <div>
            <p>
              Untuk mendapatkan API Production, Silahkan melampirkan Link bukti keberhasilan pengiriman data dari SIMRS ke SIRS6 Melalui API Development
            </p>
            <label htmlFor="catatan">Input Link Bukti Pengiriman Data :</label>
            <input
              type="url"
              id="catatan"
              ref={linkRef}
              style={{ width: "100%", padding: "8px", margin: "10px 0" }}
            />
          </div>

        </div>
      ),
      buttons: [
        {
          label: "Kirim",
          onClick: () => {

            const updatedLink = linkRef.current ? linkRef.current.value : '';
            setLinkBukti(updatedLink)
            // if (id.apiKeyDevId === null) {
            //   id.catatan = updatedCatatan;
            // } else {
            //   id.alasanPenolakan = updatedCatatan;
            // }
            SendRequest(id);
          },
        },
        {
          label: "Batal",
        },
      ],
      overlayClassName: 'custom-dialog', // Menambahkan kelas khusus untuk overlay
    });
  };

  const SendRequest = async (e) => {
    // e.preventDefault();
    setButtonStatus(true)
    console.log("izzz ", linkBukti)
    const customConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "XSRF-TOKEN": CSRFToken,
      },
    };

    const reqBody = {
      linkBuktiDevelopment: linkBukti
    }


    if (!linkBukti || linkBukti === "") {
      toast("Gagal Mengirim Permohonan, Link Bukti Pengiriman Data Wajib di Isi", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } else {
      try {
        await axiosJWT.post(
          "/apisirs6v2/apiproductionrequest/" + reqProd.apiKeyDev.id,
          reqBody,
          customConfig
        );



        setTimeout(() => {
          setLinkBukti("");
          setButtonStatus(false)
        }, 6000);
        window.location.reload(false);
        toast("Permohonan API Production Berhasil dikirim, Harap Menunggu Review dari Admin", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } catch (error) {
        setButtonStatus(false)
        console.log(error.response.data.message);
        toast("Data Gagal diKirim", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    }



  };



  return (
    <div className="container" style={{ marginTop: '70px', marginBottom: '70px', fontFamily: 'Calibri' }}>
      <h2 className="text-center mb-4">List Pemohon Akun Integrasi SIRS6</h2>
      <div style={{ marginBottom: '10px' }}>
        <Link
          className="btn"
          to={`/RegistrasiUser`}
          style={{
            marginRight: '5px',
            fontSize: '18px',
            backgroundColor: '#779D9E',
            color: '#FFFFFF',
          }}
        >
          + Tambah Pemohon User Bridging
        </Link>
        <br></br>
        <br></br>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {dataUserRegistered.map((value, index) => {
          return (
            <Col key={index} style={{ display: 'flex' }}>
              <Card style={{ width: '100%', height: '100%' }}>  {/* Pastikan Card mempunyai height yang konsisten */}
                <Card.Body style={{ position: 'relative', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
                    {/* Nomor Urut */}
                    <div
                      style={{
                        backgroundColor: '#779D9E',
                        padding: '5px 10px',
                        borderRadius: '50%',
                        fontWeight: 'bold',
                        color: 'white',
                        marginRight: '15px',
                        width: '40px',
                        height: '40px',
                        textAlign: 'center',
                        lineHeight: '30px',
                      }}
                    >
                      {index + 1}
                    </div>

                    {/* Title dan Subtitle */}
                    <div>
                      <Card.Title>{value.nama_lengkap}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">{value.nama_aplikasi}</Card.Subtitle>
                    </div>
                  </div>

                  <div style={{ display: 'flex', marginBottom: '5px' }}>
                    {/* <Card.Text style={{fontSize:"11px", color: "red", fontWeight:"bold" }}>{"* Batas Waktu Konfirmasi Email : "}{value.expired}</Card.Text> */}
                    {/* <Card.Text style={{fontSize:"12px" }}>{"Batas Waktu Konfirmasi Email : "}{value.expired}</Card.Text> */}
                  </div>


                  {/* Konten lainnya */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', marginBottom: '5px' }}>
                      {/* Button */}
                      <Card.Text style={{ width: '40%', fontWeight: 'bold' }}>Tanggal Daftar</Card.Text>
                      <Card.Text style={{ width: '65%' }}>: <strong>{value.waktu_daftar}</strong></Card.Text>
                    </div>
                    {/* Email */}
                    <div style={{ display: 'flex', marginBottom: '3px' }}>
                      <Card.Text style={{ width: '40%', fontWeight: 'bold' }}>Email</Card.Text>
                      <Card.Text style={{ width: '65%' }}>: {value.email_pendaftaran} <br /><span style={{ fontSize: "10px", color: "red", fontWeight: "bold" }}>{"* Batas Waktu Konfirmasi Email : "}{value.expired}</span> </Card.Text>

                    </div>

                    {/* No Telepon */}
                    <div style={{ display: 'flex', marginBottom: '5px' }}>
                      <Card.Text style={{ width: '40%', fontWeight: 'bold' }}>No Telepon</Card.Text>
                      <Card.Text style={{ width: '65%' }}>: {value.no_telp}</Card.Text>
                    </div>


                    {/* <div style={{ display: 'flex', marginBottom: '5px' }}>
                <Card.Text style={{ width: '40%', fontWeight: 'bold' }}>Tanggal Daftar</Card.Text>
                <Card.Text style={{ width: '65%' }}>: <strong>{value.waktu_daftar}</strong></Card.Text>
              </div> */}

                    {/* Status Verifikasi */}
                    {/* <div style={{ display: 'flex', marginBottom: '5px' }}>
                      <Card.Text style={{ width: '40%', fontWeight: 'bold' }}>Status Verifikasi</Card.Text>
                      <Card.Text style={{ width: '65%' }}>: &nbsp;
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor:
                              value.status_verifikasi === 'tunda'
                                ? '#ffeecc'
                                : value.status_verifikasi === 'terverifikasi'
                                  ? '#D4F8D4'
                                  : value.status_verifikasi === 'kadaluarsa'
                                    ? '#FDE2E4'
                                    : 'transparent',
                            color:
                              value.status_verifikasi === 'terverifikasi'
                                ? '#2ECC71'
                                : value.status_verifikasi === 'kadaluarsa'
                                  ? '#F6005F'
                                  : '#ff9600',
                            padding: '2px 5px',
                            borderRadius: '5px',
                          }}
                        > &nbsp;
                          {value.status_verifikasi === 'tunda'
                            ? <strong>Menunggu Konfirmasi Email</strong>
                            : value.status_verifikasi === 'terverifikasi'
                              ? <strong>Terverifikasi</strong>
                              : value.status_verifikasi === 'kadaluarsa'
                                ? <strong>Expired</strong>
                                : ''}
                        </span>
                      </Card.Text>
                    </div> */}

                    {/* Status Pendaftaran */}
                    {/* <div style={{ display: 'flex', marginBottom: '5px' }}>
                      <Card.Text style={{ width: '40%', fontWeight: 'bold' }}>Status Pendaftaran</Card.Text>
                      <Card.Text style={{ width: '65%' }}>: &nbsp;
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor:
                              value.status_pendaftaran === 'diterima' && value.status_verifikasi === "terverifikasi"
                                ? '#D4F8D4'
                                : value.status_pendaftaran === 'tunda' && value.status_verifikasi === "kadaluarsa"
                                  ? '#FDE2E4'
                                  : value.status_pendaftaran === 'tunda' && value.status_verifikasi === "terverifikasi"
                                    ? '#ffeecc'
                                    : value.status_pendaftaran === 'ditolak'
                                      ? '#FDE2E4'
                                      : '#ffeecc',
                            color:
                              value.status_pendaftaran === 'diterima' && value.status_verifikasi === "terverifikasi"
                                ? '#2ECC71'
                                : value.status_pendaftaran === 'tunda' && value.status_verifikasi === "kadaluarsa"
                                  ? '#F6005F'
                                  : value.status_pendaftaran === 'tunda' && value.status_verifikasi === "terverifikasi"
                                    ? '#ff9600'
                                    : value.status_pendaftaran === 'ditolak'
                                      ? '#F6005F'
                                      : '#ff9600',
                            padding: '2px 5px',
                            borderRadius: '5px',
                          }}
                        >&nbsp;
                          {value.status_pendaftaran === 'diterima' && value.status_verifikasi === "terverifikasi"
                            ? <strong>Diterima Silakan Cek Email</strong>
                            : value.status_pendaftaran === 'tunda' && value.status_verifikasi === "terverifikasi"
                              ? <strong>Menunggu Review Admin</strong>
                              : value.status_pendaftaran === 'tunda' && value.status_verifikasi === "kadaluarsa"
                                ? <strong>Ditolak</strong>
                                : value.status_pendaftaran === 'ditolak'
                                  ? <strong>Ditolak</strong>
                                  : <strong>Menunggu Status Verifikasi</strong>}
                        </span>
                      </Card.Text>
                    </div> */}

                    {/* <div style={{ display: 'flex', marginBottom: '5px' }}>
                      <Card.Text style={{ width: '40%', fontWeight: 'bold' }}>Dokumen Permohonan Registrasi</Card.Text>
                      <Card.Text style={{ width: '65%' }}>: &nbsp;



                        <Button
                          variant="primary"
                          onClick={() => handleButtonClick(value.link_permohonan)}
                          style={{
                            backgroundColor: '#578FCA',
                            color: 'white',
                            border: 'none',
                            padding: '5px 8px',
                            cursor: 'pointer',
                            borderRadius: '5px',
                            fontSize: '14px',
                            marginTop: 'auto',  // Pastikan tombol berada di bawah
                          }}
                        >
                          Lihat
                        </Button>

                      </Card.Text>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '5px' }}>
                      <Card.Text style={{ width: '40%', fontWeight: 'bold' }}>Dokumen Permohonan Production</Card.Text>
                      <Card.Text style={{ width: '65%' }}>: &nbsp;
                        <Button
                          variant="primary"
                          onClick={() => handleButtonClick(value.apiKeyDev.api_production_request.link_bukti_development)}
                          style={{
                            backgroundColor: '#578FCA',
                            color: 'white',
                            border: 'none',
                            padding: '5px 8px',
                            cursor: 'pointer',
                            borderRadius: '5px',
                            fontSize: '14px',
                            marginTop: 'auto',


                          }}
                          disabled={(() => {
                            if (!value.apiKeyDev?.api_production_request) {
                              return true; // Tombol aktif jika statusPendaftaran "tunda"
                            } else {
                              return false; // Tombol nonaktif jika statusVerifikasi bukan "terverifikasi"
                            }
                          })()}
                        >
                          Lihat
                        </Button>

                      </Card.Text>
                    </div> */}

                    <div style={{ display: 'flex', marginBottom: '5px' }}>
                      <Card.Text style={{ width: '40%', fontWeight: 'bold' }}>Catatan</Card.Text>
                      <Card.Text style={{ width: '65%' }}>: &nbsp; <strong>

                      {value.apiKeyDev?.api_production_requests ? value.apiKeyDev?.api_production_requests?.alasan_penolakan : value.catatan}



                      </strong></Card.Text>
                    </div>


                    <div style={{ display: 'flex', marginBottom: '5px' }}>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <Card.Text style={{ width: '40%' }}>



                        <Button
                          variant="primary"
                          onClick={() => handleButtonClick(value.link_permohonan)}
                          style={{
                            backgroundColor: '#578FCA',
                            color: 'white',
                            border: 'none',
                            padding: '5px 8px',
                            cursor: 'pointer',
                            borderRadius: '5px',
                            fontSize: '14px',
                            marginTop: 'auto',  // Pastikan tombol berada di bawah
                          }}
                        >
                          Lihat Dokumen Permohonan Registrasi
                        </Button>

                      </Card.Text>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <Card.Text style={{ width: '40%' }}>
                        <Button
                          variant="primary"
                          onClick={() => handleButtonClick(value.apiKeyDev?.api_production_requests?.link_bukti_development)}
                          style={{
                            backgroundColor: '#578FCA',
                            color: 'white',
                            border: 'none',
                            padding: '5px 8px',
                            cursor: 'pointer',
                            borderRadius: '5px',
                            fontSize: '14px',
                            marginTop: 'auto',


                          }}
                          disabled={(() => {
                            // console.log(index, value.apiKeyDev?.api_production_requests?.link_bukti_development)
                            if (!value.apiKeyDev?.api_production_requests?.link_bukti_development) {
                              return true; 
                            } else {
                              return false; 
                            }
                          })()}
                        >
                          Lihat Bukti Pengiriman Development
                        </Button>

                      </Card.Text>
                    </div>


                    {renderActionButtons(value)}


                  </div>

                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default StatusRegistrasi;
