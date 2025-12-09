import React, { useState } from 'react'
import { CModal, CModalHeader, CModalBody, CModalFooter, CButton, CFormInput } from '@coreui/react'
import { showCustomToast } from '../../../Utils/Toaster'

const today = new Date()

const getNext30Days = () => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return [...Array(30)].map((_, i) => {
    const d = new Date()
    d.setDate(today.getDate() + i)
    return {
      date: d,
      isWorking: true,
      reason: 'Working Day',
      error: '', // NEW FIELD
      week: weekDays[d.getDay()], // NEW: Weekday label
    }
  })
}

export default function ClinicSlotManager({ show, setShow }) {
  const [days, setDays] = useState(getNext30Days())
  const [showInstructions, setShowInstructions] = useState(false)

  const toggleDay = (index) => {
    const updated = [...days]
    const day = updated[index]

    day.isWorking = !day.isWorking

    if (day.isWorking) {
      day.reason = 'Working Day'
      day.error = ''
    } else {
      day.reason = ''
      day.error = 'Reason required'
    }

    setDays(updated)
  }

  const selectAll = () => {
    const updated = days.map((d) => ({
      ...d,
      isWorking: true,
      reason: 'Working Day',
      error: '',
    }))
    setDays(updated)
  }

  const setReason = (index, value) => {
    const updated = [...days]
    updated[index].reason = value
    updated[index].error = value.trim() === '' ? 'Reason required' : ''
    setDays(updated)
  }

  const submitSlots = () => {
    // Prevent submit if any unavailable day has no reason
    let hasError = false

    const updated = days.map((d) => {
      if (!d.isWorking && !d.reason.trim()) {
        d.error = 'Reason required'
        hasError = true
      }
      return d
    })

    setDays(updated)

    if (hasError) {
      showCustomToast('Please fill the required reasons before saving.')
      return
    }

    const payload = updated.map((d) => ({
      date: d.date.toISOString().split('T')[0],
      isWorking: d.isWorking,
      reason: d.reason,
    }))

    console.log('Sending to backend:', payload)

    alert('Slots saved successfully!')
    setShow(false)
  }

  return (
    <>
      {/* MAIN MODAL */}
      <CModal visible={show} size="lg" onClose={() => setShow(false)} className="custom-modal">
        <CModalHeader style={{ color: 'var(--color-black)' }}>
          <strong>Manage Clinic Slots (Next 30 Days)</strong>
        </CModalHeader>

        <CModalBody>
          {/* Day Cards */}
          <div className="d-flex flex-wrap gap-3">
            {days.map((day, idx) => (
              <div
                key={idx}
                onClick={() => toggleDay(idx)}
                style={{
                  width: '110px',
                  padding: '10px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: day.isWorking ? 'var(--color-bgcolor)' : '#ffd4d4',
                  border: day.error ? '1px solid red' : '1px solid #ccc',
                  color: day.isWorking ? 'var(--color-black)' : 'black',
                }}
              >
                {/* WEEKDAY */}
                <div style={{ fontSize: '12px', opacity: 0.9 }}>{day.week}</div>

                {/* DATE */}
                <b>
                  {day.date.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </b>

                {/* REASON INPUT */}
                {!day.isWorking && (
                  <>
                    <CFormInput
                      className="mt-2"
                      placeholder="Reason"
                      value={day.reason}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setReason(idx, e.target.value)}
                    />

                    {/* ERROR MESSAGE */}
                    {day.error && (
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'red',
                          marginTop: '4px',
                        }}
                      >
                        {day.error}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
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

      {/* INSTRUCTIONS MODAL */}
      <CModal visible={showInstructions} onClose={() => setShowInstructions(false)}>
        <CModalHeader style={{ color: 'var(--color-black)' }}>
          <strong>Instructions</strong>
        </CModalHeader>

        <CModalBody style={{ color: 'var(--color-black)' }}>
          <p>
            <b>Manage Clinic Availability for the Next 30 Days</b>
          </p>
          <ul>
            <li>
              All days are marked as <b>Working Day</b> by default.
            </li>
            <li>
              Click on any date to mark it as <b>Holiday / Unavailable</b>.
            </li>
            <li>
              You must enter a <b>reason</b> for unavailable days.
            </li>
            <li>Select All → marks all days as Working Day.</li>
            <li>Click Save Slots to store the schedule.</li>
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
