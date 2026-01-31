import React from 'react'
import { CModal, CModalBody, CModalHeader, CModalTitle, CButton } from '@coreui/react'

export default function MembershipViewModal({ member, onClose }) {
  const transactionHistory = member.transactionHistory || []

  const membershipColors = {
    Basic: '#6c757d',
    Silver: '#bfc6d1',
    Gold: '#f7c400',
    Platinum: '#af8de5',
  }

  return (
    <CModal visible onClose={onClose} size="lg" backdrop="static" className="custom-modal">
      {/* HEADER */}
      <CModalHeader
        style={{
          background: 'linear-gradient(135deg, var(--color-black), var(--color-bgcolor))',
          color: 'white',
          borderBottom: 'none',
        }}
      >
        <CModalTitle style={{ fontWeight: 700, color: 'white' }}>Membership Details</CModalTitle>
      </CModalHeader>
      <CModalBody style={{ padding: '25px' }}>
        {/* PROFILE CARD */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ffe3ef, #ffd2e7)',
            padding: '20px',
            borderRadius: '16px',
            marginBottom: '25px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <h3 style={{ marginBottom: 5, fontWeight: 700, color: "var(--color-black)" }}>{member.name}</h3>
          <p style={{ margin: 0, color: '#444' }}>{member.phone}</p>
        </div>

        {/* DETAILS GRID */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '18px',
            marginBottom: '20px',
          }}
        >
          <div className="info-card">
            <label>Membership</label>
            <div
              style={{
                background: membershipColors[member.membership],
                padding: '6px 12px',
                color: 'white',
                width: 'fit-content',
                borderRadius: '8px',
                fontWeight: 600,
              }}
            >
              {member.membership}
            </div>
          </div>
          <div className="info-card">
            <label>Coins</label>
            <p>{member.coins.toLocaleString()}</p>
          </div>
          <div className="info-card">
            <label>Referral Code</label>
            <p style={{ fontWeight: 600 }}>{member.referralCode}</p>
          </div>
          <div className="info-card">
            <label>Joined</label>
            <p>{new Date(member.joined).toLocaleDateString('en-GB')}</p>
          </div>
        </div>
        <hr />

        {/* TRANSACTION SECTION */}
        <h5
          style={{
            fontWeight: 700,
            marginBottom: 15,
            color: '#d81b60',
          }}
        >
          Transaction History
        </h5>

        <div
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #f3c4d9',
            boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
          }}
        >
          <table className="table mb-0">
            <thead
              style={{
                background: '#ffe3ef',
                color: '#d81b60',
                fontWeight: 700,
              }}
            >
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Coins</th>
              </tr>
            </thead>
            <tbody>
              {transactionHistory.length > 0 ? (
                transactionHistory.map((t) => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td>{t.activity}</td>
                    <td
                      style={{
                        fontWeight: 700,
                        color: t.coins.startsWith('+') ? 'green' : 'red',
                      }}
                    >
                      {t.coins}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center text-muted py-3">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* CLOSE BUTTON */}
        <div className="text-end mt-4">
          <CButton
            color="danger"
            style={{
              background: 'linear-gradient(135deg, var(--color-black), var(--color-black))',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: 600,
              color: 'white',
            }}
            onClick={onClose}
          >
            Close
          </CButton>
        </div>
      </CModalBody>
    </CModal>
  )
}
