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
import ExcelJS from 'exceljs';
import { saveAs } from "file-saver";
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
    await axios.get("https://meinigar.online/api/youtube/all")
      .then((res) => setTableData(res.data))
      .catch((e) => {
        console.error("Error fetching data");
        setTableData([]);
      });
  };

  const fetchSearchData = async () => {
    await axios.get("https://meinigar.online/api/youtube/analytics/search", { params: formData })
      .then((res) => setTableData(res.data))
      .catch((e) => {
        console.error("Error fetching search data");
        setTableData([]);
      });
  };

 const exportToExcel = async () => {
  if (tableData.length === 0) {
    alert("No data to export.");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('YouTube Analytics');

  // Define columns with headers only (no width yet)
  const columns = [
    { header: 'Title', key: 'title' },
    { header: 'Channel', key: 'channelTitle' },
    { header: 'Published Date', key: 'publishedAt' },
    { header: 'Created Date', key: 'createdAt' },
    { header: 'Views', key: 'viewCount' },
    { header: 'Likes', key: 'likeCount' },
    { header: 'Comments', key: 'commentCount' }
  ];

  worksheet.columns = columns;

  // Add rows
  tableData.forEach((row) => {
    worksheet.addRow(row);
  });

  // Auto-fit column widths by calculating max length in each column
  worksheet.columns.forEach((column) => {
    let maxLength = column.header.length;
    column.eachCell?.((cell) => {
      const cellValue = cell.value ? cell.value.toString() : '';
      maxLength = Math.max(maxLength, cellValue.length);
    });
    column.width = maxLength + 2; // Add some padding
  });

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E88E5' }
    };
    cell.alignment = { horizontal: 'center' };
  });

  // Center-align and border all cells
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Download file
  const buffer = await workbook.xlsx.writeBuffer();
  const date = new Date().toISOString().split("T")[0];
  const fileName = `YouTube_Analytics_${date}.xlsx`;
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, fileName);
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
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            my: 2,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TextField
              name="channelTitle"
              size="small"
              placeholder="Search by Channel Name"
              sx={{ width: { sm: "100%", lg: "25%" } }}
              value={formData.channelTitle}
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
        <Button
          variant="contained"
          color="success"
          onClick={exportToExcel}
        >
          Export to Excel
        </Button>
      </Container>
    </>
  )
}