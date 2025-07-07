import { 
    AppBar, 
    Box,
    Toolbar,
    Typography,
    Link
} from "@mui/material";
import logo from "../assets/logo.png";

export default function Navbar() {
    return (
        <AppBar position="static" elevation={0} sx={{ bgcolor: "yellow" }}>
            <Toolbar sx={{ py: 1 }}>
                <Box component="img" src={logo} height={55} width={90} />

                <Box sx={{ flexGrow: 1 }} />

                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Link href="/" underline="none" sx={{ color: "black", fontWeight: 500, fontFamily: "sans-serif" }}>Home</Link>
                    <Link href="/analytics" underline="none" sx={{ color: "black", fontWeight: 500, fontFamily: "sans-serif" }}>Analytics</Link>
                </Box>
            </Toolbar>
        </AppBar>
    );
};
