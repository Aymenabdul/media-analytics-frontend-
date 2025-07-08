import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  Container,
  TextField,
  Typography
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
      await axios
        .post("http://wezume.in:8081/api/urls", {
          channelName: formData.channelName,
          url: formData.url,
          date: formData.date
        })
        .then(() => {
          setFormData({ channelName: "", url: "", date: "" });
          setSelectedDate(null);
          handleGetStoredUrls();
        })
        .catch((err) => {
          console.error("Error submitting video:", err);
        });
    };

    const handleGetStoredUrls = async () => {
      await axios
        .get("http://wezume.in:8081/api/urls")
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
              gap: 3,
              my: 2,
              flexWrap: { sm: "wrap", lg: "nowrap" },
              justifyContent: "center"
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TextField
                name="channelName"
                size="small"
                placeholder="Channel Name"
                sx={{ width: { sm: "100%", lg: "25%" } }}
                value={formData.channelName}
                onChange={handleChange}
              />
              <TextField
                name="url"
                size="small"
                placeholder="Video URL"
                sx={{ width: { sm: "100%", lg: "30%" } }}
                value={formData.url}
                onChange={handleChange}
              />
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={handleDateChange}
                sx={{ width: { sm: "100%", lg: "25%" } }}
                slotProps={{
                  textField: { variant: "outlined", size: "small" }
                }}
              />
            </LocalizationProvider>
            <Button
              variant="contained"
              disabled={
                !formData.channelName || !formData.url || !formData.date
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
            <Box
              sx={{
                display: "flex",
                gap: 3,
                flexWrap: "wrap",
                justifyContent: "center"
              }}
            >
              {filteredUrls.map((item, index) => (
                <Card
                  key={index}
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    width: { xs: "100%", sm: "100%", lg: "46%" }
                  }}
                >
                  <Typography variant="body1" fontWeight={500}>
                    {item?.channelName}
                  </Typography>
                  <Typography variant="body2">{item?.url}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {item?.date}
                  </Typography>
                </Card>
              ))}
            </Box>
          </Box>
        </Container>
      </>
    );
};