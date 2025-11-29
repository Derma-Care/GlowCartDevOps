import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  CRow,
  CCol,
  CWidgetStatsA,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CCarousel,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
  CCard,
  CCardBody,
  CBadge,
  CFormCheck,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import Slider from 'react-slick'
import { getStyle } from '@coreui/utils'
import { CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilOptions } from '@coreui/icons'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import axios from 'axios'

import { COLORS } from '../../Constant/Themes'
import './Widget.css'
import LoadingIndicator from '../../Utils/loader'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
import { http } from '../../Utils/Interceptors'
import Pagination from '../../Utils/Pagination'
import { useHospital } from '../Usecontext/HospitalContext'

const WidgetsDropdown = (props) => {
  const [slides, setSlides] = useState([])
  const sliderRef = useRef(null)
  const currentIndex = useRef(0)
  const intervalRef = useRef(null)

  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)
  const widgetChartRef3 = useRef(null)
  const [todayBookings, setTodayBookings] = useState([])
  const [totalAppointmentsCount, setTotalAppointmentsCount] = useState(0) // NEW: State to hold total appointments count
  const [totalDoctorsCount, setTotalDoctorsCount] = useState(0) // NEW: State to hold total appointments count

  const [loadingAppointments, setLoadingAppointments] = useState(true) // New state for loading indicator
  const [appointmentError, setAppointmentError] = useState(null) // New state for appointment fetch error

  const { searchQuery } = useGlobalSearch()

  const [filterTypes, setFilterTypes] = useState([])
  const [statusFilters, setStatusFilters] = useState([])

  const [inprogressApt, setInprogressApt] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const statusLabelMap = {
    'In-Progress': 'Active',
    Completed: 'Completed',
    Pending: 'Pending',
    Rejected: 'Rejected',
    Confirmed: 'Confirmed',
  }

  const { fetchPermissions } = useHospital()
  useEffect(() => {
    fetchPermissions()
  }, [])

  const navigate = useNavigate()
  const toggleFilter = (type) => {
    if (filterTypes.includes(type)) {
      // setFilterTypes(filterTypes.filter((t) => t !== type))// multiple selections.
      setFilterTypes([]) //one selection at a time
    } else {
      setFilterTypes([type]) //one selection at a time
      // setFilterTypes([...filterTypes, type])// multiple selections.
    }
  }
  const convertToISODate = useCallback((dateString) => {
    if (!dateString) return ''

    let date
    // Check if dateString is already in YYYY-MM-DD format (preferred)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      date = new Date(dateString)
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      // dd-MM-yyyy format
      const [day, month, year] = dateString.split('-')
      date = new Date(`${year}-${month}-${day}`)
    } else {
      // Attempt to parse other formats, though YYYY-MM-DD or dd-MM-yyyy are safer
      date = new Date(dateString)
    }

    if (isNaN(date.getTime())) {
      // Use getTime() for robust NaN check
      // console.warn('Invalid date string for conversion:', dateString)
      return ''
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }, [])

  const normalize = (str) => (str ? str.toString().toLowerCase().trim() : '')

  // Get today's date in YYYY-MM-DD format, using a consistent method
  const todayISO = new Date().toISOString().split('T')[0]

  return (
    <>
      {/*to display cards*/}
      <CRow className={props.className} xs={{ gutter: 4 }}>
        <CCol sm={6} xl={4}>
          <CWidgetStatsA
            color="info"
            value={totalAppointmentsCount}
            title="Total Appointments"
            action={
              <CDropdown alignment="end">
                <CDropdownToggle color="transparent" caret={false} className="p-0">
                  <CIcon icon={cilOptions} className="text-high-emphasis-inverse" />
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem onClick={() => navigate('/appointment-management')}>
                    View All Appointments
                  </CDropdownItem>{' '}
                  {/* Link to your appointments page */}
                  <CDropdownItem>Export</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            }
            chart={
              <CChartLine
                ref={widgetChartRef1}
                className="mt-3 mx-3"
                style={{ height: '70px' }}
                data={{
                  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                  datasets: [
                    {
                      label: 'Appointments',
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(255,255,255,.55)',
                      pointBackgroundColor: getStyle('--cui-primary'),
                      data: [30, 50, 40, 60, 55, 65, 70],
                    },
                  ],
                }}
                options={{
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false,
                  scales: { x: { display: false }, y: { display: false } },
                  elements: { line: { tension: 0.4 }, point: { radius: 0 } },
                }}
              />
            }
          />
        </CCol>

        <CCol sm={6} xl={4}>
          <CWidgetStatsA
            color="success"
            value={totalAppointmentsCount}
            title="Total Patients"
            action={
              <CDropdown alignment="end">
                <CDropdownToggle color="transparent" caret={false} className="p-0">
                  <CIcon icon={cilOptions} className="text-high-emphasis-inverse" />
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem>View</CDropdownItem>
                  <CDropdownItem>Export</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            }
            chart={
              <CChartLine
                ref={widgetChartRef2}
                className="mt-3 mx-3"
                style={{ height: '70px' }}
                data={{
                  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                  datasets: [
                    {
                      label: 'Patients',
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(255,255,255,.55)',
                      pointBackgroundColor: getStyle('--cui-success'),
                      data: [100, 150, 130, 180, 170, 190, 200],
                    },
                  ],
                }}
                options={{
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false,
                  scales: { x: { display: false }, y: { display: false } },
                  elements: { line: { tension: 0.4 }, point: { radius: 0 } },
                }}
              />
            }
          />
        </CCol>

        <CCol sm={6} xl={4}>
          <CWidgetStatsA
            color="warning"
            value={totalDoctorsCount}
            title="Total Doctors"
            action={
              <CDropdown alignment="end">
                <CDropdownToggle color="transparent" caret={false} className="p-0">
                  <CIcon icon={cilOptions} className="text-high-emphasis-inverse" />
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem onClick={() => navigate('/employee-management/doctor')}>
                    View All Doctors
                  </CDropdownItem>{' '}
                  <CDropdownItem>Export</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            }
            chart={
              <CChartLine
                ref={widgetChartRef3}
                className="mt-3 mx-3"
                style={{ height: '70px' }}
                data={{
                  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                  datasets: [
                    {
                      label: 'Doctors',
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(255,255,255,.55)',
                      pointBackgroundColor: getStyle('--cui-warning'),
                      data: [10, 12, 13, 15, 14, 16, 17],
                    },
                  ],
                }}
                options={{
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false,
                  scales: { x: { display: false }, y: { display: false } },
                  elements: { line: { tension: 0.4 }, point: { radius: 0 } },
                }}
              />
            }
          />
        </CCol>
      </CRow>

      {/* Carousel Section */}
      <CCard
        className="mt-4 text-center border-2 border-dashed rounded"
        style={{ backgroundColor: 'var(--color-bgcolor)' }}
      >
        <CCardBody className="fw-bold fs-5 " style={{ color: 'var(--color-black)' }}>
          Ad Space
        </CCardBody>
      </CCard>

      {/*to display today Appointments Table */}
      <div className="container mt-4 ">
        <h5 className="mb-4">Today Appointments</h5>
        <div className="row">
          <div className="d-flex justify-content-between align-items-center mb-3">
            {/* Left side buttons */}
            <div className="d-flex gap-2">
              <CButton
                style={{ backgroundColor: 'var(--color-black)', color: COLORS.white }}
                onClick={() => {
                  setSelectedServiceTypes([])
                  setSelectedConsultationTypes([])
                  setFilterTypes([])
                  setStatusFilters([])
                }}
              >
                All
              </CButton>

              <button
                onClick={() => toggleFilter('Pending')}
                className={`btn ${
                  filterTypes.includes('Pending') ? 'btn-selected' : 'btn-unselected'
                }`}
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
          </div>
        </div>

        <CTable striped hover responsive>
          <CTableHead className="pink-table">
            <CTableRow>
              <CTableHeaderCell>S.No</CTableHeaderCell>
              <CTableHeaderCell>Patient File_ID</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              {/* <CTableHeaderCell>Doctor Name</CTableHeaderCell> */}
              {/* <CTableHeaderCell>Consultation Type</CTableHeaderCell> */}
              <CTableHeaderCell>Date</CTableHeaderCell>
              {/* <CTableHeaderCell>Time</CTableHeaderCell> */}
              <CTableHeaderCell>Action</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {!loadingAppointments ? (
              <CTableRow>
                <CTableDataCell
                  colSpan="9"
                  className="text-center"
                  style={{ color: 'var(--color-black)' }}
                >
                  <LoadingIndicator message="Loading appointments..." />
                </CTableDataCell>
              </CTableRow>
            ) : appointmentError ? (
              <CTableRow>
                <CTableDataCell
                  colSpan="9"
                  className="text-center "
                  style={{ color: 'var(--color-black)' }}
                >
                  {appointmentError}
                </CTableDataCell>
              </CTableRow>
            ) : (
              (() => {
                // 1. Filter by status (Confirmed appointments)
                const confirmed = todayBookings.filter(
                  (item) => item.status?.toLowerCase() === 'confirmed',
                )

                // 2. Filter by consultation type
                const filteredByTypes = confirmed.filter((item) => {
                  if (filterTypes.length === 0) {
                    return true
                  }
                  const itemType = item.consultationType?.toLowerCase().trim()
                  return filterTypes.some((type) => {
                    const mappedValues = consultationTypeMap[type]
                    if (Array.isArray(mappedValues)) {
                      return mappedValues.some((val) => itemType === val.toLowerCase().trim())
                    } else {
                      return itemType === mappedValues.toLowerCase().trim()
                    }
                  })
                })

                // 3. Apply global search filter to the result
                const finalFilteredData = filteredByTypes.filter((item) => {
                  if (searchQuery.trim().length < 2) {
                    return true
                  }
                  return Object.values(item).some((val) =>
                    normalize(val).includes(normalize(searchQuery)),
                  )
                })

                // 4. Handle no results found
                if (finalFilteredData.length === 0) {
                  return (
                    <CTableRow>
                      <CTableDataCell
                        colSpan="9"
                        className="text-center"
                        style={{ color: 'var(--color-black)' }}
                      >
                        {searchQuery || filterTypes.length > 0
                          ? 'No appointments match your search and filters.'
                          : 'No appointments for today.'}
                      </CTableDataCell>
                    </CTableRow>
                  )
                }

                // 5. Render the filtered data
                return finalFilteredData
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((item, index) => (
                    <CTableRow key={`${item.id}-${index}`} className="pink-table">
                      <CTableDataCell>{(currentPage - 1) * pageSize + index + 1}</CTableDataCell>
                      <CTableDataCell>{item.patientId}</CTableDataCell>
                      <CTableDataCell>{item.name}</CTableDataCell>
                      {/* <CTableDataCell>{item.doctorName}</CTableDataCell> */}
                      {/* <CTableDataCell>{item.consultationType}</CTableDataCell> */}
                      <CTableDataCell>{item.serviceDate}</CTableDataCell>
                      {/* <CTableDataCell>{item.slot || item.servicetime}</CTableDataCell> */}

                      <CTableDataCell>
                        <CButton
                          style={{ backgroundColor: 'var(--color-black)' }}
                          className="text-white"
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
                      <CTableDataCell>
                        <CFormSelect
                          size="sm"
                          value={item.status}
                          onChange={(e) => handleStatusUpdate(item.bookingId, e.target.value)}
                          style={{ minWidth: '120px' }}
                        >
                          <option value="Pending">Pending</option>
                          {/* <option value="Confirmed">Confirmed</option> */}
                          <option value="Completed">Completed</option>
                          {/* <option value="In-Progress">In-Progress</option> */}
                          {/* <option value="Rejected">Rejected</option> */}
                        </CFormSelect>
                      </CTableDataCell>
                    </CTableRow>
                  ))
              })()
            )}
          </CTableBody>
        </CTable>
      </div>
      {todayBookings.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(todayBookings.length / pageSize)}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </>
  )
}

export default WidgetsDropdown
