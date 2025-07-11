import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
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
  Pagination,
  CircularProgress,
  Backdrop
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;

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

  const handleSubmitVideo = async () => {
    if (!formData.url || !isValidUrl(formData.url)) {
      alert("❌ Please provide a valid URL that starts with https://");
      return;
    }

    setIsSubmitting(true);
    try {
      const checkRes = await axios.get("https://meinigar.online/api/urls/check", {
        params: { url: formData.url },
      });

      if (checkRes.data === true) {
        alert("⚠️ This video URL already exists!");
        return;
      }

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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUrl = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this URL?");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await axios.delete(`https://meinigar.online/api/urls/${id}`);
      alert("🗑️ URL deleted successfully!");
      handleGetStoredUrls();
    } catch (err) {
      console.error("Error deleting URL:", err);
      alert("❌ Failed to delete the URL.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGetStoredUrls = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("https://meinigar.online/api/urls");
      setStoredUrls(res.data);
    } catch (err) {
      console.error(err);
      setStoredUrls([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const filteredUrls = storedUrls.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      (item.channelName && item.channelName.toLowerCase().includes(query)) ||
      (item.url && item.url.toLowerCase().includes(query)) ||
      (item.date && item.date.toLowerCase().includes(query))
    );
  });

  const totalPages = Math.ceil(filteredUrls.length / itemsPerPage);

  const paginatedUrls = filteredUrls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Loading screen component
  const LoadingScreen = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: 2
      }}
    >
      <CircularProgress size={60} sx={{ color: '#014F66' }} />
      <Typography variant="h6" color="#014F66" fontWeight={500}>
        Loading stored URLs...
      </Typography>
    </Box>
  );

  // Common text field styles
  const textFieldStyles = {
    backgroundColor: "#015a75",
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
      color: "#cce7f0",
      opacity: 1,
    },
    "& .MuiFormHelperText-root": {
      color: "#ffb3b3",
    },
    "& .MuiInputLabel-root": {
      color: "#cce7f0",
    },
    boxShadow: "inset 0 0 6px rgba(255, 255, 255, 0.05)",
  };

  return (
    <>
      <Navbar />
      
      {/* Loading backdrop for submit and delete operations */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isSubmitting || isDeleting}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress color="inherit" />
          <Typography variant="h6">
            {isSubmitting ? 'Submitting video...' : 'Deleting URL...'}
          </Typography>
        </Box>
      </Backdrop>

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
        {/* Video URL Input Section */}
        <Box
          sx={{
            width: "98%",
            display: "flex",
            backgroundColor: "#014F66",
            padding: 2,
            borderRadius: 2,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            my: 2,
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TextField
              name="url"
              size="small"
              placeholder="Video URL"
              value={formData.url}
              onChange={handleChange}
              disabled={isSubmitting}
              error={formData.url !== "" && !isValidUrl(formData.url)}
              helperText={
                formData.url !== "" && !isValidUrl(formData.url)
                  ? "Enter a valid URL."
                  : ""
              }
              sx={{
                flex: 1,
                minWidth: { xs: "100%", sm: "300px" },
                ...textFieldStyles
              }}
              slotProps={{
                input: {
                  style: {
                    color: "#fff",
                  },
                }
              }}
            />
          </LocalizationProvider>

          <Button
            variant="contained"
            disabled={!formData.url || !isValidUrl(formData.url) || isSubmitting}
            onClick={handleSubmitVideo}
            sx={{
              width: { xs: "100%", sm: "120px" },
              color: "#fff",
              backgroundColor: "#0288d1",
              "&:hover": {
                backgroundColor: "#0277bd",
              },
              "&:disabled": {
                color: "white"
              }
            }}
          >
            {isSubmitting ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={20} color="inherit" />
                Saving...
              </Box>
            ) : (
              "Save"
            )}
          </Button>
        </Box>

        {isLoading ? (
          <LoadingScreen />
        ) : (
          <>
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
                backgroundColor: "#014F66",
                padding: 2,
                borderRadius: 2,
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
                my: 2,
              }}
            >
              <TextField
                size="small"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by Channel, URL, or Date"
                sx={{
                  flex: 1,
                  minWidth: { xs: "100%", sm: "300px" },
                  ...textFieldStyles
                }}
                slotProps={{
                  input: {
                    style: {
                      color: "#fff",
                    },
                  }
                }}
              />
              <Button
                variant="contained"
                sx={{
                  width: { xs: "100%", sm: "120px" },
                  color: "#fff",
                  backgroundColor: "#0288d1",
                  "&:hover": {
                    backgroundColor: "#0277bd",
                  },
                  "&:disabled": {
                    color: "white"
                  }
                }}
                onClick={handleClearSearch}
                disabled={!searchQuery}
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
                Stored URLs ({filteredUrls.length} total)
              </Typography>
              
              {filteredUrls.length === 0 ? (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h6" color="textSecondary">
                    {searchQuery ? 'No URLs found matching your search.' : 'No URLs stored yet.'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {searchQuery ? 'Try a different search term.' : 'Add a YouTube URL above to get started.'}
                  </Typography>
                </Box>
              ) : (
                <>
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
                        {paginatedUrls.map((item, index) => (
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
                            <TableCell sx={{ color: "#fff", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {item?.url}
                            </TableCell>
                            <TableCell sx={{ color: "#fff" }}>{item?.date}</TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                color="error"
                                onClick={() => handleDeleteUrl(item.id)}
                                disabled={isDeleting}
                                sx={{
                                  borderColor: "#fff",
                                  color: "#fff",
                                  "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                                    borderColor: "#fff",
                                  },
                                  "&:disabled": {
                                    borderColor: "#999",
                                    color: "#999",
                                  },
                                }}
                              >
                                {isDeleting ? "Deleting..." : "Stop Tracking"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination + Page Info */}
                  <Box display="flex" flexDirection="column" alignItems="center" my={2}>
                    <Typography variant="body2" color="textSecondary" mb={1}>
                      Page {currentPage} of {totalPages} ({filteredUrls.length} total items)
                    </Typography>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(e, value) => setCurrentPage(value)}
                      color="primary"
                    />
                  </Box>
                </>
              )}
            </Box>
          </>
        )}
      </Container>

      {/* Footer */}
      <Box
        sx={{
          width: "100%",
          textAlign: "center",
          py: 2,
          backgroundColor: "yellow",
          color: "black",
          fontSize: "0.875rem"
        }}
      >
        Powered by{" "}
        <a
          href="http://dataemperor.in/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "black", textDecoration: "underline" }}
        >
          DataEmperor
        </a>
      </Box>
    </>
  );
}