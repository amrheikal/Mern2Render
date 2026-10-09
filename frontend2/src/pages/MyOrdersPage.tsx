import { Box,  Container, Typography } from "@mui/material";
import { useAuth } from "../context/Auth/AuthContext";
import { useEffect } from "react";

const MyOrdersPage = () => {
  

const{getMyOrders, myOrders} = useAuth();

useEffect(() => {
  
    getMyOrders();
    
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  return (
    <Container>
        {myOrders.map((order) => (
          <Box key={order._id} sx={{ border: "1px solid #ccc", padding: 2, marginBottom: 2 }}>
            <Typography variant="h6">Order ID: {order._id}</Typography> 
            <Typography variant="h6">Address: {order.address}</Typography> 
            <Typography variant="h6">value: {order.total}</Typography>     
          </Box>
        ))}
        </Container>
  );
};

export default MyOrdersPage;
