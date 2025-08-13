const VerifGagal = () => {
  return (
    <div style={styles.outerContainer}>
    <div style={styles.container}>
      <h1 style={styles.heading}>Verifikasi Email Gagal</h1>
      <p style={styles.message}>Token Verifikasi Email telah lebih dari 1 jam artinya telah Kadaluarsa, dan Registrasi Gagal.</p>
      <p style={styles.subMessage}>Terima kasih telah melakukan verifikasi!</p>
    </div>
    </div>
  );
};

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
    maxWidth: '400px',
    width: '100%', // Memastikan elemen tidak terlalu besar
  },
  heading: {
    color: '#4CAF50',
    fontSize: '24px',
  },
  message: {
    fontSize: '18px',
    color: '#555',
  },
  subMessage: {
    fontSize: '16px',
    color: '#777',
  },
};

export default VerifGagal;
