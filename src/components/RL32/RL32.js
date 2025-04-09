import React, { useState, useEffect } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { useNavigate, Link } from "react-router-dom";
import style from "./RL32.module.css";
import { HiSaveAs } from "react-icons/hi";
import { confirmAlert } from "react-confirm-alert";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import Modal from "react-bootstrap/Modal";
// import Table from 'react-bootstrap/Table'
import { downloadExcel } from "react-export-table-to-excel";
import { useCSRFTokenContext } from "../Context/CSRFTokenContext";

const RL32 = () => {
  const [bulan, setBulan] = useState(1);
  const [tahun, setTahun] = useState("");
  const [filterLabel, setFilterLabel] = useState([]);
  const [daftarBulan, setDaftarBulan] = useState([]);
  const [rumahSakit, setRumahSakit] = useState("");
  const [daftarRumahSakit, setDaftarRumahSakit] = useState([]);
  const [daftarProvinsi, setDaftarProvinsi] = useState([]);
  const [daftarKabKota, setDaftarKabKota] = useState([]);
  const [dataRL, setDataRL] = useState([]);
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [show, setShow] = useState(false);
  const [showValidasi, setShowValidasi] = useState(false);
  const [statusValidasi, setStatusValidasi] = useState(1);
  const [keteranganValidasi, setKeteranganValidasi] = useState("");
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const { CSRFToken } = useCSRFTokenContext();

  useEffect(() => {
    refreshToken();
    getBulan();
    const getLastYear = async () => {
      const date = new Date();
      setTahun("2025");
      return date.getFullYear();
    };
    getLastYear().then((results) => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      showRumahSakit(decoded.satKerId);
      setExpire(decoded.exp);
      setUser(decoded);
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
        const response = await axios.get("/apisirs6v2/token");
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

  const getBulan = async () => {
    const results = [];
    results.push({
      key: "Januari",
      value: "1",
    });
    results.push({
      key: "Febuari",
      value: "2",
    });
    results.push({
      key: "Maret",
      value: "3",
    });
    results.push({
      key: "April",
      value: "4",
    });
    results.push({
      key: "Mei",
      value: "5",
    });
    results.push({
      key: "Juni",
      value: "6",
    });
    results.push({
      key: "Juli",
      value: "7",
    });
    results.push({
      key: "Agustus",
      value: "8",
    });
    results.push({
      key: "September",
      value: "9",
    });
    results.push({
      key: "Oktober",
      value: "10",
    });
    results.push({
      key: "November",
      value: "11",
    });
    results.push({
      key: "Desember",
      value: "12",
    });

    setDaftarBulan([...results]);
  };

  const hitungPasienAkhirBulan = (index) => {
    const result =
      parseInt(dataRL[index].pasien_awal_bulan) +
      parseInt(dataRL[index].pasien_masuk) +
      parseInt(dataRL[index].pasien_pindahan) -
      (parseInt(dataRL[index].pasien_dipindahkan) +
        parseInt(dataRL[index].pasien_keluar_hidup) +
        parseInt(dataRL[index].pasien_keluar_mati_kurang_dari_48_jam) +
        parseInt(
          dataRL[index].pasien_keluar_mati_lebih_dari_atau_sama_dengan_48_jam
        ) +
        parseInt(dataRL[index].pasien_wanita_keluar_mati_kurang_dari_48_jam) +
        parseInt(
          dataRL[index]
            .pasien_wanita_keluar_mati_lebih_dari_atau_sama_dengan_48_jam
        ));
    return result;
  };

  const hitungJumlahHariPerawatan = (index) => {
    const result =
      parseInt(dataRL[index].rincian_hari_perawatan_kelas_VVIP) +
      parseInt(dataRL[index].rincian_hari_perawatan_kelas_VIP) +
      parseInt(dataRL[index].rincian_hari_perawatan_kelas_1) +
      parseInt(dataRL[index].rincian_hari_perawatan_kelas_2) +
      parseInt(dataRL[index].rincian_hari_perawatan_kelas_3) +
      parseInt(dataRL[index].rincian_hari_perawatan_kelas_khusus);
    return result;
  };

  const bulanChangeHandler = async (e) => {
    setBulan(e.target.value);
  };

  const tahunChangeHandler = (event) => {
    setTahun(event.target.value);
  };

  const provinsiChangeHandler = (e) => {
    const provinsiId = e.target.value;
    getKabKota(provinsiId);
  };

  const kabKotaChangeHandler = (e) => {
    const kabKotaId = e.target.value;
    getRumahSakit(kabKotaId);
  };

  const rumahSakitChangeHandler = (e) => {
    const rsId = e.target.value;
    showRumahSakit(rsId);
  };

  const statusValidasiChangeHadler = (e) => {
    setStatusValidasi(e.target.value);
  };

  const keteranganValidasiChangeHadler = (e) => {
    setKeteranganValidasi(e.target.value);
  };

  const getRumahSakit = async (kabKotaId) => {
    try {
      const response = await axiosJWT.get("/apisirs6v2/rumahsakit/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          kabKotaId: kabKotaId,
        },
      });
      setDaftarRumahSakit(response.data.data);
    } catch (error) {}
  };

  const showRumahSakit = async (id) => {
    try {
      const response = await axiosJWT.get("/apisirs6v2/rumahsakit/" + id, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRumahSakit(response.data.data);
    } catch (error) {}
  };

  const getRL = async (e) => {
    e.preventDefault();
    if (rumahSakit == null) {
      toast(`rumah sakit harus dipilih`, {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }
    const filter = [];
    filter.push("nama: ".concat(rumahSakit.nama));
    filter.push("periode: ".concat(String(tahun).concat("-").concat(bulan)));
    setFilterLabel(filter);
    try {
      const customConfig = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: {
          rsId: rumahSakit.id,
          periode: String(tahun).concat("-").concat(bulan),
        },
      };
      const results = await axiosJWT.get(
        "/apisirs6v2/rltigatitikdua",
        customConfig
      );

      const rlTigaTitikDuaDetails = results.data.data.map((value) => {
        return value;
      });

      setDataRL(rlTigaTitikDuaDetails);
      // setRumahSakit(null)
      handleClose();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteRL = async (id) => {
    const customConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "XSRF-TOKEN": CSRFToken,
      },
    };
    try {
      await axiosJWT.delete(`/apisirs6v2/rltigatitikdua/${id}`, customConfig);
      toast("Data Berhasil Dihapus", {
        position: toast.POSITION.TOP_RIGHT,
      });
      setDataRL((current) => current.filter((value) => value.id !== id));
    } catch (error) {
      console.log(error);
      toast("Data Gagal Disimpan", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const deleteConfirmation = (id) => {
    confirmAlert({
      title: "",
      message: "Yakin data yang dipilih akan dihapus? ",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            deleteRL(id);
          },
        },
        {
          label: "No",
        },
      ],
    });
  };

  const simpanValidasi = async (e) => {
    e.preventDefault();
    try {
      const customConfig = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      await axiosJWT.post(
        "/apisirs6v2/validasi",
        {
          rsId: rumahSakit.id,
          rlId: "rl.3.2",
          periodeBulan: bulan,
          periodeTahun: tahun,
          statusId: statusValidasi,
          keterangan: keteranganValidasi,
        },
        customConfig
      );

      toast("Data Berhasil Disimpan", {
        position: toast.POSITION.TOP_RIGHT,
      });

      setTimeout(() => {
        handleCloseValidasi();
      }, 1500);
    } catch (error) {
      toast(`Data tidak bisa disimpan karena ,${error.response.data.message}`, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }

    // console.log(rumahSakit.id)
    // console.log(bulan)
    // console.log(tahun)
    // console.log(statusValidasi)
    // console.log(keteranganValidasi)
  };

  const handleClose = () => setShow(false);
  const handleCloseValidasi = () => setShowValidasi(false);

  const handleShow = () => {
    const jenisUserId = user.jenisUserId;
    const satKerId = user.satKerId;
    switch (jenisUserId) {
      case 1:
        getProvinsi();
        setBulan(1);
        setShow(true);
        break;
      case 2:
        getKabKota(satKerId);
        setBulan(1);
        setShow(true);
        break;
      case 3:
        getRumahSakit(satKerId);
        setBulan(1);
        setShow(true);
        break;
      case 4:
        showRumahSakit(satKerId);
        setBulan(1);
        setShow(true);
        break;
      default:
    }
  };

  const handleShowValidasi = () => {
    setShowValidasi(true);
  };

  const getProvinsi = async () => {
    try {
      const customConfig = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const results = await axiosJWT.get("/apisirs6v2/provinsi", customConfig);

      const daftarProvinsi = results.data.data.map((value) => {
        return value;
      });

      setDaftarProvinsi(daftarProvinsi);
    } catch (error) {
      console.log(error);
    }
  };

  const getKabKota = async (provinsiId) => {
    try {
      const customConfig = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: {
          provinsiId: provinsiId,
        },
      };
      const results = await axiosJWT.get("/apisirs6v2/kabkota", customConfig);

      const daftarKabKota = results.data.data.map((value) => {
        return value;
      });

      setDaftarKabKota(daftarKabKota);
    } catch (error) {
      console.log(error);
    }
  };

  function handleDownloadExcel() {
    const header = [
      "No",
      "Jenis Pelayanan",
      "Pasien Awal Bulan",
      "Pasien Masuk",
      "Pasien Pindahan",
      "Pasien Keluar Hidup",
      "Pasien Keluar Mati <48 Jam",
      "Pasien Keluar Mati >=48 Jam",
      "Jumlah Lama Dirawat",
      "Pasien Akhir Bulan",
      "Jumlah Hari Perawatan",
      "Hari Perawatan VVIP",
      "Hari Perawatan VIP",
      "Hari Perawatan 1",
      "Hari Perawatan 2",
      "Hari Perawatan 3",
      "Hari Perawatan Khusus",
      "Jumlah Alokasi TT Awal Bulan",
    ];

    console.log(dataRL);

    const body = dataRL.map((value, index) => {
      const data = [
        index + 1,
        value.nama_jenis_pelayanan,
        value.pasien_awal_bulan,
        value.pasien_masuk,
        value.pasien_pindahan,
        value.pasien_dipindahkan,
        value.pasien_keluar_hidup,
        value.pasien_keluar_mati_kurang_dari_48_jam,
        value.pasien_keluar_mati_lebih_dari_atau_sama_dengan_48_jam,
        value.jumlah_lama_dirawat,
        hitungPasienAkhirBulan(index),
        hitungJumlahHariPerawatan(index),
        value.rincian_hari_perawatan_kelas_VVIP,
        value.rincian_hari_perawatan_kelas_VIP,
        value.rincian_hari_perawatan_kelas_1,
        value.rincian_hari_perawatan_kelas_2,
        value.rincian_hari_perawatan_kelas_3,
        value.jumlah_alokasi_tempat_tidur_awal_bulan,
      ];
      return data;
    });

    downloadExcel({
      fileName: "react-export-table-to-excel -> downloadExcel method",
      sheet: "react-export-table-to-excel",
      tablePayload: {
        header,
        body: body,
      },
    });
  }

  const [activeTab, setActiveTab] = useState("tab1");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const calculateTotalPasienAwalBulan = (data) => {
    return data.reduce((sum, item) => sum + item.pasien_awal_bulan, 0);
  };

  const calculateTotalPasienMasuk = (data) => {
    return data.reduce((sum, item) => sum + item.pasien_masuk, 0);
  };

  const calculateTotalPasienPindahan = (data) => {
    return data.reduce((sum, item) => sum + item.pasien_pindahan, 0);
  };

  const calculateTotalPasienDipindahkan = (data) => {
    return data.reduce((sum, item) => sum + item.pasien_dipindahkan, 0);
  };

  const calculateTotalPasienKeluarHidup = (data) => {
    return data.reduce((sum, item) => sum + item.pasien_keluar_hidup, 0);
  };

  const calculateTotalPasienKeluarMatiKurangDari48Jam = (data) => {
    return data.reduce(
      (sum, item) => sum + item.pasien_keluar_mati_kurang_dari_48_jam,
      0
    );
  };

  const calculateTotalPasienMatiLebihDariAtauSamaDengan48Jam = (data) => {
    return data.reduce(
      (sum, item) =>
        sum + item.pasien_keluar_mati_lebih_dari_atau_sama_dengan_48_jam,
      0
    );
  };

  const calculateTotalPasienWanitaKeluarMatiKurangDari48Jam = (data) => {
    return data.reduce(
      (sum, item) => sum + item.pasien_wanita_keluar_mati_kurang_dari_48_jam,
      0
    );
  };

  const calculateTotalPasienWanitaMatiLebihDariAtauSamaDengan48Jam = (data) => {
    return data.reduce(
      (sum, item) =>
        sum + item.pasien_wanita_keluar_mati_lebih_dari_atau_sama_dengan_48_jam,
      0
    );
  };

  const calculateTotalJumlahDirawat = (data) => {
    return data.reduce((sum, item) => sum + item.jumlah_lama_dirawat, 0);
  };

  const calculateTotalPasienAkhirBulan = (data) => {
    return data.reduce(
      (sum, item) =>
        sum +
        (parseInt(item.pasien_awal_bulan) +
          parseInt(item.pasien_masuk) +
          parseInt(item.pasien_pindahan)) -
        (parseInt(item.pasien_dipindahkan) +
          parseInt(item.pasien_keluar_hidup) +
          parseInt(item.pasien_keluar_mati_kurang_dari_48_jam) +
          parseInt(item.pasien_keluar_mati_lebih_dari_atau_sama_dengan_48_jam) +
          parseInt(item.pasien_wanita_keluar_mati_kurang_dari_48_jam) +
          parseInt(
            item.pasien_wanita_keluar_mati_lebih_dari_atau_sama_dengan_48_jam
          )),
      0
    );
  };

  const calculateTotalHariPerawatan = (data) => {
    return data.reduce(
      (sum, item) =>
        sum +
        parseInt(item.rincian_hari_perawatan_kelas_VVIP) +
        parseInt(item.rincian_hari_perawatan_kelas_VIP) +
        parseInt(item.rincian_hari_perawatan_kelas_1) +
        parseInt(item.rincian_hari_perawatan_kelas_2) +
        parseInt(item.rincian_hari_perawatan_kelas_3) +
        parseInt(item.rincian_hari_perawatan_kelas_khusus),
      0
    );
  };

  const calculateTotalKelasVVIP = (data) => {
    return data.reduce(
      (sum, item) => sum + item.rincian_hari_perawatan_kelas_VVIP,
      0
    );
  };

  const calculateTotalKelasVIP = (data) => {
    return data.reduce(
      (sum, item) => sum + item.rincian_hari_perawatan_kelas_VIP,
      0
    );
  };

  const calculateTotalKelas1 = (data) => {
    return data.reduce(
      (sum, item) => sum + item.rincian_hari_perawatan_kelas_1,
      0
    );
  };

  const calculateTotalKelas2 = (data) => {
    return data.reduce(
      (sum, item) => sum + item.rincian_hari_perawatan_kelas_2,
      0
    );
  };

  const calculateTotalKelas3 = (data) => {
    return data.reduce(
      (sum, item) => sum + item.rincian_hari_perawatan_kelas_3,
      0
    );
  };

  const calculateTotalKelasKhusus = (data) => {
    return data.reduce(
      (sum, item) => sum + item.rincian_hari_perawatan_kelas_khusus,
      0
    );
  };

  const calculateTotalJumlahAlokasiTempatTidurAwalBulan = (data) => {
    return data.reduce(
      (sum, item) => sum + item.jumlah_alokasi_tempat_tidur_awal_bulan,
      0
    );
  };

  const totalPasienAwalBulan = calculateTotalPasienAwalBulan(dataRL);
  const totalPasienMasuk = calculateTotalPasienMasuk(dataRL);
  const totalPasienPindahan = calculateTotalPasienPindahan(dataRL);
  const totalPasienDipindahkan = calculateTotalPasienDipindahkan(dataRL);
  const totalPasienKeluarHidup = calculateTotalPasienKeluarHidup(dataRL);
  const totalPasienKeluarMatiKurangDari48Jam =
    calculateTotalPasienKeluarMatiKurangDari48Jam(dataRL);
  const totalPasienKeluarMatiLebihDariAtauSamaDengan48Jam =
    calculateTotalPasienMatiLebihDariAtauSamaDengan48Jam(dataRL);
  const totalPasienWanitaKeluarMatiKurangDari48Jam =
    calculateTotalPasienWanitaKeluarMatiKurangDari48Jam(dataRL);
  const totalPasienWanitaKeluarMatiLebihDariAtauSamaDengan48Jam =
    calculateTotalPasienWanitaMatiLebihDariAtauSamaDengan48Jam(dataRL);
  const totalJumlahDirawat = calculateTotalJumlahDirawat(dataRL);
  const totalPasienAkhirBulan = calculateTotalPasienAkhirBulan(dataRL);
  const totalHariPerawatan = calculateTotalHariPerawatan(dataRL);
  const totalKelasVVIP = calculateTotalKelasVVIP(dataRL);
  const totalKelasVIP = calculateTotalKelasVIP(dataRL);
  const totalKelas1 = calculateTotalKelas1(dataRL);
  const totalKelas2 = calculateTotalKelas2(dataRL);
  const totalKelas3 = calculateTotalKelas3(dataRL);
  const totalKelasKhusus = calculateTotalKelasKhusus(dataRL);
  const totalTotalJumlahAlokasiTempatTidurAwalBulan =
    calculateTotalJumlahAlokasiTempatTidurAwalBulan(dataRL);

  return (
    <div
      className="container"
      style={{ marginTop: "70px", marginBottom: "70px" }}
    >
      <Modal show={show} onHide={handleClose} style={{ position: "fixed" }}>
        <Modal.Header closeButton>
          <Modal.Title>Filter</Modal.Title>
        </Modal.Header>

        <form onSubmit={getRL}>
          <Modal.Body>
            {user.jenisUserId === 1 ? (
              <>
                <div
                  className="form-floating"
                  style={{ width: "100%", paddingBottom: "5px" }}
                >
                  <select
                    name="provinsi"
                    id="provinsi"
                    typeof="select"
                    className="form-select"
                    onChange={(e) => provinsiChangeHandler(e)}
                  >
                    <option key={0} value={0}>
                      Pilih
                    </option>
                    {daftarProvinsi.map((nilai) => {
                      return (
                        <option key={nilai.id} value={nilai.id}>
                          {nilai.nama}
                        </option>
                      );
                    })}
                  </select>
                  <label htmlFor="provinsi">Provinsi</label>
                </div>

                <div
                  className="form-floating"
                  style={{ width: "100%", paddingBottom: "5px" }}
                >
                  <select
                    name="kabKota"
                    id="kabKota"
                    typeof="select"
                    className="form-select"
                    onChange={(e) => kabKotaChangeHandler(e)}
                  >
                    <option key={0} value={0}>
                      Pilih
                    </option>
                    {daftarKabKota.map((nilai) => {
                      return (
                        <option key={nilai.id} value={nilai.id}>
                          {nilai.nama}
                        </option>
                      );
                    })}
                  </select>
                  <label htmlFor="kabKota">Kab/Kota</label>
                </div>

                <div
                  className="form-floating"
                  style={{ width: "100%", paddingBottom: "5px" }}
                >
                  <select
                    name="rumahSakit"
                    id="rumahSakit"
                    typeof="select"
                    className="form-select"
                    onChange={(e) => rumahSakitChangeHandler(e)}
                  >
                    <option key={0} value={0}>
                      Pilih
                    </option>
                    {daftarRumahSakit.map((nilai) => {
                      return (
                        <option key={nilai.id} value={nilai.id}>
                          {nilai.nama}
                        </option>
                      );
                    })}
                  </select>
                  <label htmlFor="rumahSakit">Rumah Sakit</label>
                </div>
              </>
            ) : (
              <></>
            )}
            {user.jenisUserId === 2 ? (
              <>
                <div
                  className="form-floating"
                  style={{ width: "100%", paddingBottom: "5px" }}
                >
                  <select
                    name="kabKota"
                    id="kabKota"
                    typeof="select"
                    className="form-select"
                    onChange={(e) => kabKotaChangeHandler(e)}
                  >
                    <option key={0} value={0}>
                      Pilih
                    </option>
                    {daftarKabKota.map((nilai) => {
                      return (
                        <option key={nilai.id} value={nilai.id}>
                          {nilai.nama}
                        </option>
                      );
                    })}
                  </select>
                  <label htmlFor="kabKota">Kab/Kota</label>
                </div>

                <div
                  className="form-floating"
                  style={{ width: "100%", paddingBottom: "5px" }}
                >
                  <select
                    name="rumahSakit"
                    id="rumahSakit"
                    typeof="select"
                    className="form-select"
                    onChange={(e) => rumahSakitChangeHandler(e)}
                  >
                    <option key={0} value={0}>
                      Pilih
                    </option>
                    {daftarRumahSakit.map((nilai) => {
                      return (
                        <option key={nilai.id} value={nilai.id}>
                          {nilai.nama}
                        </option>
                      );
                    })}
                  </select>
                  <label htmlFor="rumahSakit">Rumah Sakit</label>
                </div>
              </>
            ) : (
              <></>
            )}
            {user.jenisUserId === 3 ? (
              <>
                <div
                  className="form-floating"
                  style={{ width: "100%", paddingBottom: "5px" }}
                >
                  <select
                    name="rumahSakit"
                    id="rumahSakit"
                    typeof="select"
                    className="form-select"
                    onChange={(e) => rumahSakitChangeHandler(e)}
                  >
                    <option key={0} value={0}>
                      Pilih
                    </option>
                    {daftarRumahSakit.map((nilai) => {
                      return (
                        <option key={nilai.id} value={nilai.id}>
                          {nilai.nama}
                        </option>
                      );
                    })}
                  </select>
                  <label htmlFor="rumahSakit">Rumah Sakit</label>
                </div>
              </>
            ) : (
              <></>
            )}
            <div
              className="form-floating"
              style={{ width: "70%", display: "inline-block" }}
            >
              <select
                typeof="select"
                className="form-control"
                onChange={bulanChangeHandler}
              >
                {daftarBulan.map((bulan) => {
                  return (
                    <option
                      key={bulan.value}
                      name={bulan.key}
                      value={bulan.value}
                    >
                      {bulan.key}
                    </option>
                  );
                })}
              </select>
              <label>Bulan</label>
            </div>
            <div
              className="form-floating"
              style={{ width: "30%", display: "inline-block" }}
            >
              <input
                name="tahun"
                type="number"
                className="form-control"
                id="tahun"
                placeholder="Tahun"
                value={tahun}
                onChange={(e) => tahunChangeHandler(e)}
                disabled={true}
              />
              <label htmlFor="tahun">Tahun</label>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="mt-3 mb-3">
              <ToastContainer />
              <button type="submit" className="btn btn-outline-success">
                <HiSaveAs size={20} /> Terapkan
              </button>
            </div>
          </Modal.Footer>
        </form>
      </Modal>

      <Modal
        show={showValidasi}
        onHide={handleCloseValidasi}
        style={{ position: "fixed" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Validasi</Modal.Title>
        </Modal.Header>

        <form onSubmit={simpanValidasi}>
          <Modal.Body>
            <div
              className="form-floating"
              style={{ width: "100%", paddingBottom: "5px" }}
            >
              <select
                name="statusValidasi"
                id="statusValidasi"
                typeof="select"
                className="form-select"
                onChange={(e) => statusValidasiChangeHadler(e)}
              >
                <option key="1" value="1">
                  Valid
                </option>
                <option key="2" value="2">
                  Tidak Valid
                </option>
              </select>
              <label htmlFor="statusValidasi">Status</label>
            </div>
            <div
              className="form-floating"
              style={{ width: "100%", paddingBottom: "5px" }}
            >
              <input
                type="text"
                id="keteranganValidasi"
                name="keterangansValidasi"
                className="form-control"
                onChange={(e) => keteranganValidasiChangeHadler(e)}
              />
              <label htmlFor="keteranganValidasi">Keterangan</label>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="mt-1 mb-1">
              <ToastContainer />
              <button type="submit" className="btn btn-outline-success">
                <HiSaveAs size={20} /> Simpan
              </button>
            </div>
          </Modal.Footer>
        </form>
      </Modal>

      <div className="row">
        <div className="col-md-12">
          <h4>
            <span style={{ color: "gray" }}>RL. 3.2 Rawat Inap</span>
          </h4>
          <div style={{ marginBottom: "10px" }}>
            {user.jenisUserId === 4 ? (
              <Link
                className="btn"
                to={`/rl32/tambah/`}
                style={{
                  marginRight: "5px",
                  fontSize: "18px",
                  backgroundColor: "#779D9E",
                  color: "#FFFFFF",
                }}
              >
                +
              </Link>
            ) : (
              <></>
            )}
            <button
              className="btn"
              style={{
                fontSize: "18px",
                backgroundColor: "#779D9E",
                color: "#FFFFFF",
              }}
              onClick={handleShow}
            >
              Filter
            </button>
            <button
              className="btn"
              style={{
                fontSize: "18px",
                marginLeft: "5px",
                backgroundColor: "#779D9E",
                color: "#FFFFFF",
              }}
              onClick={handleDownloadExcel}
            >
              Download
            </button>
          </div>

          <div>
            <h5 style={{ fontSize: "14px" }}>
              {filterLabel.length > 0 ? (
                <>
                  filtered by{" "}
                  {filterLabel
                    .map((value) => {
                      return value;
                    })
                    .join(", ")}
                </>
              ) : (
                <></>
              )}
            </h5>
          </div>

          <div>
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "tab1" ? "active" : ""}`}
                  onClick={() => handleTabClick("tab1")}
                >
                  Data
                </button>
              </li>
              {user.jenisUserId === 3 && dataRL.length > 0 ? (
                <li className="nav-item">
                  <button
                    className={`nav-link ${
                      activeTab === "tab2" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("tab2")}
                  >
                    Validasi
                  </button>
                </li>
              ) : (
                <></>
              )}
            </ul>

            <div className="tab-content mt-3">
              <div
                className={`tab-pane fade ${
                  activeTab === "tab1" ? "show active" : ""
                }`}
              >
                <div className={style["table-container"]}>
                  <table className={style.table}>
                    <thead className={style.thead}>
                      <tr className="">
                        <th
                          className={style["sticky-header"]}
                          rowSpan="2"
                          style={{ width: "2%" }}
                        >
                          No.
                        </th>
                        <th
                          className={style["sticky-header"]}
                          rowSpan="2"
                          style={{ width: "5%" }}
                        >
                          Aksi
                        </th>
                        <th
                          className={style["sticky-header"]}
                          rowSpan="2"
                          style={{ width: "8%" }}
                        >
                          Jenis Pelayanan
                        </th>
                        <th rowSpan="2" style={{ width: "4%" }}>
                          Pasien Awal Bulan
                        </th>
                        <th rowSpan="2" style={{ width: "4%" }}>
                          Pasien Masuk
                        </th>
                        <th rowSpan="2" style={{ width: "4%" }}>
                          Pasien Pindahan
                        </th>
                        <th rowSpan="2" style={{ width: "4%" }}>
                          Pasien Dipindahkan
                        </th>
                        <th rowSpan="2" style={{ width: "4%" }}>
                          Pasien Keluar Hidup
                        </th>
                        <th colSpan="2" style={{ width: "8%" }}>
                          Pasien Pria Keluar Mati
                        </th>
                        <th colSpan="2" style={{ width: "8%" }}>
                          Pasien Wanita Keluar Mati
                        </th>
                        <th rowSpan="2" style={{ width: "4%" }}>
                          Jumlah Lama Dirawat
                        </th>
                        <th rowSpan="2" style={{ width: "4%" }}>
                          Pasien Akhir Bulan
                        </th>
                        <th rowSpan="2" style={{ width: "4%" }}>
                          Jumlah Hari Perawatan
                        </th>
                        <th colSpan="6" style={{ width: "20%" }}>
                          Rincian Hari Perawatan Per Kelas
                        </th>
                        <th rowSpan="2" style={{ width: "4%" }}>
                          Jumlah Alokasi TT Awal Bulan
                        </th>
                      </tr>
                      <tr className={style["subheader-row"]}>
                        <th style={{ width: "5%" }}>{"< 48 jam"}</th>
                        <th style={{ width: "5%" }}>{">= 48 jam"}</th>
                        <th style={{ width: "5%" }}>{"< 48 jam"}</th>
                        <th style={{ width: "5%" }}>{">= 48 jam"}</th>
                        <th style={{ width: "5%" }}>VVIP</th>
                        <th style={{ width: "5%" }}>VIP</th>
                        <th style={{ width: "5%" }}>1</th>
                        <th style={{ width: "5%" }}>2</th>
                        <th style={{ width: "5%" }}>3</th>
                        <th style={{ width: "5%" }}>Khusus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataRL.map((value, index) => {
                        return (
                          <tr key={value.id}>
                            <td className={style["sticky-column"]}>
                              <input
                                type="text"
                                name="id"
                                className="form-control"
                                value={index + 1}
                                disabled={true}
                              />
                            </td>
                            <td
                              className={style["sticky-column"]}
                              style={{
                                textAlign: "center",
                                verticalAlign: "middle",
                              }}
                            >
                              <ToastContainer />
                              {/* <RiDeleteBin5Fill  size={20} onClick={(e) => hapus(value.id)} style={{color: "gray", cursor: "pointer", marginRight: "5px"}} /> */}
                              {user.jenisUserId === 4 ? (
                                <div style={{ display: "flex" }}>
                                  <button
                                    className="btn btn-danger"
                                    style={{
                                      margin: "0 5px 0 0",
                                      backgroundColor: "#FF6663",
                                      border: "1px solid #FF6663",
                                    }}
                                    type="button"
                                    onClick={(e) =>
                                      deleteConfirmation(value.id)
                                    }
                                  >
                                    Hapus
                                  </button>
                                  <Link
                                    to={`/rl32/ubah/${value.id}`}
                                    className="btn btn-warning"
                                    style={{
                                      margin: "0 5px 0 0",
                                      backgroundColor: "#CFD35E",
                                      border: "1px solid #CFD35E",
                                      color: "#FFFFFF",
                                    }}
                                  >
                                    Ubah
                                  </Link>
                                </div>
                              ) : (
                                <></>
                              )}
                            </td>
                            <td
                              className={style["sticky-column"]}
                              style={{ background: "white" }}
                            >
                              <input
                                type="text"
                                name="jenisPelayanan"
                                className="form-control"
                                value={value.nama_jenis_pelayanan}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="pasienAwalBulan"
                                className="form-control"
                                value={value.pasien_awal_bulan}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="pasienMasuk"
                                className="form-control"
                                value={value.pasien_masuk}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="pasienPindahan"
                                className="form-control"
                                value={value.pasien_pindahan}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="pasienDipindahkan"
                                className="form-control"
                                value={value.pasien_dipindahkan}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="pasienKeluarHidup"
                                className="form-control"
                                value={value.pasien_keluar_hidup}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="kurangDari48Jam"
                                className="form-control"
                                value={
                                  value.pasien_keluar_mati_kurang_dari_48_jam
                                }
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="lebihDariAtauSamaDengan48Jam"
                                className="form-control"
                                value={
                                  value.pasien_keluar_mati_lebih_dari_atau_sama_dengan_48_jam
                                }
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="wanitaKurangDari48Jam"
                                className="form-control"
                                value={
                                  value.pasien_wanita_keluar_mati_kurang_dari_48_jam
                                }
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="wanitaLebihDariAtauSamaDengan48Jam"
                                className="form-control"
                                value={
                                  value.pasien_wanita_keluar_mati_lebih_dari_atau_sama_dengan_48_jam
                                }
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="jumlahLamaDirawat"
                                className="form-control"
                                value={value.jumlah_lama_dirawat}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="pasienAkhirBulan"
                                className="form-control"
                                value={hitungPasienAkhirBulan(index)}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="jumlahHariPerawatan"
                                className="form-control"
                                value={hitungJumlahHariPerawatan(index)}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="kelasVVIP"
                                className="form-control"
                                value={value.rincian_hari_perawatan_kelas_VVIP}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="kelasVIP"
                                className="form-control"
                                value={value.rincian_hari_perawatan_kelas_VIP}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="kelas1"
                                className="form-control"
                                value={value.rincian_hari_perawatan_kelas_1}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="kelas2"
                                className="form-control"
                                value={value.rincian_hari_perawatan_kelas_2}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="kelas3"
                                className="form-control"
                                value={value.rincian_hari_perawatan_kelas_3}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="kelasKhusus"
                                className="form-control"
                                value={
                                  value.rincian_hari_perawatan_kelas_khusus
                                }
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="jumlahAlokasiTTAwalBulan"
                                className="form-control"
                                value={
                                  value.jumlah_alokasi_tempat_tidur_awal_bulan
                                }
                                disabled={true}
                              />
                            </td>
                          </tr>
                        );
                      })}
                      {dataRL.length > 0 ? (
                        <>
                          <tr>
                            <td className={style["sticky-column"]}></td>
                            <td className={style["sticky-column"]}></td>
                            <td
                              className={style["sticky-column"]}
                              style={{ background: "white" }}
                            >
                              Total
                            </td>
                            <td>
                              <input
                                type="text"
                                name="totalJenisPelayanan"
                                className="form-control"
                                value={totalPasienAwalBulan}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="totalPasienMasuk"
                                className="form-control"
                                value={totalPasienMasuk}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="totalPasienPindahan"
                                className="form-control"
                                value={totalPasienPindahan}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="totalPasienDipindahkan"
                                className="form-control"
                                value={totalPasienDipindahkan}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="totalPasienKeluarHidup"
                                className="form-control"
                                value={totalPasienKeluarHidup}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="totalPasienKeluarMatiKurangDari48Jam"
                                className="form-control"
                                value={totalPasienKeluarMatiKurangDari48Jam}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="totalPasienKeluarMatiLebihDariAtauSamaDengan48Jam"
                                className="form-control"
                                value={
                                  totalPasienKeluarMatiLebihDariAtauSamaDengan48Jam
                                }
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="totalPasienWanitaKeluarMatiKurangDari48Jam"
                                className="form-control"
                                value={
                                  totalPasienWanitaKeluarMatiKurangDari48Jam
                                }
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="totalPasienWanitaKeluarMatiLebihDariAtauSamaDengan48Jam"
                                className="form-control"
                                value={
                                  totalPasienWanitaKeluarMatiLebihDariAtauSamaDengan48Jam
                                }
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="totalJumlahDirawat"
                                className="form-control"
                                value={totalJumlahDirawat}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="totalPasienAkhirBulan"
                                className="form-control"
                                value={totalPasienAkhirBulan}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="totalHariPerawatan"
                                className="form-control"
                                value={totalHariPerawatan}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="totalKelasVVIP"
                                className="form-control"
                                value={totalKelasVVIP}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="totalKelasVIP"
                                className="form-control"
                                value={totalKelasVIP}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="totalKelas1"
                                className="form-control"
                                value={totalKelas1}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="totalKelas2"
                                className="form-control"
                                value={totalKelas2}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="totalKelas3"
                                className="form-control"
                                value={totalKelas3}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="totalKelasKhusus"
                                className="form-control"
                                value={totalKelasKhusus}
                                disabled={true}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="totalJumlahAlokasiTTAwalBulan"
                                className="form-control"
                                value={
                                  totalTotalJumlahAlokasiTempatTidurAwalBulan
                                }
                                disabled={true}
                              />
                            </td>
                          </tr>
                        </>
                      ) : (
                        <></>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div
                className={`tab-pane fade ${
                  activeTab === "tab2" ? "show active" : ""
                }`}
              >
                <button
                  className="btn mb-1"
                  style={{
                    fontSize: "18px",
                    backgroundColor: "#779D9E",
                    color: "#FFFFFF",
                  }}
                  onClick={handleShowValidasi}
                >
                  +
                </button>
                <div className={style["table-container"]}>
                  <table className={style.table} style={{ width: "100%" }}>
                    <thead className={style.thead}>
                      <tr className="">
                        <th rowSpan="2" style={{ width: "1%" }}>
                          No.
                        </th>
                        <th rowSpan="2" style={{ width: "4%" }}>
                          Status
                        </th>
                        <th rowSpan="2" style={{ width: "10%" }}>
                          Keterangan
                        </th>
                        <th rowSpan="2" style={{ width: "3%" }}>
                          Created At
                        </th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RL32;
