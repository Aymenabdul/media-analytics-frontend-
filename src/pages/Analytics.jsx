import { useEffect, useState } from "react";
import axios from "axios";
import {
    Box,
    Button,
    Container,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";
import Navbar from "../components/Navbar";


export default function Analytics() {
    const [selectedFromDate, setSelectedFromDate] = useState(null);
    const [selectedToDate, setSelectedToDate] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        createdAtFrom: "",
        createdAtTo: ""
    });
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
      fetchAllData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFromDateChange = (newValue) => {
      setSelectedFromDate(newValue);
      setFormData((prev) => ({
        ...prev,
        createdAtFrom: newValue ? format(newValue, "yyyy-MM-dd") : ""
      }));
    };

    const handleToDateChange = (newValue) => {
      setSelectedToDate(newValue);
      setFormData((prev) => ({
        ...prev,
        createdAtTo: newValue ? format(newValue, "yyyy-MM-dd") : "" 
      }));
    };

    const clearSearch = () => {
      setFormData({ title: "", createdAtFrom: "", createdAtTo: "" });  
      setSelectedFromDate(null);
      setSelectedToDate(null);  
      fetchAllData();
    };


    const fetchAllData = async () => {
        await axios.get("http://wezume.in:8081/api/youtube/all")
        .then((res) => setTableData(res.data))
        .catch((e) => {
          console.error("Error fetching data");
          setTableData([]);
        });
    };

    const fetchSearchData = async () => {
        await axios.get("http://wezume.in:8081/api/youtube/analytics/search", { params: formData })
        .then((res) => setTableData(res.data))
        .catch((e) => {
          console.error("Error fetching search data");
          setTableData([]);
        });
    };

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
                          name="title"
                          size="small"
                          placeholder="Search by title"
                          sx={{ width: { sm: "100%", lg: "25%" } }}
                          value={formData.title}
                          onChange={handleChange}
                        />
                        <DatePicker
                          label="Select From Date"
                          value={selectedFromDate}
                          onChange={handleFromDateChange}
                          sx={{ width: { sm: "100%", lg: "25%" } }}
                          slotProps={{
                            textField: { variant: "outlined", size: "small" }
                          }}
                        />
                        <DatePicker
                          label="Select To Date"
                          value={selectedToDate}
                          onChange={handleToDateChange}
                          sx={{ width: { sm: "100%", lg: "25%" } }}
                          slotProps={{
                            textField: { variant: "outlined", size: "small" }
                          }}
                        />
                    </LocalizationProvider>
                    <Button variant="contained" onClick={fetchSearchData}>Search</Button>
                    <Button variant="contained" sx={{ bgcolor: "gray" }} onClick={clearSearch}>Clear</Button>
                </Box>
                <Box sx={{ width: "98%", my: 2 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Channel</TableCell>
                                    <TableCell>Published</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell>Views</TableCell>
                                    <TableCell>Likes</TableCell>
                                    <TableCell>Comments</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tableData?.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row?.title}</TableCell>
                                        <TableCell>{row?.channelTitle}</TableCell>
                                        <TableCell>{row?.publishedAt}</TableCell>
                                        <TableCell>{row?.createdAt}</TableCell>
                                        <TableCell>{row?.viewCount}</TableCell>
                                        <TableCell>{row?.likeCount}</TableCell>
                                        <TableCell align="center">{row?.commentCount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Container>
        </>
    )
}