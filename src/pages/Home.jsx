import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  Container,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";
import Navbar from "../components/Navbar";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    channelName: "",
    url: "",
    date: ""
  });
  const [storedUrls, setStoredUrls] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    handleGetStoredUrls();
  }, []);

  const isValidUrl = (url) => {
    return (
      url.startsWith("https://www.youtube.com") ||
      url.startsWith("https://youtu.be/")
    );
  };



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (newValue) => {
    setSelectedDate(newValue);
    setFormData((prev) => ({
      ...prev,
      date: newValue ? format(newValue, "dd-MM-yyyy") : ""
    }));
  };

  const handleSubmitVideo = async () => {
    // ✅ Simple URL check: must start with https://
    if (!formData.url || !isValidUrl(formData.url)) {
      alert("❌ Please provide a valid URL that starts with https://");
      return;
    }

    try {
      // ✅ Check if the URL already exists
      const checkRes = await axios.get("https://meinigar.online/api/urls/check", {
        params: { url: formData.url },
      });

      if (checkRes.data === true) {
        alert("⚠️ This video URL already exists!");
        return;
      }

      // ✅ Submit the URL
      await axios.post("https://meinigar.online/api/urls", {
        channelName: formData.channelName,
        url: formData.url,
        date: formData.date,
      });

      alert("✅ Video submitted successfully!");
      setFormData({ channelName: "", url: "", date: "" });
      setSelectedDate(null);
      handleGetStoredUrls();
    } catch (err) {
      console.error("Error submitting video:", err);
      alert("❌ Something went wrong while submitting the video.");
    }
  };


  const handleDeleteUrl = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this URL?");
    if (!confirmed) return;

    try {
      await axios.delete(`https://meinigar.online/api/urls/${id}`);
      alert("🗑️ URL deleted successfully!");
      handleGetStoredUrls(); // refresh list
    } catch (err) {
      console.error("Error deleting URL:", err);
      alert("❌ Failed to delete the URL.");
    }
  };


  const handleGetStoredUrls = async () => {
    await axios
      .get("https://meinigar.online/api/urls")
      .then((res) => {
        setStoredUrls(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const filteredUrls = storedUrls.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      (item.channelName && item.channelName.toLowerCase().includes(query)) ||
      (item.url && item.url.toLowerCase().includes(query)) ||
      (item.date && item.date.toLowerCase().includes(query))
    );
  });

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
        <Box
          sx={{
            width: "98%",
            display: "flex",
            backgroundColor: "#014F66",
            padding: 2,
            borderRadius: 2,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            my: 2,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            {/* <TextField
              name="channelName"
              size="small"
              placeholder="Channel Name"
              sx={{ width: { sm: "100%", lg: "25%" } }}
              value={formData.channelName}
              onChange={handleChange}
            /> */}
            <TextField
              name="url"
              size="small"
              placeholder="Video URL"
              value={formData.url}
              onChange={handleChange}
              error={formData.url !== "" && !isValidUrl(formData.url)}
              helperText={
                formData.url !== "" && !isValidUrl(formData.url)
                  ? "Enter a valid URL."
                  : ""
              }
              sx={{
                width: { sm: "100%", lg: "30%" },
                backgroundColor: "#015a75", // Slightly lighter than #014F66 for input contrast
                borderRadius: 2,
                input: {
                  color: "#ffffff",
                  padding: "10px",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.25)",
                  },
                  "&:hover fieldset": {
                    borderColor: "#ffffff",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#ffffff",
                    borderWidth: "1.5px",
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "#cce7f0", // Soft placeholder contrast
                  opacity: 1,
                },
                "& .MuiFormHelperText-root": {
                  color: "#ffb3b3", // Error color
                },
                "& .MuiInputLabel-root": {
                  color: "#cce7f0",
                },
                boxShadow: "inset 0 0 6px rgba(255, 255, 255, 0.05)",
              }}
              InputProps={{
                style: {
                  color: "#fff",
                },
              }}
            />



            {/* <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={handleDateChange}
              sx={{ width: { sm: "100%", lg: "25%" } }}
              slotProps={{
                textField: { variant: "outlined", size: "small" }
              }}
            /> */}
          </LocalizationProvider>
          <Button
            variant="contained"
            disabled={
              // !formData.channelName ||
              !formData.url ||
              // !formData.date ||
              !isValidUrl(formData.url)
            }
            onClick={handleSubmitVideo}
            sx={{ width: { sm: "100%", lg: "20%" } }}
          >
            Submit
          </Button>
        </Box>

        <Typography
          variant="h5"
          fontWeight={600}
          textAlign="left"
          sx={{ width: "98%", mt: 2 }}
        >
          Search Stored URLs
        </Typography>

        <Box
          sx={{
            width: "98%",
            display: "flex",
            my: 2,
            gap: 2,
            justifyContent: "center"
          }}
        >
          <TextField
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Channel, URL, or Date"
            sx={{ width: { sm: "95%", lg: "95%" }, mt: 2 }}
          />
          <Button
            variant="contained"
            sx={{ height: 40, mt: 2 }}
            onClick={handleClearSearch}
          >
            Clear
          </Button>
        </Box>

        <Box
          sx={{
            width: "98%",
            display: "flex",
            flexDirection: "column",
            my: 2,
            gap: 2,
            justifyContent: "center"
          }}
        >
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ textAlign: "left" }}
          >
            Stored URLs
          </Typography>
          <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, mt: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#014F66" }}>
                <TableRow>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Channel Name</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>URL</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Date</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUrls.map((item, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      backgroundColor: "rgba(1, 96, 127, 0.6)",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "rgba(1, 96, 127, 0.8)",
                      },
                    }}
                  >
                    <TableCell sx={{ color: "#fff" }}>{item?.channelName}</TableCell>
                    <TableCell sx={{ color: "#fff" }}>{item?.url}</TableCell>
                    <TableCell sx={{ color: "#fff" }}>{item?.date}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteUrl(item.id)}
                        sx={{
                          borderColor: "#fff",
                          color: "#fff",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.15)",
                            borderColor: "#fff",
                          },
                        }}
                      >
                        Stop Tracking
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </>
  );
};