import React, { useState } from 'react'
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
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilOptions } from '@coreui/icons'
import { getStyle } from '@coreui/utils'
import { CChartLine } from '@coreui/react-chartjs'
import Pagination from '../../Utils/Pagination'
import { aptData } from '../AppointmentManagement/appointmnetData'

const WidgetsDropdown = () => {
  const navigate = useNavigate()
  const today = new Date().toISOString().split('T')[0]
  const [filterTypes, setFilterTypes] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [selectedDate, setSelectedDate] = useState()
  // Toggle filter (Pending / Completed)
  const toggleFilter = (status) => {
    setFilterTypes(filterTypes.includes(status) ? [] : [status])
  }
  // Filter by date + status
  const filteredAppointments = aptData.filter((item) => {
    // Match date
    const isDateMatch = item.serviceDate === selectedDate

    // Match status
    const isStatusMatch = filterTypes.length === 0 ? true : filterTypes.includes(item.status)

    return isDateMatch && isStatusMatch
  })

  // Apply Status Filter
  // const filteredAppointments = aptData.filter((item) => {
  //   if (filterTypes.length === 0) return true
  //   return filterTypes.includes(item.status)
  // })

  return (
    <>
      {/* ----------------------  TOP CARDS ---------------------- */}
      <CRow xs={{ gutter: 4 }}>
        <CCol sm={6} xl={4}>
          <CWidgetStatsA
            color="info"
            value="50"
            title="Total Appointments"
            action={
              <CDropdown alignment="end">
                <CDropdownToggle color="transparent" caret={false} className="p-0">
                  <CIcon icon={cilOptions} />
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem onClick={() => navigate('/appointment-management')}>
                    View All Appointments
                  </CDropdownItem>
                  <CDropdownItem>Export</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            }
            chart={
              <CChartLine
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
                      data: [10, 20, 25, 30, 28, 32, 40],
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
            value="30"
            title="Total Patients"
            action={
              <CDropdown alignment="end">
                <CDropdownToggle color="transparent" caret={false} className="p-0">
                  <CIcon icon={cilOptions} />
                </CDropdownToggle>
              </CDropdown>
            }
            chart={
              <CChartLine
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
                      data: [5, 12, 15, 20, 18, 22, 25],
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
            value="12"
            title="Total Doctors"
            action={
              <CDropdown alignment="end">
                <CDropdownToggle color="transparent" caret={false} className="p-0">
                  <CIcon icon={cilOptions} />
                </CDropdownToggle>
              </CDropdown>
            }
            chart={
              <CChartLine
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
                      data: [2, 3, 4, 4, 5, 6, 7],
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

      {/* ----------------------  AD SPACE ---------------------- */}
      <CCard className="mt-4 text-center border-2 border-dashed rounded">
        <CCardBody className="fw-bold fs-5" style={{ color: 'var(--color-black)' }}>
          Ad Space
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
              onClick={() => setFilterTypes([])}
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

        {/* TABLE */}
        <CTable striped hover responsive className="pink-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>S.No</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Age</CTableHeaderCell>
              <CTableHeaderCell>Type</CTableHeaderCell>
              <CTableHeaderCell>Service</CTableHeaderCell>
              <CTableHeaderCell>Date</CTableHeaderCell>
              <CTableHeaderCell>Action</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {filteredAppointments
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

                  <CTableDataCell>
                    <CFormSelect size="sm" value={item.status}>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                    </CFormSelect>
                  </CTableDataCell>
                </CTableRow>
              ))}
          </CTableBody>
        </CTable>

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredAppointments.length / pageSize)}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </>
  )
}

export default WidgetsDropdown
