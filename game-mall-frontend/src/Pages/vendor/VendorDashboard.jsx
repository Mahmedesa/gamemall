import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Api/axios";
function VendorDashboard() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    loadStores();
  }, []);
  const loadStores = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/api/vendor/stores");
      console.log("Vendor stores response:", response.data);
      /* * Response.success() غالبًا بيرجع: * * { * success: true, * message: "...", * data: [...] * } * * لذلك بنقرأ data. */ const result =
        response.data?.data;
      if (Array.isArray(result)) {
        setStores(result);
      } else {
        setStores([]);
      }
    } catch (err) {
      console.error("Failed to load vendor stores:", err);
      const message =
        err.response?.data?.message || "حدث خطأ أثناء تحميل المحلات";
      setError(message);
    } finally {
      setLoading(false);
    }
  };
  const openStoreEditor = (storeId) => {
    navigate(`/vendor/store/${storeId}`);
  };
  if (loading) {
    return (
      <div style={styles.page}>
        {" "}
        <div style={styles.loading}> جاري تحميل المحلات... </div>{" "}
      </div>
    );
  }
  return (
    <div style={styles.page}>
      {" "}
      <div style={styles.container}>
        {" "}
        <div style={styles.header}>
          {" "}
          <div>
            {" "}
            <h1 style={styles.title}> Vendor Dashboard </h1>{" "}
            <p style={styles.subtitle}>
              {" "}
              إدارة محلاتك وتصميم الـ Virtual Store{" "}
            </p>{" "}
          </div>{" "}
          <button style={styles.refreshButton} onClick={loadStores}>
            {" "}
            تحديث{" "}
          </button>{" "}
        </div>{" "}
        {error && <div style={styles.error}> {error} </div>}{" "}
        {!error && stores.length === 0 && (
          <div style={styles.empty}>
            {" "}
            <h2>لا توجد محلات</h2>{" "}
            <p> لا يوجد أي محل مرتبط بحساب الـVendor الحالي. </p>{" "}
          </div>
        )}{" "}
        {stores.length > 0 && (
          <div style={styles.grid}>
            {" "}
            {stores.map((store) => (
              <div key={store.store_id} style={styles.card}>
                {" "}
                <div style={styles.logoContainer}>
                  {" "}
                  {store.shop_logo ? (
                    <img
                      src={store.shop_logo}
                      alt={store.shop_name}
                      style={styles.logo}
                    />
                  ) : (
                    <div style={styles.logoPlaceholder}> 🏪 </div>
                  )}{" "}
                </div>{" "}
                <div style={styles.info}>
                  {" "}
                  <h2 style={styles.storeName}> {store.shop_name} </h2>{" "}
                  <div style={styles.details}>
                    {" "}
                    <div>
                      {" "}
                      <span style={styles.label}> Store ID </span>{" "}
                      <span style={styles.value}> #{store.store_id} </span>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <span style={styles.label}> Floor </span>{" "}
                      <span style={styles.value}>
                        {" "}
                        {store.floor_num ?? "-"}{" "}
                      </span>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <span style={styles.label}> Status </span>{" "}
                      <span
                        style={{
                          ...styles.status,
                          background:
                            Number(store.is_active) === 1
                              ? "rgba(34,197,94,.15)"
                              : "rgba(239,68,68,.15)",
                          color:
                            Number(store.is_active) === 1
                              ? "#22c55e"
                              : "#ef4444",
                        }}
                      >
                        {" "}
                        {Number(store.is_active) === 1
                          ? "ACTIVE"
                          : "INACTIVE"}{" "}
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                  {store.shop_specializes && (
                    <p style={styles.specialization}>
                      {" "}
                      {store.shop_specializes}{" "}
                    </p>
                  )}{" "}
                  <button
                    style={styles.editorButton}
                    onClick={() => openStoreEditor(store.store_id)}
                  >
                    {" "}
                    فتح محرر المحل{" "}
                  </button>{" "}
                </div>{" "}
              </div>
            ))}{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
}
const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #24104d 0%, #090313 45%, #030107 100%)",
    color: "#fff",
    padding: "40px 20px",
    boxSizing: "border-box",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  container: { width: "100%", maxWidth: "1400px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "35px",
  },
  title: {
    margin: 0,
    fontSize: "36px",
    fontWeight: 800,
    background: "linear-gradient(90deg, #c084fc, #e879f9, #a855f7)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: { margin: "8px 0 0", color: "#aaa", fontSize: "16px" },
  refreshButton: {
    border: "1px solid #7c3cff",
    background: "rgba(124,60,255,.12)",
    color: "#c084fc",
    padding: "11px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
  },
  error: {
    padding: "15px 18px",
    borderRadius: "12px",
    background: "rgba(239,68,68,.12)",
    border: "1px solid rgba(239,68,68,.35)",
    color: "#fca5a5",
    marginBottom: "25px",
  },
  loading: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#c084fc",
    fontSize: "20px",
  },
  empty: {
    padding: "70px 20px",
    textAlign: "center",
    borderRadius: "18px",
    border: "1px solid rgba(192,132,252,.15)",
    background: "rgba(255,255,255,.03)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "25px",
  },
  card: {
    overflow: "hidden",
    borderRadius: "18px",
    border: "1px solid rgba(168,85,247,.25)",
    background:
      "linear-gradient(145deg, rgba(255,255,255,.07), rgba(255,255,255,.025))",
    boxShadow: "0 15px 45px rgba(0,0,0,.35)",
    transition: "transform .2s ease",
  },
  logoContainer: {
    width: "100%",
    height: "180px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, rgba(124,60,255,.16), rgba(217,70,239,.08))",
    borderBottom: "1px solid rgba(255,255,255,.06)",
  },
  logo: {
    width: "120px",
    height: "120px",
    objectFit: "contain",
    borderRadius: "18px",
  },
  logoPlaceholder: {
    width: "90px",
    height: "90px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "40px",
    background: "rgba(124,60,255,.15)",
  },
  info: { padding: "22px" },
  storeName: { margin: "0 0 18px", fontSize: "23px", fontWeight: 700 },
  details: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "15px",
  },
  label: { color: "#777", marginRight: "10px", fontSize: "13px" },
  value: { color: "#ddd", fontSize: "14px" },
  status: {
    display: "inline-block",
    padding: "4px 9px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: 700,
  },
  specialization: { color: "#aaa", fontSize: "14px", margin: "12px 0 20px" },
  editorButton: {
    width: "100%",
    border: "none",
    borderRadius: "10px",
    padding: "13px 16px",
    cursor: "pointer",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    background: "linear-gradient(90deg, #7c3cff, #a855f7, #d946ef)",
    boxShadow: "0 8px 25px rgba(124,60,255,.25)",
  },
};
export default VendorDashboard;
