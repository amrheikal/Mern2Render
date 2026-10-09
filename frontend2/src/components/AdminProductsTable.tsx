import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { BASE_URL, resolveImageUrl } from "../constants/baseUrl";
import { useAuth } from "../context/Auth/AuthContext";
import type { Product } from "../types/Product";

interface Props {
  products: Product[];
  onChanged: () => void;
}

const AdminProductsTable = ({ products, onChanged }: Props) => {
  const { token } = useAuth();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [error, setError] = useState("");

  const startEditing = (product: Product) => {
    setError("");
    setEditingId(product._id);
    setEditPrice(String(product.price));
    setEditStock(String(product.stock ?? 0));
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEditing = async (productId: string) => {
    const formData = new FormData();
    formData.append("price", editPrice);
    formData.append("stock", editStock);

    try {
      const response = await fetch(`${BASE_URL}/product/${productId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        setError(await response.text());
        return;
      }

      setError("");
      setEditingId(null);
      onChanged();
    } catch {
      setError("Unable to update the product, please try again!");
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(
        `${BASE_URL}/product/${productToDelete._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        setError(await response.text());
        return;
      }

      setError("");
      onChanged();
    } catch {
      setError("Unable to delete the product, please try again!");
    } finally {
      setProductToDelete(null);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Products ({products.length})
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Title</TableCell>
              <TableCell align="right">Price (EGP)</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id} hover>
                <TableCell>
                  <Box
                    component="img"
                    src={resolveImageUrl(product.image)}
                    alt={product.title}
                    sx={{
                      width: 56,
                      height: 56,
                      objectFit: "cover",
                      borderRadius: 2,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                </TableCell>
                <TableCell>{product.title}</TableCell>
                <TableCell align="right">
                  {editingId === product._id ? (
                    <TextField
                      size="small"
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      sx={{ width: 110 }}
                    />
                  ) : (
                    product.price
                  )}
                </TableCell>
                <TableCell align="right">
                  {editingId === product._id ? (
                    <TextField
                      size="small"
                      type="number"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      sx={{ width: 90 }}
                    />
                  ) : (
                    product.stock
                  )}
                </TableCell>
                <TableCell align="right">
                  {editingId === product._id ? (
                    <Box
                      sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                    >
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => saveEditing(product._id)}
                      >
                        Save
                      </Button>
                      <Button size="small" onClick={cancelEditing}>
                        Cancel
                      </Button>
                    </Box>
                  ) : (
                    <Box
                      sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                    >
                      <IconButton
                        aria-label="edit product"
                        onClick={() => startEditing(product)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label="delete product"
                        color="error"
                        onClick={() => setProductToDelete(product)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={!!productToDelete}
        onClose={() => setProductToDelete(null)}
      >
        <DialogTitle>Delete product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{productToDelete?.title}"? This
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductToDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AdminProductsTable;
