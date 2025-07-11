import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  Typography
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";
import ExcelJS from "exceljs";
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
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

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
    await axios
      .get("https://meinigar.online/api/youtube/all")
      .then((res) => setTableData(res.data))
      .catch(() => {
        setTableData([]);
      });
  };

  const fetchSearchData = async () => {
    await axios
      .get("https://meinigar.online/api/youtube/analytics/search", { params: formData })
      .then((res) => setTableData(res.data))
      .catch(() => {
        setTableData([]);
      });
  };

  const exportToExcel = async () => {
    if (tableData.length === 0) {
      alert("No data to export.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("YouTube Analytics");

    const columns = [
      { header: "Title", key: "title" },
      { header: "Channel", key: "channelTitle" },
      { header: "Published Date", key: "publishedAt" },
      { header: "Created Date", key: "createdAt" },
      { header: "Views", key: "viewCount" },
      { header: "Likes", key: "likeCount" },
      { header: "Comments", key: "commentCount" }
    ];

    worksheet.columns = columns;

    tableData.forEach((row) => {
      worksheet.addRow(row);
    });

    worksheet.columns.forEach((column) => {
      let maxLength = column.header.length;
      column.eachCell?.((cell) => {
        const cellValue = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = maxLength + 2;
    });

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E88E5" }
      };
      cell.alignment = { horizontal: "center" };
    });

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const date = new Date().toISOString().split("T")[0];
    const fileName = `YouTube_Analytics_${date}.xlsx`;
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    saveAs(blob, fileName);
  };

  const handleSort = (column) => {
    const isAsc = sortColumn === column && sortDirection === "asc";
    setSortColumn(column);
    setSortDirection(isAsc ? "desc" : "asc");

    const sorted = [...tableData].sort((a, b) => {
      const valA = typeof a[column] === "string" ? a[column].toLowerCase() : Number(a[column]);
      const valB = typeof b[column] === "string" ? b[column].toLowerCase() : Number(b[column]);
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setTableData(sorted);
  };

  const renderSortArrow = (column) => {
    if (sortColumn === column) {
      return sortDirection === "asc" ? "▲" : "▼";
    }
    return "▲";
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
        <Typography variant="h5" fontWeight={600} textAlign="left" sx={{ mb: 2, width: "98%" }}>
          Search YouTube Analytics
        </Typography>
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
          <Button variant="contained" onClick={fetchSearchData}>
            Search
          </Button>
          <Button variant="contained" sx={{ bgcolor: "gray" }} onClick={clearSearch}>
            Clear
          </Button>
        </Box>
        <Box sx={{ width: "100%", my: 2 }}>
          <TableContainer
            component={Paper}
            elevation={3}
            sx={{
              borderRadius: 2,
              width: "100%",
              overflowX: "auto",
              maxHeight: 600,
            }}
          >
            <Table stickyHeader sx={{ minWidth: 800, width: "100%" }}>
              <TableHead>
                <TableRow>
                  {[
                    { label: "Title", width: "20%" },
                    { label: "Channel", sortable: "channelTitle", align: "center" },
                    { label: "Published" },
                    { label: "Created", width: "10%" },
                    { label: "Views", sortable: "viewCount" },
                    { label: "Likes", sortable: "likeCount" },
                    { label: "Comments", sortable: "commentCount", align: "center" }
                  ].map((cell, idx) => (
                    <TableCell
                      key={idx}
                      onClick={cell.sortable ? () => handleSort(cell.sortable) : undefined}
                      align={cell.align || "left"}
                      sx={{
                        fontWeight: "600",
                        fontSize: "18px",
                        color: "#fff",
                        whiteSpace: "nowrap",
                        cursor: cell.sortable ? "pointer" : "default",
                        backgroundColor: "rgba(106, 201, 232, 0.6)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                        width: cell.width || "auto", // Custom width
                      }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent={cell.align === "center" ? "center" : "flex-start"}
                        gap={0.5}
                      >
                        {cell.label} {cell.sortable && renderSortArrow(cell.sortable)}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {tableData?.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                      "&:hover": { backgroundColor: "#e3f2fd" },
                      transition: "background-color 0.3s",
                    }}
                  >
                    <TableCell sx={{ width: "10%" }}>{row?.title}</TableCell>
                    <TableCell align="center">{row?.channelTitle}</TableCell>
                    <TableCell>{row?.publishedAt}</TableCell>
                    <TableCell sx={{ width: "18%" }}>{row?.createdAt}</TableCell>
                    <TableCell>{row?.viewCount}</TableCell>
                    <TableCell>{row?.likeCount}</TableCell>
                    <TableCell align="center">{row?.commentCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>



        </Box>
        <Button variant="contained" color="success" onClick={exportToExcel}>
          Export to Excel
        </Button>
      </Container>
    </>
  );
}
