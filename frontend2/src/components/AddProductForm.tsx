import { useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { BASE_URL } from "../constants/baseUrl";
import { useAuth } from "../context/Auth/AuthContext";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface Props {
  onCreated: () => void;
}

const AddProductForm = ({ onCreated }: Props) => {
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Release the object URL of the previous preview whenever it changes.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, WEBP or GIF images are allowed.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("The image must be smaller than 5MB.");
      return;
    }

    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setTitle("");
    setPrice("");
    setStock("");
    setImage(null);
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async () => {
    setError("");
    setSuccess("");

    if (!title || !price || !stock) {
      setError("Please fill in the title, price and stock.");
      return;
    }

    if (!image) {
      setError("Please choose an image for the product.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("image", image);

    try {
      setSaving(true);
      // No Content-Type header here: the browser adds the multipart boundary.
      const response = await fetch(`${BASE_URL}/product`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        setError(await response.text());
        return;
      }

      resetForm();
      setSuccess("Product added successfully!");
      onCreated();
    } catch {
      setError("Unable to add the product, please try again!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Add New Product
      </Typography>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr" },
        }}
      >
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label="Price (EGP)"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <TextField
          label="Stock"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mt: 2,
        }}
      >
        <Button
          component="label"
          variant="outlined"
          startIcon={<AddPhotoAlternateIcon />}
        >
          {image ? "Change Image" : "Upload Image"}
          <input
            ref={fileInputRef}
            hidden
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </Button>

        {preview && (
          <Box
            component="img"
            src={preview}
            alt="New product preview"
            sx={{
              width: 96,
              height: 96,
              objectFit: "cover",
              borderRadius: 2,
              border: "1px solid #e2e8f0",
            }}
          />
        )}

        {image && (
          <Typography variant="body2" color="text.secondary">
            {image.name}
          </Typography>
        )}

        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={saving}
          sx={{ ml: { md: "auto" } }}
        >
          {saving ? "Saving..." : "Add Product"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
    </Paper>
  );
};

export default AddProductForm;
