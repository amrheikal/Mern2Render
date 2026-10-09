import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import AddProductForm from "../components/AddProductForm";
import AdminProductsTable from "../components/AdminProductsTable";
import { BASE_URL } from "../constants/baseUrl";
import { useAuth } from "../context/Auth/AuthContext";
import type { DashboardStats } from "../types/DashboardStats";
import type { Product } from "../types/Product";

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h5" sx={{ mt: 0.5 }}>
      {value}
    </Typography>
  </Paper>
);

const AdminDashboardPage = () => {
  const { token, username } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Children call this after a create/update/delete to re-run the effect below.
  const refresh = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, productsResponse] = await Promise.all([
          fetch(`${BASE_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BASE_URL}/product`),
        ]);

        if (!statsResponse.ok || !productsResponse.ok) {
          setError(true);
          return;
        }

        setStats(await statsResponse.json());
        setProducts(await productsResponse.json());
        setError(false);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, reloadKey]);

  if (loading) {
    return <Box sx={{ mt: 2 }}>Loading dashboard...</Box>;
  }

  if (error) {
    return <Box sx={{ mt: 2 }}>Something went wrong, please try again!</Box>;
  }

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4">Admin Dashboard</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Welcome back, {username}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          mb: 4,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
        }}
      >
        <StatCard label="Products" value={String(stats?.totalProducts ?? 0)} />
        <StatCard label="Units in stock" value={String(stats?.totalStock ?? 0)} />
        <StatCard
          label="Inventory value"
          value={`${stats?.inventoryValue ?? 0} EGP`}
        />
        <StatCard label="Out of stock" value={String(stats?.outOfStock ?? 0)} />
        <StatCard label="Orders" value={String(stats?.totalOrders ?? 0)} />
        <StatCard label="Revenue" value={`${stats?.totalRevenue ?? 0} EGP`} />
        <StatCard label="Customers" value={String(stats?.totalUsers ?? 0)} />
      </Box>

      <AddProductForm onCreated={refresh} />
      <AdminProductsTable products={products} onChanged={refresh} />
    </Container>
  );
};

export default AdminDashboardPage;
