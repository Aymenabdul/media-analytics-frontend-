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
  Typography,
  TablePagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel
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
    channelTitle: "",
    createdAtFrom: "",
    createdAtTo: ""
  });
  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
    setFormData({ title: "", channelTitle: "", createdAtFrom: "", createdAtTo: "" });
    setSelectedFromDate(null);
    setSelectedToDate(null);
    setPage(0);
    setSortColumn(null);
    setSortDirection("asc");
    fetchAllData();
  };

  const fetchAllData = async () => {
    await axios
      .get("https://meinigar.online/api/youtube/all")
      .then((res) => {
        setTableData(res.data);
        setOriginalData(res.data);
      })
      .catch(() => {
        setTableData([]);
        setOriginalData([]);
      });
  };

  const fetchSearchData = async () => {
    await axios
      .get("https://meinigar.online/api/youtube/analytics/search", { params: formData })
      .then((res) => {
        setTableData(res.data);
        setOriginalData(res.data);
        setPage(0);
      })
      .catch(() => {
        setTableData([]);
        setOriginalData([]);
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
    const newDirection = isAsc ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(newDirection);

    const sorted = [...tableData].sort((a, b) => {
      let valA = a[column];
      let valB = b[column];

      // Handle different data types
      if (column === "viewCount" || column === "likeCount" || column === "commentCount") {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else if (column === "publishedAt" || column === "createdAt") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else {
        valA = typeof valA === "string" ? valA.toLowerCase() : String(valA).toLowerCase();
        valB = typeof valB === "string" ? valB.toLowerCase() : String(valB).toLowerCase();
      }

      if (valA < valB) return newDirection === "asc" ? -1 : 1;
      if (valA > valB) return newDirection === "asc" ? 1 : -1;
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

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get current page data
  const paginatedData = tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
        
        {/* Search Bar Container with New Background Color */}
        <Box
          sx={{
            width: "96%",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            my: 2,
            p: 3,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#a6dff1",
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TextField
              name="title"
              size="small"
              placeholder="Search by Title"
              sx={{ width: { sm: "100%", lg: "20%" } }}
              value={formData.title}
              onChange={handleChange}
            />
            <TextField
              name="channelTitle"
              size="small"
              placeholder="Search by Channel Name"
              sx={{ width: { sm: "100%", lg: "20%" } }}
              value={formData.channelTitle}
              onChange={handleChange}
            />
            <DatePicker
              label="Select From Date"
              value={selectedFromDate}
              onChange={handleFromDateChange}
              sx={{ width: { sm: "100%", lg: "20%" } }}
              slotProps={{
                textField: { variant: "outlined", size: "small" }
              }}
            />
            <DatePicker
              label="Select To Date"
              value={selectedToDate}
              onChange={handleToDateChange}
              sx={{ width: { sm: "100%", lg: "20%" } }}
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

        {/* Table Container */}
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
                    { label: "Title", sortable: "title", width: "25%" },
                    { label: "Channel", sortable: "channelTitle", align: "center", width: "15%" },
                    { label: "Published", sortable: "publishedAt", width: "12%" },
                    { label: "Created", sortable: "createdAt", width: "12%" },
                    { label: "Views", sortable: "viewCount", width: "12%" },
                    { label: "Likes", sortable: "likeCount", width: "12%" },
                    { label: "Comments", sortable: "commentCount", align: "center", width: "12%" }
                  ].map((cell, idx) => (
                    <TableCell
                      key={idx}
                      onClick={() => handleSort(cell.sortable)}
                      align={cell.align || "left"}
                      sx={{
                        fontWeight: "600",
                        fontSize: "16px",
                        color: "#fff",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        backgroundColor: "rgba(106, 201, 232, 0.6)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                        width: cell.width || "auto",
                        "&:hover": {
                          backgroundColor: "rgba(106, 201, 232, 0.8)",
                        }
                      }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent={cell.align === "center" ? "center" : "flex-start"}
                        gap={0.5}
                      >
                        {cell.label} {renderSortArrow(cell.sortable)}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedData?.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                      "&:hover": { backgroundColor: "#e3f2fd" },
                      transition: "background-color 0.3s",
                    }}
                  >
                    <TableCell sx={{ 
                      maxWidth: "200px", 
                      overflow: "hidden", 
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {row?.title}
                    </TableCell>
                    <TableCell align="center">{row?.channelTitle}</TableCell>
                    <TableCell align="center">
                      {row?.publishedAt ? new Date(row.publishedAt).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell align="center">
                      {row?.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell align="center">{row?.viewCount?.toLocaleString() || 0}</TableCell>
                    <TableCell align="center">{row?.likeCount?.toLocaleString() || 0}</TableCell>
                    <TableCell align="center">{row?.commentCount?.toLocaleString() || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={tableData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              backgroundColor: "#f5f5f5",
              borderRadius: "0 0 8px 8px",
              "& .MuiTablePagination-toolbar": {
                padding: "12px 16px",
              },
              "& .MuiTablePagination-selectLabel": {
                fontWeight: 500,
              },
              "& .MuiTablePagination-displayedRows": {
                fontWeight: 500,
              }
            }}
          />
        </Box>

        {/* Export Button */}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button variant="contained" color="success" onClick={exportToExcel}>
            Export to Excel
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center" }}>
            Total Records: {tableData.length}
          </Typography>
        </Box>
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