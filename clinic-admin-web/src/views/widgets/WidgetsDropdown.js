import React, { useEffect, useMemo, useState } from 'react'
import {
  CRow,
  CCol,
  CWidgetStatsA,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
  CCard,
  CCardBody,
  CFormSelect,
  CFormInput,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilOptions } from '@coreui/icons'
import { getStyle } from '@coreui/utils'
import { CChartLine } from '@coreui/react-chartjs'
import Pagination from '../../Utils/Pagination'
import { aptData } from '../AppointmentManagement/appointmnetData'
import { useHospital } from '../Usecontext/HospitalContext'
import SlotModal from '../NGK/Widget/SlotModal'
import ClinicSlotManager from '../NGK/Widget/SlotModal'
import AdCarousel from './AdCarousel'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
import DermaCareLogo from '../../assets/images/logoP.png'
import axios from 'axios'
import { BASE_URL } from '../../baseUrl'
import { showCustomToast } from '../../Utils/Toaster'
import ConfirmationModal from '../../components/ConfirmationModal'
import { ToastContainer } from 'react-toastify'
import { http } from '../../Utils/Interceptors'
const WidgetsDropdown = () => {
  const navigate = useNavigate()
  const today = new Date().toISOString().split('T')[0]
  const [filterTypes, setFilterTypes] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [selectedDate, setSelectedDate] = useState()
  const { selectedHospital } = useHospital()
  const [showSlotsModal, setShowSlotsModal] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const { searchQuery } = useGlobalSearch()
  const [showDoctorsModal, setShowDoctorsModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [pendingStatusChange, setPendingStatusChange] = useState(null)
  // { bookingId, newStatus }
  const [typeFilter, setTypeFilter] = useState('ALL')
  // ALL | PACKAGE | PROCEDURE

  // Toggle filter (Pending / Completed)
  const toggleFilter = (status) => {
    setFilterTypes(filterTypes.includes(status) ? [] : [status])
  }
  const filteredAppointments = aptData.filter((item) => {
    const isDateMatch = selectedDate ? item.serviceDate === selectedDate : true
    const isStatusMatch = filterTypes.length === 0 ? true : filterTypes.includes(item.status)

    return isDateMatch && isStatusMatch
  })
  const filteredDoctors = selectedHospital?.data?.doctorsList?.filter(
    (doctor) =>
      doctor.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.associationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.associationNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Apply Status Filter
  // const filteredAppointments = aptData.filter((item) => {
  //   if (filterTypes.length === 0) return true
  //   return filterTypes.includes(item.status)
  // })
  const pendingCount = aptData.filter((item) => item.status.toLowerCase() === 'pending').length
  const confirmedCount = appointments.filter((item) => item.status === 'CONFIRMED').length

  const finalFiltered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()

    return appointments.filter((item) => {
      const matchesSearch =
        !q || Object.values(item).some((val) => String(val).toLowerCase().includes(q))

      const matchesDate = selectedDate ? item.appointmentDate === selectedDate : true

      const matchesStatus = filterTypes.length === 0 ? true : filterTypes.includes(item.status)

      const matchesType = typeFilter === 'ALL' ? true : item.serviceType === typeFilter

      return matchesSearch && matchesDate && matchesStatus && matchesType
    })
  }, [appointments, searchQuery, selectedDate, filterTypes, typeFilter])

  const displayData = useMemo(
    () => finalFiltered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [finalFiltered, currentPage, pageSize],
  )

  useEffect(() => {
    if (!selectedHospital?.data?.clinicId) return

    const fetchBookings = async () => {
      setLoading(true)
      try {
        const res = await http.get(`${BASE_URL}/bookings/${selectedHospital.data.clinicId}`)

        setAppointments(res.data?.data || [])
      } catch (error) {
        console.error('Failed to fetch bookings', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [selectedHospital])

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await http.put(`${BASE_URL}/bookings/update-status`, {
        bookingId: bookingId,
        status: newStatus,
      })

      // Update UI after success
      setAppointments((prev) =>
        prev.map((item) => (item.bookingId === bookingId ? { ...item, status: newStatus } : item)),
      )
      showCustomToast(`${res.data.message || 'Status updated successfully'}`)
    } catch (error) {
      console.error('Failed to update status', error)
      showCustomToast('Status update failed')
    }
  }
  const handleStatusChange = (bookingId, newStatus) => {
    setPendingStatusChange({ bookingId, newStatus })
    setIsModalVisible(true)
  }
  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return

    const { bookingId, newStatus } = pendingStatusChange

    await updateBookingStatus(bookingId, newStatus)

    setIsModalVisible(false)
    setPendingStatusChange(null)
  }

  const handleCancelStatusChange = () => {
    setIsModalVisible(false)
    setPendingStatusChange(null)
  }

  return (
    <>
      <ToastContainer />
      {/* ----------------------  TOP CARDS ---------------------- */}
      <CRow className="d-flex justify-content-between align-items-start  align-content-center">
        <CCol sm={3} className="mb-2">
          <CWidgetStatsA color="info" value={appointments.length} title="Total Appointments" />
        </CCol>

        <CCol sm={3} className="mb-2">
          <CWidgetStatsA color="success" value={confirmedCount} title="Confirmed Appointments" />
        </CCol>

        <CCol sm={3} className="mb-2">
          <div onClick={() => setShowDoctorsModal(true)} style={{ cursor: 'pointer' }}>
            <CWidgetStatsA
              color="warning"
              value={selectedHospital?.data.doctorsList.length}
              title="Total Doctors"
            />
          </div>
        </CCol>

        <CCol sm={3} className="mb-2">
          <CWidgetStatsA
            title="Management "
            value="Slots"
            color="secondary"
            onClick={() => setShowModal(true)}
            style={{ cursor: 'pointer' }}
          />

          <ClinicSlotManager
            show={showModal}
            setShow={setShowModal}
            clinicId={selectedHospital?.data.clinicId}
          />
        </CCol>
      </CRow>

      {/* ----------------------  AD SPACE ---------------------- */}
      <CCard className="mt-4 text-center border-2 border-dashed rounded">
        <CCardBody>
          <AdCarousel />
        </CCardBody>
      </CCard>

      {/* ----------------------  TODAY APPOINTMENTS ---------------------- */}
      <div className="container mt-4">
        {/* {displayData.length > 0 && ( */}
        <div>
          <h5 className="mb-4">Appointments</h5>

          {/* FILTER BUTTONS */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            {/* LEFT SIDE → FILTER BUTTONS */}
            {/* <div className="d-flex gap-2">
                <CButton
                  style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
                  onClick={() => {
                    setSelectedDate('')
                    setFilterTypes([])
                  }}
                  setSelectedDate
                >
                  All
                </CButton>

                <button
                  onClick={() => toggleFilter('CONFIRMED')}
                  className={`btn ${
                    filterTypes.includes('CONFIRMED') ? 'btn-selected' : 'btn-unselected'
                  }`}
                >
                  Confirmed
                </button>

                <button
                  onClick={() => toggleFilter('COMPLETED')}
                  className={`btn ${
                    filterTypes.includes('COMPLETED') ? 'btn-selected' : 'btn-unselected'
                  }`}
                >
                  Completed
                </button>
              </div> */}
            <div className="d-flex gap-2 flex-wrap">
              {/* STATUS FILTERS */}
              <CButton
                style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
                onClick={() => {
                  setSelectedDate('')
                  setFilterTypes([])
                  setTypeFilter('ALL')
                }}
              >
                All
              </CButton>

              <button
                onClick={() => toggleFilter('CONFIRMED')}
                className={`btn ${
                  filterTypes.includes('CONFIRMED') ? 'btn-selected' : 'btn-unselected'
                }`}
              >
                Confirmed
              </button>

              <button
                onClick={() => toggleFilter('COMPLETED')}
                className={`btn ${
                  filterTypes.includes('COMPLETED') ? 'btn-selected' : 'btn-unselected'
                }`}
              >
                Completed
              </button>

              {/* TYPE FILTERS */}
              <button
                onClick={() => setTypeFilter('PROCEDURE')}
                className={`btn ${typeFilter === 'PROCEDURE' ? 'btn-selected' : 'btn-unselected'}`}
              >
                Procedure
              </button>

              <button
                onClick={() => setTypeFilter('PACKAGE')}
                className={`btn ${typeFilter === 'PACKAGE' ? 'btn-selected' : 'btn-unselected'}`}
              >
                Package
              </button>
            </div>

            {/* RIGHT SIDE → RESULTS + DATE */}
            <div className="d-flex align-items-center gap-3">
              <p className="m-0  " style={{ color: 'var(--color-black)' }}>
                Showing {displayData.length} results
              </p>

              <CFormInput
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  maxWidth: '160px',
                  borderColor: 'var(--color-black)',
                  color: 'var(--color-black)',
                }}
              />
            </div>
          </div>
        </div>
        {/* )} */}

        {/* <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100%',
            backgroundColor: '#fff', // optional
          }}
        >
          <img
            src={DermaCareLogo}
            alt="Loading"
            style={{
              width: '120px',
              animation: 'pulseGlow 1.5s infinite ease-in-out',
            }}
          />
        </div> */}
        <CModal
          visible={showDoctorsModal}
          onClose={() => setShowDoctorsModal(false)}
          size="lg"
          backdrop="static"
          className="custom-modal"
        >
          <CModalHeader closeButton>
            <CModalTitle>Doctors List</CModalTitle>
          </CModalHeader>

          <CModalBody>
            {/* 🔍 Search Box */}
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, registration no, specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* 🩺 Filtered Doctors Table */}
            {filteredDoctors?.length > 0 ? (
              <table className="table table-bordered pink-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Doctor Name</th>
                    <th>Registration No.</th>
                    <th>Specialization</th>
                    <th>Association</th>
                    <th>Association No.</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDoctors.map((doctor, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{doctor.doctorName}</td>
                      <td>{doctor.registrationNumber}</td>
                      <td>{doctor.specialization}</td>
                      <td>{doctor.associationName}</td>
                      <td>{doctor.associationNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center mt-3">No matching doctors found.</p>
            )}
          </CModalBody>

          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowDoctorsModal(false)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>

        {/* TABLE */}
        {loading ? (
          // 🔄 LOADING STATE
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: '300px' }}
          >
            <div className="d-flex justify-content-center align-items-center vh-100">
              <CSpinner size="sm" color="primary" />
            </div>
            {/* <img
              src={DermaCareLogo}
              alt="Loading"
              style={{
                width: '120px',
                animation: 'pulseGlow 1.5s infinite ease-in-out',
              }}
            /> */}
          </div>
        ) : displayData.length === 0 ? (
          // ❌ NO DATA STATE (after loading)
          <div>
            <div colSpan={8} className="text-center py-4 w-100">
              No appointments found
            </div>
          </div>
        ) : (
          <CTable striped hover responsive className="pink-table">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>S.No</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Age</CTableHeaderCell>
                <CTableHeaderCell>Type</CTableHeaderCell>
                <CTableHeaderCell>Service</CTableHeaderCell>
                <CTableHeaderCell>P. Status</CTableHeaderCell>
                <CTableHeaderCell>Date</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {displayData.map((item, index) => (
                <CTableRow key={item.bookingId}>
                  <CTableDataCell>{(currentPage - 1) * pageSize + index + 1}</CTableDataCell>

                  <CTableDataCell>{item.fullName}</CTableDataCell>
                  <CTableDataCell>{item.ageLabel}</CTableDataCell>

                  <CTableDataCell>{item.serviceType}</CTableDataCell>
                  <CTableDataCell>{item.serviceName}</CTableDataCell>
                  <CTableDataCell>{item.paymentStatus}</CTableDataCell>
                  <CTableDataCell>{item.appointmentDate}</CTableDataCell>

                  <CTableDataCell>
                    {item.status === 'CONFIRMED' ? (
                      <CFormSelect
                        size="sm"
                        value={item.status}
                        className="status-inline status-confirmed"
                        onChange={(e) => handleStatusChange(item.bookingId, e.target.value)}
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </CFormSelect>
                    ) : (
                      <span className="status-badge status-completed">COMPLETED</span>
                    )}
                  </CTableDataCell>

                  <CTableDataCell>
                    <CButton
                      size="sm"
                      style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
                      onClick={() =>
                        navigate(`/appointment-details/${item.bookingId}`, {
                          state: { appointment: item },
                        })
                      }
                    >
                      View
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
        <ConfirmationModal
          isVisible={isModalVisible}
          title="Confirm Status Change"
          message="Are you sure you want to mark this appointment as COMPLETED?"
          confirmText="Yes, Mark as Completed"
          cancelText="Cancel"
          confirmColor="success"
          cancelColor="secondary"
          onConfirm={handleConfirmStatusChange}
          onCancel={handleCancelStatusChange}
        />
        {displayData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(finalFiltered.length / pageSize)}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setCurrentPage(1) // reset page on size change
            }}
          />
        )}
      </div>
    </>
  )
}

export default WidgetsDropdown
