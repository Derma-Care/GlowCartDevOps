import React, { useMemo, useState } from 'react'
import { CFormInput, CButton, CFormTextarea } from '@coreui/react'
import { Mail, Phone } from 'lucide-react'
import { useHospital } from '../../views/Usecontext/HospitalContext'
import { showCustomToast } from '../../Utils/Toaster'
import { emailPattern, mobilePattern } from '../../Constant/Constants'
import axios from 'axios'
import { BASE_URL, CreateClinicEnquiry } from '../../baseUrl'
import { ToastContainer } from 'react-toastify'
import { http } from '../../Utils/Interceptors'

function Help() {
  const { selectedHospital } = useHospital()
  const [emailError, setEmailError] = useState('')
  const [mobileError, setMobileError] = useState('')

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    message: '',
  })

  const mainBranch = useMemo(
    () => ({
      name: selectedHospital?.hospitalName || 'SureCare Support',
      phone: selectedHospital?.contact || '+91 9876543210',
      email: 'Ngkderma@gmail.com' || 'support@dermacare.com',
    }),
    [selectedHospital],
  )

  const handleChange = (e) => {
    const { name, value } = e.target

    // Allow only digits for mobile
    if (name === 'mobile' && !/^\d*$/.test(value)) return

    setForm({ ...form, [name]: value })

    if (name === 'mobile') {
      if (!value) {
        setMobileError('Mobile number is required')
      } else if (!mobilePattern.test(value)) {
        setMobileError('Enter valid 10-digit mobile number starting with 6-9')
      } else {
        setMobileError('')
      }
    }

    // existing email validation
    if (name === 'email') {
      if (value && !emailPattern.test(value)) {
        setEmailError('Please enter a valid email address')
      } else {
        setEmailError('')
      }
    }
  }

  const createClinicEnquiry = async (payload) => {
    return http.post(`${BASE_URL}/${CreateClinicEnquiry}`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  const handleSubmit = async () => {
    if (!form.name || !form.mobile || !form.message) {
      showCustomToast('Please fill required fields', 'error')
      return
    }

    if (form.email && !emailPattern.test(form.email)) {
      showCustomToast('Please enter a valid email address', 'error')
      return
    }

    const payload = {
      clinicId: selectedHospital?.data?.clinicId,
      clinicName: selectedHospital?.data?.name,
      clinicAddress: selectedHospital?.data?.address,
      clinicMobile:
        selectedHospital?.data?.contactNumber || selectedHospital?.data?.alternateContactNumber,
      contactName: form.name,
      contactMobile: form.mobile,
      contactEmail: form.email,
      message: form.message,
    }

    try {
      const res = await createClinicEnquiry(payload)

      showCustomToast(
        res.data.message || 'Your request has been submitted. Our support team will contact you.',
        'success',
      )

      setForm({ name: '', mobile: '', email: '', message: '' })
    } catch (error) {
      console.error(error)
      showCustomToast('Failed to submit request. Please try again later.', 'error')
    }
  }

  return (
    <div className="help-container p-4">
      <ToastContainer />
      {/* 🔹 Header */}
      <div className="text-center mb-5">
        <h4 className="fw-bold mb-2">Help & Support</h4>
        <p className="text-muted">
          This section is only for contacting our support team.
          <br />
          For clinic operations, please use the respective modules.
        </p>
      </div>

      {/* 🔹 ROW LAYOUT */}
      <div className="row align-items-start">
        {/* ================= LEFT SIDE ================= */}
        <div className="col-12 col-md-6 mb-4">
          <h5 className="fw-bold mb-3">Contact Support</h5>
          <p className="text-muted mb-4">
            Reach out to our support team for any technical or general queries.
          </p>

          <div className="d-flex flex-wrap gap-3">
            <CButton
              style={{
                backgroundColor: 'var(--color-black)',
                color: '#fff',
                borderRadius: '8px',
                padding: '8px 16px',
              }}
              onClick={() => {
                const subject = 'Support Request'
                const body = 'Hello,\n\nI need assistance with...'
                const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                  mainBranch.email,
                )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                window.open(gmailUrl, '_blank')
              }}
            >
              <Mail size={18} className="me-2" />
              Email Support
            </CButton>

            <a href={`tel:${mainBranch.phone}`} style={{ textDecoration: 'none' }}>
              <CButton
                style={{
                  backgroundColor: 'var(--color-bgcolor)',
                  color: 'var(--color-black)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                }}
              >
                <Phone size={18} className="me-2" />
                Call Support
              </CButton>
            </a>
          </div>

          {/* Support timing */}
          <p className="text-muted mt-4  " style={{ fontSize: '13px' }}>
            Support Hours: Mon–Sat, 9:00 AM – 6:00 PM
            <br />
            Response within 24 working hours
          </p>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="col-12 col-md-6">
          <div
            style={{
              // border: '1px solid #eee',
              borderRadius: '12px',
              // padding: '20px',
              // background: '#fff',
            }}
          >
            <h5 className="fw-bold mb-3">Submit a Support Request</h5>

            <CFormInput
              className="mb-3"
              placeholder="Your Name *"
              name="name"
              value={form.name}
              onChange={handleChange}
            />

            <CFormInput
              className="mb-3"
              placeholder="Mobile Number *"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              maxLength={10}
            />

            {mobileError && (
              <div style={{ color: 'red', fontSize: '12px', marginBottom: '12px' }}>
                {mobileError}
              </div>
            )}

            <CFormInput
              className="mb-3"
              placeholder="Email (optional)"
              name="email"
              value={form.email}
              onChange={handleChange}
            />

            {emailError && (
              <div style={{ color: 'red', fontSize: '12px', marginBottom: '12px' }}>
                {emailError}
              </div>
            )}

            <CFormTextarea
              rows={3}
              className="mb-3"
              placeholder="Describe your issue *"
              name="message"
              value={form.message}
              onChange={handleChange}
            />

            <CButton
              onClick={handleSubmit}
              style={{
                backgroundColor: 'var(--color-black)',
                color: '#fff',
                width: '100%',
                borderRadius: '8px',
              }}
            >
              Submit Request
            </CButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help
