import React, { useMemo, useState } from 'react'
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

  const finalFiltered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()

    return aptData.filter((item) => {
      // Search filter
      const matchesSearch =
        !q || Object.values(item).some((val) => String(val).toLowerCase().includes(q))

      // Date filter
      const matchesDate = selectedDate ? item.serviceDate === selectedDate : true

      // Status filter
      const matchesStatus = filterTypes.length === 0 ? true : filterTypes.includes(item.status)

      return matchesSearch && matchesDate && matchesStatus
    })
  }, [searchQuery, selectedDate, filterTypes])

  const displayData = useMemo(
    () => finalFiltered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [finalFiltered, currentPage, pageSize],
  )

  return (
    <>
      {/* ----------------------  TOP CARDS ---------------------- */}
      <CRow className="d-flex justify-content-between align-items-start  align-content-center">
        <CCol sm={3} className="mb-2">
          <CWidgetStatsA color="info" value={aptData.length} title="Total Appointments" />
        </CCol>

        <CCol sm={3} className="mb-2">
          <CWidgetStatsA color="success" value={pendingCount} title="Pending Appointments" />
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

          <ClinicSlotManager show={showModal} setShow={setShowModal} />
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
        <h5 className="mb-4">Appointments</h5>

        {/* FILTER BUTTONS */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          {/* LEFT SIDE → FILTER BUTTONS */}
          <div className="d-flex gap-2">
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
              onClick={() => toggleFilter('Pending')}
              className={`btn ${filterTypes.includes('Pending') ? 'btn-selected' : 'btn-unselected'}`}
            >
              Pending
            </button>

            <button
              onClick={() => toggleFilter('Completed')}
              className={`btn ${
                filterTypes.includes('Completed') ? 'btn-selected' : 'btn-unselected'
              }`}
            >
              Completed
            </button>
          </div>

          {/* RIGHT SIDE → RESULTS + DATE */}
          <div className="d-flex align-items-center gap-3">
            <p className="m-0  " style={{ color: 'var(--color-black)' }}>
              Showing {filteredAppointments.length} results
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
          <CModalHeader>
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
        {displayData.length === 0 ? (
          <CTableRow
            className="d-flex justify-content-center"
            style={{ color: 'var(--color-black)' }}
          >
            <CTableDataCell colSpan={8} className="text-center py-4">
              No appointments found
            </CTableDataCell>
          </CTableRow>
        ) : (
          <CTable striped hover responsive className="pink-table">
            <CTableHead>
              <CTableRow>
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

            <CTableBody>
              {displayData
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((item, index) => (
                  <CTableRow key={item.bookingId}>
                    <CTableDataCell>{(currentPage - 1) * pageSize + index + 1}</CTableDataCell>
                    <CTableDataCell>{item.patientName}</CTableDataCell>
                    <CTableDataCell>{item.patientAge} Yrs</CTableDataCell>
                    <CTableDataCell>{item.service.type}</CTableDataCell>
                    <CTableDataCell>{item.service.serviceName}</CTableDataCell>
                    <CTableDataCell>{item.serviceDate}</CTableDataCell>

                    <CTableDataCell>
                      <CFormSelect
                        size="sm"
                        value={item.status}
                        onChange={(e) => {
                          item.status = e.target.value
                          // If you want re-render: update state
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                      </CFormSelect>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
                        size="sm"
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

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(displayData.length / pageSize)}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </>
  )
}

export default WidgetsDropdown
