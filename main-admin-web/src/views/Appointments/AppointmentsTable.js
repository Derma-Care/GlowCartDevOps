import React, { useEffect, useState } from "react";
import {
  CButton,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CFormInput,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CNav,
  CNavItem,
  CNavLink, CCard, CCardBody
} from "@coreui/react";

import { useNavigate, useParams } from "react-router-dom";
import { getAppointmentsByBookingId, updateAppointmentStatus } from "./AppointmentsApis";
import { showCustomToast } from "../../Utils/Toaster";
import LoadingIndicator from "../../Utils/loader";

const centeredMessageStyle = {
  textAlign: "center",
  padding: "40px 0",
  fontWeight: 600,
  color: "#6c757d"
};

const AppointmentsTable = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    if (!bookingId) return;
    fetchAppointments();
  }, [bookingId]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { success, message, data } = await getAppointmentsByBookingId(bookingId);

      if (!success) {
        showCustomToast(message);
      }

      setAppointments(success ? data : []);

    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (item) => {
    navigate(`/appointment-details/${item.id}`, { state: item });
  };

  const handleStatusChange = (item, newStatus) => {
    if (item.status === newStatus) return;
    setSelectedItem(item);
    setSelectedStatus(newStatus);
    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      setUpdatingId(selectedItem.id);

      const { success, message } = await updateAppointmentStatus(
        selectedItem.bookingId,
        selectedStatus
      );

      showCustomToast(message);

      if (success) {
        await fetchAppointments();
      }

    } catch (err) {
      showCustomToast(err.message || "Something went wrong");
    } finally {
      setUpdatingId(null);
      setShowConfirmModal(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "CONFIRMED": return { backgroundColor: "#CCE5FF", color: "#084298" };
      case "COMPLETED": return { backgroundColor: "#B5E5CF", color: "#0F5132" };
      case "HOLD": return { backgroundColor: "#F8D7DA", color: "#842029" };
      default: return { backgroundColor: "#E2E3E5", color: "#41464b" };
    }
  };

  const filteredData = appointments.filter(item => {
    const matchesFilter = filter === "ALL" || item.status === filter;
    const q = search.toLowerCase();
    return matchesFilter && (
      item.fullName?.toLowerCase().includes(q) ||
      item.serviceName?.toLowerCase().includes(q) ||
      item.serviceType?.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, rowsPerPage]);

  return (
    <div className="p-3">

      {/* TABS */}
      <CNav variant="tabs" className="mb-0">
        {["ALL", "CONFIRMED", "COMPLETED", "HOLD"].map(status => (
          <CNavItem key={status}>
            <CNavLink
              active={filter === status}
              onClick={() => {
                setFilter(status);
                setCurrentPage(1);
              }}
              style={{ cursor: "pointer" }}
            >
              {status}
            </CNavLink>
          </CNavItem>
        ))}

        <div className="ms-auto p-2">
          <CFormInput
            placeholder="Search..."
            style={{ width: "250px" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CNav>

      {/* CARD STARTS BELOW THE TABS */}
      <CCard className="mt-2 shadow-sm border-0">
        <CCardBody>

          {loading ? (
            <CTable striped hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell colSpan={8} className="text-center">
                    <LoadingIndicator message="Loading appointment data..." />
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
            </CTable>
          ) : error ? (
            <div style={centeredMessageStyle}>{error}</div>
          ) : filteredData.length === 0 ? (
            <div style={centeredMessageStyle}>No data found</div>
          ) : (
            <>
              <CTable striped hover responsive>
                <CTableHead className="pink-table">
                  <CTableRow className="text-center">
                    <CTableHeaderCell>S.No</CTableHeaderCell>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Age</CTableHeaderCell>
                    <CTableHeaderCell>Type</CTableHeaderCell>
                    <CTableHeaderCell>Service</CTableHeaderCell>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody className="pink-table">
                  {currentRows.map((item, index) => (
                    <CTableRow key={item.id} className="text-center align-middle">
                      <CTableDataCell>{indexOfFirstRow + index + 1}</CTableDataCell>
                      <CTableDataCell>{item.fullName}</CTableDataCell>
                      <CTableDataCell>{item.ageLabel}</CTableDataCell>
                      <CTableDataCell>{item.serviceType}</CTableDataCell>
                      <CTableDataCell>{item.serviceName}</CTableDataCell>
                      <CTableDataCell>{item.appointmentDate}</CTableDataCell>
                      <CTableDataCell>
                        {item.status === "COMPLETED" ? (
                          <div
                            style={{
                              width: "140px",
                              textAlign: "center",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "1px solid #bfc2c7",
                              backgroundColor: "#e5e7eb", // light gray
                              color: "#6b7280", // darker gray text
                              fontWeight: 600,
                              fontSize: "13px",
                              display: "inline-block",
                              cursor: "not-allowed"
                            }}
                          >
                            COMPLETED
                          </div>


                        ) : (
                          <select
                            value={item.status}
                            disabled={updatingId === item.id}
                            onChange={(e) => handleStatusChange(item, e.target.value)}
                            style={{
                              ...getStatusStyle(item.status),
                              width: "140px",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "1px solid #ced4da",
                              fontWeight: 600,
                              fontSize: "13px",
                              cursor: "pointer",
                              textAlign: "center"
                            }}
                          >
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="HOLD">HOLD</option>
                          </select>
                        )}
                      </CTableDataCell>



                      <CTableDataCell>
                        <CButton className="actionBtn"
                          title="View" onClick={() => openDetails(item)}>
                          View
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="fw-bold">Showing {filteredData.length} results</div>

                <div className="d-flex align-items-center gap-3">
                  <select
                    className="form-select form-select-sm"
                    style={{ width: "70px" }}
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                  </select>

                  <div className="d-flex align-items-center gap-2">
                    <CButton size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(prev => prev - 1)}>Prev</CButton>
                    <span className="fw-bold">Page {currentPage} of {totalPages}</span>
                    <CButton size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</CButton>
                  </div>
                </div>
              </div>
            </>
          )}

        </CCardBody>
      </CCard>

      {/* Confirmation Modal */}
      <CModal visible={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <CModalHeader>
          <CModalTitle>Confirm Status Update</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Change status to <strong>{selectedStatus}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleConfirmUpdate} disabled={updatingId !== null}>
            Confirm
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );

};

export default AppointmentsTable;
