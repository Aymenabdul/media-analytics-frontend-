import {
    Box,
    Button,
    Container,
    Typography
} from "@mui/material";
import Navbar from "../components/Navbar";


export default function Analytics() {
    return (
        <>
            <Navbar />
            <Container
                maxWidth={false}
                sx={{
                width: "100%",
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
                }}
            >
                <Typography variant="h5" fontWeight={600} textAlign="left" sx={{ mb: 2, width: "98%" }}>Search YouTube Analytics</Typography>
            </Container>
        </>
    )
}