import Container from "@mui/material/Container";
import ProductCard from "../components/ProductCard";
import { useEffect, useState } from "react";
import type { Product } from "../types/Product";
import { BASE_URL } from "../constants/baseUrl";
import { Box } from "@mui/material";

const HomePage = () => {




  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);








  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/product`);
        const data = await response.json();
        setProducts(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);









  if (loading) {
    return <Box sx={{ mt: 2 }}>Loading products...</Box>;
  }

  if (error) {
    return <Box sx={{ mt: 2 }}>Something went wrong, please try again!</Box>;
  }

  if (products.length === 0) {
    return <Box sx={{ mt: 2 }}>No products available right now.</Box>;
  }




//////////////////////////////////////////////

  return (
    <Container sx={{ mt: 2 }}>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(3, 1fr)",
          },
        }}
      >




        {products.map((p) => (
          <Box key={p._id}> 

              <ProductCard {...p} />
              
          </Box>
        ))}




      </Box>
    </Container>
  );





};

export default HomePage;
