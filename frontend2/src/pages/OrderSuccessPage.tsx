import { Box, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const OrderSuccessPage = () => {
  const navigate = useNavigate();

  const handleHome = () => {
    navigate("/");
  };

  return (
    <Container
      fixed
      sx={{
        mt: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "success.main",
          color: "white",
          fontSize: "1.5rem",
          fontWeight: 700,
        }}
      >
        OK
      </Box>
      <Typography variant="h4"> Thanks for you order.</Typography>
      <Typography>
        We started processing it, and we will get back to you soon
      </Typography>
      <Button variant="contained" onClick={handleHome}>Go to Home</Button>
    </Container>
  );
};

export default OrderSuccessPage;
