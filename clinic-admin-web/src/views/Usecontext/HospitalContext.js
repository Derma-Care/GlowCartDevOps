import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { http } from '../../Utils/Interceptors'
// import { GetSubServices_ByClinicId } from '../ProcedureManagement/ProcedureManagementAPI'
import { BASE_URL, MainAdmin_URL } from '../../baseUrl'

const HospitalContext = createContext()

// eslint-disable-next-line react/prop-types
export const HospitalProvider = ({ children }) => {
  // Hydrate from localStorage
  const [selectedHospital, setSelectedHospital] = useState(() => {
    const stored = localStorage.getItem('selectedHospital')
    return stored ? JSON.parse(stored) : null
  })

  const [doctorData, setDoctorData] = useState(null)
  const [subServices, setSubServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [notificationCount, setNotificationCount] = useState('')
  const [role, setRole] = useState(localStorage.getItem('role'))
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hospitalUser')
    return saved ? JSON.parse(saved) : null
  })
  const [hospitalId, setHospitalId] = useState(localStorage.getItem('HospitalId'))
  const [hydrated, setHydrated] = useState(false) // Track data readiness
  // useEffect(() => {
  //   setHydrated(true)
  // }, [])

  // Persist user & hospital to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('hospitalUser', JSON.stringify(user))
    else localStorage.removeItem('hospitalUser')
  }, [user])

  useEffect(() => {
    if (selectedHospital) localStorage.setItem('selectedHospital', JSON.stringify(selectedHospital))
    else localStorage.removeItem('selectedHospital')
  }, [selectedHospital])

  const fetchAllData = useCallback(
    async (id = hospitalId) => {
      if (!id) {
        setHydrated(true)
        return
      }
      setHydrated(false)
      try {
        const res = await http.get(`${MainAdmin_URL}/clinics/get/${id}`)
        const clinicData = res.data.data

        const updatedHospital = {
          hospitalId: id,
          hospitalName: clinicData.name,
          data: clinicData,
        }

        // ✅ UPDATE CONTEXT
        setSelectedHospital(updatedHospital)

        // ✅ UPDATE localStorage
        localStorage.setItem('selectedHospital', JSON.stringify(updatedHospital))
      } catch (err) {
        console.error('Failed to refresh clinic data', err)
      } finally {
        setHydrated(true)
      }
    },
    [hospitalId],
  )

  // Auto-fetch on hospitalId change
  useEffect(() => {
    if (hospitalId) {
      fetchAllData()
      // fetchPermissions()
      console.log('fetchPermissions calling') // ✅ also update permissions on refresh or hospital change
    } else {
      setHydrated(true)
    }
  }, [hospitalId, fetchAllData])

  return (
    <HospitalContext.Provider
      value={{
        selectedHospital,
        doctorData,
        subServices,
        loading,
        errorMessage,
        hydrated,
        user,
        role,
        notificationCount,
        hospitalId,
        setSelectedHospital,
        setDoctorData,
        setSubServices,
        setUser,
        setRole,
        setHospitalId,
        setNotificationCount,
        fetchAllData,

        // fetchSubServices,
        // fetchPermissions, // expose for manual calls (like after login)
      }}
    >
      {children}
    </HospitalContext.Provider>
  )
}

export const useHospital = () => useContext(HospitalContext)
