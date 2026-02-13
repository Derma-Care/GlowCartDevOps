import React, { useEffect, useState } from 'react'
import { CModal, CModalHeader, CModalBody, CModalFooter, CButton, CFormInput } from '@coreui/react'
import axios from 'axios'
import { showCustomToast } from '../../../Utils/Toaster'
import { BASE_URL } from '../../../baseUrl'
import LoadingIndicator from '../../../Utils/loader'
import { http } from '../../../Utils/Interceptors'

export default function ClinicSlotManager({ show, setShow, clinicId }) {
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    if (show) fetchSlots()
  }, [show])

  // 🔹 Fetch dynamic slots
  const fetchSlots = async () => {
    setLoading(true)
    try {
      const res = await http.get(`${BASE_URL}/available-slots`, {
        params: { clinicId },
      })

      const { dates, slots } = res.data.data
      // Create map for fast lookup
      const slotMap = {}
      slots.forEach((s) => {
        slotMap[s.date] = s
      })

      const mapped = dates.map((dObj) => {
        const existing = slotMap[dObj.date]

        return {
          date: new Date(dObj.date),
          dateStr: dObj.date,
          week: dObj.dayOfWeek,

          hasSlot: !!existing, // ✅ NEW
          isWorking: existing?.workingHours ?? true,
          reason: existing?.reason || '',
          error: '',
        }
      })

      setDays(mapped)
    } catch (e) {
      console.error(e)
      showCustomToast('Failed to load slots')
    }
    setLoading(false)
  }

  // 🔹 Toggle day
  const toggleDay = (index) => {
    const updated = [...days]
    const day = updated[index]

    // 🩶 Case 1: Slot not configured (GRAY → BLUE)
    if (!day.hasSlot) {
      day.hasSlot = true
      day.isWorking = true
      day.reason = 'Working Day'
      day.error = ''
      setDays(updated)
      return
    }

    // 🔵 Case 2: Working → Unavailable
    if (day.isWorking === true) {
      day.isWorking = false
      day.reason = ''
      day.error = 'Reason required'
    }
    // 🌸 Case 3: Unavailable → Working
    else {
      day.isWorking = true
      day.reason = 'Working Day'
      day.error = ''
    }

    setDays(updated)
  }

  // 🔹 Reason change
  const setReason = (index, value) => {
    const updated = [...days]
    updated[index].reason = value
    updated[index].error = value.trim() ? '' : 'Reason required'
    setDays(updated)
  }

  // 🔹 Select all
  const selectAll = () => {
    setDays(
      days.map((d) => ({
        ...d,
        hasSlot: true, // 🔥 THIS is the missing piece
        isWorking: true,
        reason: 'Working Day',
        error: '',
      })),
    )
  }

  // 🔹 Save slots
  const submitSlots = async () => {
    let hasError = false

    const exceptions = []
    days.forEach((d) => {
      // ⛔ Skip gray (not configured) dates completely
      if (!d.hasSlot) return

      // ❌ Unavailable but no reason
      if (!d.isWorking && !d.reason) {
        d.error = 'Reason required'
        hasError = true
      }

      // ❌ Collect only unavailable slots
      if (!d.isWorking) {
        exceptions.push({
          date: d.dateStr,
          workingHours: false,
          reason: d.reason,
        })
      }
    })

    setDays([...days])

    if (hasError) {
      showCustomToast('Please enter reasons for all unavailable days')
      return
    }

    try {
      const res = await http.post(`${BASE_URL}/save-slots`, {
        clinicId,
        exceptions,
      })
      console.log(res)

      showCustomToast(`${res.data.message}` || 'Slots saved successfully')
      setShow(false)
    } catch (e) {
      console.error(e)
      showCustomToast('Failed to save slots')
    }
  }

  return (
    <>
      <CModal
        visible={show}
        size="lg"
        onClose={() => setShow(false)}
        backdrop="static"
        className="custom-modal"
      >
        <CModalHeader>
          <strong>Manage Clinic Slots (Next 30 Days)</strong>
        </CModalHeader>

        <CModalBody>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center">
              <LoadingIndicator message="Generating Slots..." />
            </div>
          ) : (
            <div className="d-flex flex-wrap gap-3">
              {days.map((day, idx) => (
                <div
                  key={day.dateStr}
                  onClick={() => {
                    toggleDay(idx)
                  }}
                  style={{
                    width: 110,
                    padding: 10,
                    borderRadius: 8,
                    textAlign: 'center',
                    cursor: 'pointer',

                    background: !day.hasSlot
                      ? '#e0e0e0' // ⚠️ Slot NOT configured (GRAY)
                      : day.isWorking
                        ? 'var(--color-bgcolor)' // ✅ Working (BLUE)
                        : '#ffd6d6', // ❌ Unavailable (PINK)

                    border:
                      day.isWorking === false && day.error ? '1px solid red' : '1px solid #ccc',

                    color: 'var(--color-black)',
                  }}
                >
                  <div style={{ fontSize: 12 }}>{day.week}</div>
                  <b>
                    {day.date.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </b>

                  {day.isWorking === false && (
                    <>
                      <CFormInput
                        className="mt-2"
                        placeholder="Reason"
                        value={day.reason}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setReason(idx, e.target.value)}
                      />
                      {day.error && <div style={{ fontSize: 11, color: 'red' }}>{day.error}</div>}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CModalBody>

        <CModalFooter className="d-flex justify-content-between">
          <CButton
            style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
            onClick={selectAll}
          >
            Select All Working Days
          </CButton>

          <div className="d-flex gap-2">
            <CButton
              color="info"
              style={{ color: 'white' }}
              onClick={() => setShowInstructions(true)}
            >
              Instructions
            </CButton>

            <CButton color="secondary" onClick={() => setShow(false)}>
              Close
            </CButton>
            <CButton color="success" style={{ color: 'white' }} onClick={submitSlots}>
              Save Slots
            </CButton>
          </div>
        </CModalFooter>
      </CModal>

      {/* Instructions */}
      <CModal visible={showInstructions} onClose={() => setShowInstructions(false)}>
        <CModalHeader>
          <strong>Instructions</strong>
        </CModalHeader>
        <CModalBody>
          <ul>
            <li>
              By default, all dates are considered <b>Working Days</b>.
            </li>

            <li>
              <span style={{ color: '#0d6efd', fontWeight: 'bold' }}>Blue</span> cards indicate
              <b> Working Days</b>.
            </li>

            <li>
              <span style={{ color: '#6c757d', fontWeight: 'bold' }}>Gray</span> cards indicate
              dates that are <b>not yet configured</b>.
            </li>

            <li>
              Click on any <b>Blue</b> or <b>Gray</b> date to mark it as <b>Unavailable</b>.
            </li>

            <li>
              When a date is marked <b>Unavailable</b>, the card turns
              <span style={{ color: '#d6336c', fontWeight: 'bold' }}> light pink</span> and a
              <b> Reason</b> field will appear.
            </li>

            <li>
              Enter a <b>reason</b> for every Unavailable date
              <span style={{ color: 'red', fontWeight: 'bold' }}> (mandatory)</span>.
            </li>

            <li>
              If a reason is missing, the card border will turn
              <span style={{ color: 'red', fontWeight: 'bold' }}> red</span> and the slot cannot be
              saved.
            </li>

            <li>
              Click <b>Select All Working Days</b> to reset all dates back to Working Days.
            </li>

            <li>
              Click <b>Save Slots</b> to save your changes.
            </li>
          </ul>
        </CModalBody>

        <CModalFooter>
          <CButton
            style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
            onClick={() => setShowInstructions(false)}
          >
            Got it
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}
