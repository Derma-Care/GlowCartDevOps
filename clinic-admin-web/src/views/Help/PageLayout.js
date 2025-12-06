import React, { useEffect, useState } from 'react'
import { CContainer } from '@coreui/react'
import { useHospital } from '../../views/Usecontext/HospitalContext'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import HospitalDetailsTabs from './HospitalDetailsTabs'

const PageLayout = ({ title, children, branch }) => {
  const { selectedHospital } = useHospital()
  const hospital = selectedHospital?.data

  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(false)

  // 🔹 Fetch Branch List
  // useEffect(() => {
  //   const fetchBranches = async () => {
  //     if (!hospital?.hospitalId) return
  //     try {
  //       setLoading(true)
  //       const response = await GetClinicBranches(hospital.hospitalId)
  //       // ✅ Remove 0th index (main branch)
  //       const filteredBranches = response?.data?.slice(1) || []
  //       setBranches(filteredBranches)
  //     } catch (error) {
  //       console.error('Error fetching branches:', error)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   if (branch) fetchBranches()
  // }, [hospital?.hospitalId, branch])

  return (
    <CContainer fluid>
      {/* 🔸 Page Title */}
      {title && (
        <h2
          className="mb-4"
          style={{
            fontWeight: 600,
            color: 'var(--color-black)',
            borderBottom: '2px solid #e6e6e6',
            paddingBottom: '8px',
          }}
        >
          {title}
        </h2>
      )}

      {/* 🔸 Hospital Information Card */}
      {branch && hospital && (
        <div>
          <div className="d-flex align-items-start" style={{ gap: '16px', flexWrap: 'wrap' }}>
            {/* Hospital Logo */}
            {/* {hospital.hospitalLogo ? (
              <img
                src={
                  hospital.hospitalLogo.startsWith('data:')
                    ? hospital.hospitalLogo
                    : `data:image/jpeg;base64,${hospital.hospitalLogo}`
                }
                alt={hospital.name || 'Hospital Logo'}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                }}
              />
            ) : (
              <div
                className="bg-light d-flex align-items-center justify-content-center"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                }}
              >
                <span className="text-muted">No Logo</span>
              </div>
            )} */}

            {/* Hospital Details */}
            {/* 🔸 Hospital Information Card */}
            {hospital && (
              <div style={{ border: '1px solid #f1f1f1', padding: '16px 0' }}>
                {/* TOP SECTION */}
                <div
                  className="p-3 rounded mb-4"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-black), var(--color-bgcolor))',
                    color: 'white',
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    {/* Logo */}
                    {hospital.hospitalLogo ? (
                      <img
                        src={
                          hospital.hospitalLogo.startsWith('data:')
                            ? hospital.hospitalLogo
                            : `data:image/jpeg;base64,${hospital.hospitalLogo}`
                        }
                        alt="Logo"
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 10,
                          objectFit: 'cover',
                          border: '2px solid white',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          background: '#fff',
                          borderRadius: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-black)',
                          fontWeight: 600,
                          border: '1px solid #fff',
                        }}
                      >
                        No Logo
                      </div>
                    )}

                    <div className="text-white">
                      <h3 className="mb-1 fw-bold text-white">{hospital.name}</h3>
                      <p className="mb-0 text-white">{hospital.clinicType}</p>
                      <p className="mb-0 text-white" style={{ fontSize: '0.9rem' }}>
                        {hospital.address}, {hospital.city}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DETAIL GRID */}
                <HospitalDetailsTabs hospital={hospital} />
              </div>
            )}
          </div>

          {/* 🔹 Branch Section */}
          {/* <div className="mt-4">
            <h6 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--color-black)' }}>
              🏥 Our Branches
            </h6>

            {loading ? (
              <div className="text-center text-muted py-2">Loading branches...</div>
            ) : branches.length > 0 ? (
              <div className="row g-3">
                {branches.map((b, index) => (
                  <div className="col-md-6 col-lg-4" key={b.branchId || index}>
                    <div
                      className="p-3 rounded h-100 bg-white"
                      style={{
                        border: '1px solid #ebebeb',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)'
                        e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
                      }}
                    >
                      <h6 className="fw-bold mb-2" style={{ color: 'var(--color-black)' }}>
                        {b.branchName}
                      </h6>
                      <p className="mb-1 d-flex align-items-center text-secondary gap-2">
                        <MapPin size={14} /> {b.address || '—'}
                      </p>
                      <p className="mb-0 d-flex align-items-center text-secondary gap-2">
                        <Phone size={14} /> {b.contactNumber || '—'}
                      </p>
                      <p className="mb-0 d-flex align-items-center text-muted gap-2">
                        <Mail size={14} /> {b.email || '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted mb-0">No branches found.</p>
            )}
          </div> */}
        </div>
      )}

      {/* 🔸 Page Main Content */}
      <div>{children}</div>
    </CContainer>
  )
}

export default PageLayout

