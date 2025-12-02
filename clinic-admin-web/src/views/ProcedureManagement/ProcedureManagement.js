// import React, { useEffect, useState } from 'react'
// import axios from 'axios'
// import {
//   CForm,
//   CFormInput,

//   CButton,
//   CModal,
//   CModalHeader,
//   CFormText,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
//   CRow,

//   CCol,
//   CFormSelect,

//   CTable,
//   CTableHead,
//   CTableRow,
//   CTableHeaderCell,
//   CTableBody,
//   CTableDataCell,

//   CFormTextarea,
// } from '@coreui/react'

// import { ToastContainer } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'
// import {

//   postServiceData,
//   updateServiceData,
//   deleteServiceData,

// } from './ProcedureManagementAPI'

// import ProcedureQA from './QASection'
// import { Edit2, Eye, Trash2, View } from 'lucide-react'
// import ConfirmationModal from '../../components/ConfirmationModal'
// import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
// import capitalizeWords from '../../Utils/capitalizeWords'
// import LoadingIndicator from '../../Utils/loader'
// import { http } from '../../Utils/Interceptors'
// import { useHospital } from '../Usecontext/HospitalContext'
// import { showCustomToast } from '../../Utils/Toaster'
// import Pagination from '../../Utils/Pagination'
// import { getAllProcedures, getProcedurePricingByClinicId } from '../NGK/APIs/procedureService'

// const ServiceManagement = () => {
//   // const [searchQuery, setSearchQuery] = useState('')
//   const [service, setService] = useState([])

//   // const [filteredData, setFilteredData] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [delloading, setDelLoading] = useState(false)
//   const [error, setError] = useState(null)

//   const [modalVisible, setModalVisible] = useState(false)
//   const [viewService, setViewService] = useState(null)
//   const [editServiceMode, setEditServiceMode] = useState(false)
//   const [question, setQuestion] = useState('')

//   const [answers, setAnswers] = useState([])
//   const [qaList, setQaList] = useState([])

//   const [selectedSubService, setSelectedSubService] = useState('')
//   const [subServiceId, setSubServiceId] = useState('')

//   const { searchQuery, setSearchQuery } = useGlobalSearch()
//   const [currentPage, setCurrentPage] = useState(1)
//   const [rowsPerPage, setRowsPerPage] = useState(10)
//   const [saveloading, setSaveLoading] = useState(false)
//   const [isProcedure, setIsProcedure] = useState([])
//   const [procedurePricing, setProcedurePricing] = useState([])

//   const { user } = useHospital()
//   const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

//   const [serviceToEdit, setServiceToEdit] = useState({
//     serviceImage: '',
//     viewImage: '',
//     subServiceName: '',
//     serviceName: '',
//     serviceImageFile: null,
//   })

//   try {
//     if (typeof service.descriptionQA === 'string') {
//       descriptionQA = JSON.parse(service.descriptionQA)
//     } else {
//       descriptionQA = service.descriptionQA || []
//     }
//   } catch (err) {
//     console.error('Invalid descriptionQA format:', err)
//   }

//   const [newService, setNewService] = useState({
//     subServiceName: '',
//     description: '',
//     price: '',
//     gst: 0,
//     gstAmount: 0,
//     consultationFee: 0,
//     offerValidDate: '',
//     offerEndDate: '',
//     sittings: '',

//     procedureQA: [],
//     preProcedureQA: [],
//     postProcedureQA: [],
//   })
//   const [modalMode, setModalMode] = useState('add') // or 'edit'

//   const filteredData = React.useMemo(() => {
//     const q = searchQuery.toLowerCase().trim()
//     if (!q) return procedurePricing
//     return procedurePricing.filter((item) =>
//       Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
//     )
//   }, [searchQuery, procedurePricing])

//   // Open for adding
//   const openAddModal = () => {
//     setModalMode('add')
//     setQaList([])
//     setAnswers([])
//     setQuestion('')
//     setSelectedSubService('')
//     setNewService({
//       subServiceId: '',
//       subServiceName: '',
//       price: '',
//       discount: '',
//       gst: '',
//       gstAmount: 0,
//       consultationFee: 0,
//       minTime: '',
//       taxPercentage: '',
//       status: '',
//       serviceImage: '',
//       serviceImageFile: null,
//       viewImage: '',
//       viewDescription: '',
//       consentFormType: '',
//       platformFeePercentage: 0,
//       descriptionQA: [],
//     })
//     setModalVisible(true)
//   }

//   // Open for editing

//   const openEditModal = async (service) => {
//     console.log(service.subServiceId)
//     setSubServiceId(service.subServiceId)
//     setModalMode('edit')
//     setModalVisible(true)

//     // Map image correctly
//     const rawImage = service.procedureImage || ''
//     const fullImage = rawImage.startsWith('data:')
//       ? rawImage
//       : rawImage
//         ? `data:image/jpeg;base64,${rawImage}`
//         : ''

//     // Map correct procedure details
//     const selectedItem = isProcedure.find((p) => p.procedureId === service.procedureId)

//     // Split min time
//     const [timeValue, timeUnit] = service.minTime ? service.minTime.split(' ') : ['', '']

//     setNewService({
//       subServiceId: service.procedureId,
//       subServiceName: selectedItem?.procedureName || service.procedureName,

//       price: service.price || '',
//       discount: service.discountPercentage || 0,
//       gst: service.gst || 0,
//       gstAmount: service.gstAmount || 0,
//       consultationFee: service.consultationFee || 0,
//       taxPercentage: service.taxPercentage || 0,

//       minTimeValue: timeValue,
//       minTimeUnit: timeUnit,

//       sittings: service.sittings || '',

//       offerValidDate: service.offerValidDate || '',

//       serviceImage: fullImage,
//       serviceImageFile: null,

//       viewDescription: service.description || '',

//       procedureQA: service.procedureQA || [],
//       preProcedureQA: service.preProcedureQA || [],
//       postProcedureQA: service.postProcedureQA || [],
//     })
//     setQaList(formattedQA)
//   }

//   const [isModalVisible, setIsModalVisible] = useState(false)
//   const [serviceIdToDelete, setServiceIdToDelete] = useState(null)
//   const [errors, setErrors] = useState({
//     subServiceName: '',
//     serviceName: '',
//     serviceId: '',
//     categoryName: '',
//     price: '',
//     status: '',
//     taxPercentage: '',
//     descriptionQA: '',
//     answers: '',
//     minTime: '',
//     discount: '',
//     viewDescription: '',
//     consentFormType: '',
//     serviceImage: '',
//     bannerImage: '',
//   })

//   const fetchData = async () => {
//     setLoading(true)
//     setError(null)

//     try {
//       const res = await getAllProcedures()
//       console.log('API Response:', res)

//       const list = Array.isArray(res?.data)
//         ? res.data // case 1: res.data exists
//         : Array.isArray(res)
//           ? res // case 2: response itself is array
//           : []

//       setIsProcedure(list)

//       if (!list.length) {
//         console.warn('Procedures not found.')
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error)
//       setError('Failed to fetch data. Please try again later.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchData()
//     // serviceData()
//   }, [])

//   useEffect(() => {
//     getProcedureClinicId()
//   }, [])
//   const getProcedureClinicId = () => {
//     const clinicId = localStorage.getItem('HospitalId')

//     getProcedurePricingByClinicId(clinicId)
//       .then((data) => {
//         console.log('Pricing Data:', data)
//         setProcedurePricing(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [])
//       })
//       .catch((err) => {
//         console.error('Failed to load pricing:', err)
//       })
//   }

//   useEffect(() => {
//     if (
//       editServiceMode &&
//       serviceToEdit?.descriptionQA &&
//       typeof serviceToEdit.descriptionQA === 'string'
//     ) {
//       try {
//         setServiceToEdit((prev) => ({
//           ...prev,
//           descriptionQA: JSON.parse(prev.descriptionQA),
//         }))
//       } catch (e) {
//         console.error('Invalid QA format')
//       }
//     }
//   }, [editServiceMode])

//   // ------------------- VALIDATION -------------------
//   const validateForm = () => {
//     const newErrors = {}

//     // Sub Service (Procedure)
//     if (!newService.subServiceId || newService.subServiceId.trim() === '') {
//       newErrors.subServiceName = 'Procedure is required.'
//     }

//     // Procedure Price
//     if (!newService.price || !/^\d+(\.\d{1,2})?$/.test(newService.price)) {
//       newErrors.price = 'Procedure Price must be a valid number.'
//     } else if (Number(newService.price) < 100) {
//       newErrors.price = 'Procedure Price must be at least 100.'
//     }

//     // Consultation Fee validation
//     // Consultation Fee
//     if (!newService.consultationFee || newService.consultationFee.trim() === '') {
//       newErrors.consultationFee = 'Consultation Fee is required.'
//     } else if (!/^\d+(\.\d{1,2})?$/.test(newService.consultationFee)) {
//       newErrors.consultationFee = 'Consultation Fee must be a valid number.'
//     } else if (Number(newService.consultationFee) < 0) {
//       newErrors.consultationFee = 'Consultation Fee must be greater than or equal to  0.'
//     }

//     // Min Time Value
//     if (!newService.minTimeValue || newService.minTimeValue.trim() === '') {
//       newErrors.minTimeValue = 'Enter minimum time.'
//     } else if (!/^\d+$/.test(newService.minTimeValue)) {
//       newErrors.minTimeValue = 'Minimum time must be a number.'
//     } else if (Number(newService.minTimeValue) <= 0) {
//       newErrors.minTimeValue = 'Minimum time must be greater than zero.'
//     }

//     // Min Time Unit
//     if (!newService.minTimeUnit) {
//       newErrors.minTimeUnit = 'Please select a time unit.'
//     }

//     // View Description
//     if (!newService.viewDescription || newService.viewDescription.trim() === '') {
//       newErrors.viewDescription = 'View description is required.'
//     }

//     // Service Image
//     if (!newService.serviceImage) {
//       newErrors.serviceImage = 'Please upload a service image.'
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

//   const handleAddService = async () => {
//     console.log('--- handleAddService START ---')

//     // 1. Validate before processing
//     if (!validateForm()) {
//       // toast.error('Validation failed', { position: 'top-right' })
//       return
//     }

//     // 2. Calculate derived values
//     const discountAmount = (newService.price * newService.discount) / 100
//     const gstAmount = (newService.price * newService.gst) / 100
//     const discountedCost = newService.price - discountAmount
//     const taxAmount = (discountedCost * newService.taxPercentage) / 100
//     const gst = newService.gst || 0
//     const platformFee = (discountedCost * (newService.platformFeePercentage || 0)) / 100
//     const clinicPay = discountedCost + taxAmount - platformFee
//     const finalCost = clinicPay + gst + (newService.consultationFee || 0)
//     const formattedMinTime = `${newService.minTimeValue} ${newService.minTimeUnit}`

//     console.log('Calculated values:', {
//       discountAmount,
//       discountedCost,
//       taxAmount,
//       platformFee,
//       clinicPay,
//       finalCost,
//     })

//     // 3. Image handling
//     // If you stored raw base64 only (without prefix), add prefix when sending
//     const base64ImageToSend = newService.serviceImage?.startsWith('data:')
//       ? newService.serviceImage.split(',')[1] // strip prefix
//       : newService.serviceImage

//     // 4. Build payload
//     const payload = {
//       clinicId: localStorage.getItem('HospitalId'),
//       procedureName: newService.subServiceName,
//       procedureId: newService.subServiceId,
//       sittings: newService.sittings,
//       price: newService.price,
//       discountPercentage: newService.discount,
//       // discountAmount,
//       // discountedCost,
//       taxPercentage: newService.taxPercentage,
//       // taxAmount,
//       platformFeePercentage: newService.platformFeePercentage,
//       // platformFee,
//       // clinicPay,
//       finalCost,
//       gst: newService.gst,
//       gstAmount: newService.gstAmount,
//       consultationFee: newService.consultationFee,
//       // offerValidDate: '',
//       // offerEndDate: '',
//       minTime: formattedMinTime,
//       offerValidDate: newService.offerValidDate,
//       procedureImage: base64ImageToSend, // ✅ final base64 string only
//       procedureQA: newService.procedureQA,
//       preProcedureQA: newService.preProcedureQA,
//       postProcedureQA: newService.postProcedureQA,
//       description: newService.viewDescription,
//     }

//     console.log('Payload ready to submit:', payload)

//     // 5. API call
//     try {
//       setSaveLoading(true)
//       const response = await postServiceData(payload)
//       console.log('Response received:', response)

//       if (response.data.success || response.status == 200) {
//         showCustomToast(response.data.message, 'success')
//         setModalVisible(false)
//         getProcedureClinicId()
//         // fetchData()
//         // serviceData()
//       }
//     } catch (error) {
//       console.error('Error in handleAddService:', error.response)
//       showCustomToast(error.response?.data?.message || 'Something went wrong', 'error', {
//         position: 'top-right',
//       })
//     } finally {
//       setSaveLoading(false)
//     }

//     // 6. Reset form
//     setNewService({
//       categoryName: '',
//       categoryId: '',
//       serviceName: '',
//       serviceId: '',
//       subServiceId: '',
//       subServiceName: '',
//       price: 0,
//       discount: 0,
//       gst: 0,
//       gstAmount: 0,
//       consultationFee: 0,
//       taxPercentage: 0,
//       minTimeValue: '',
//       minTimeUnit: '',
//       status: '',
//       serviceImage: '',
//       viewDescription: '',
//       consentFormType: '',
//       procedureQA: [],
//       preProcedureQA: [],
//       postProcedureQA: [],
//       platformFeePercentage: 0,
//       descriptionQA: [],
//     })

//     setQaList([])
//     console.log('--- handleAddService END ---')
//   }

//   const formatMinutes = (minTime) => {
//     const minutes = parseInt(minTime, 10)

//     if (isNaN(minutes)) return 'Invalid time'

//     if (minutes < 60) return `${minutes} min`

//     const hours = Math.floor(minutes / 60)
//     const remainingMins = minutes % 60

//     return remainingMins === 0
//       ? `${hours} hour${hours > 1 ? 's' : ''}`
//       : `${hours} hour${hours > 1 ? 's' : ''} ${remainingMins} min`
//   }

//   const handleUpdateService = async () => {
//     try {
//       setSaveLoading(true)

//       const hospitalId = localStorage.getItem('HospitalId')

//       let base64ImageToSend = ''
//       if (newService.serviceImageFile) {
//         // convert uploaded file
//         const fullBase64String = await toBase64(newService.serviceImageFile)
//         base64ImageToSend = fullBase64String.split(',')[1]
//       } else if (newService.serviceImage?.startsWith('data:')) {
//         base64ImageToSend = newService.serviceImage.split(',')[1]
//       } else {
//         base64ImageToSend = newService.serviceImage || ''
//       }

//       // Ensure numeric values are numbers, not empty strings or null
//       const price = newService.price > 0 ? Number(newService.price) : 0

//       // build only the expected payload (no extra keys)
//       const updatedService = {
//         clinicId: hospitalId,
//         procedureName: newService.subServiceName || '',
//         procedureId: newService.subServiceId || '',
//         description: newService.viewDescription || '',
//         sittings: newService.sittings,

//         // minTime: newService.minTimeValue
//         //   ? `${newService.minTimeValue} ${newService.minTimeUnit}`
//         //   : '',

//         // procedureQA: Array.isArray(newService.procedureQA) ? newService.procedureQA : [],
//         // preProcedureQA: Array.isArray(newService.preProcedureQA) ? newService.preProcedureQA : [],
//         // postProcedureQA: Array.isArray(newService.postProcedureQA)
//         //   ? newService.postProcedureQA
//         //   : [],

//         procedureQA: newService.procedureQA,
//         preProcedureQA: newService.preProcedureQA,
//         postProcedureQA: newService.postProcedureQA,
//         price: newService.price || 0,
//         discountPercentage: newService.discount || 0,
//         taxPercentage: newService.taxPercentage || 0,
//         // platformFeePercentage: newService.platformFeePercentage || 0,
//         procedureImage: base64ImageToSend,
//         gst: newService.gst || 0,
//         // gstAmount: newService.gstAmount || 0,
//         consultationFee: newService.consultationFee || 0,
//         // ProcedureQA:newService.ProcedureQA
//       }

//       // Log the payload to verify it before sending
//       console.log('Payload for updateSubServiceData:', updatedService)

//       // send cleaned payload
//       const response = await updateServiceData(newService.subServiceId, hospitalId, updatedService)

//       showCustomToast('Procedure updated successfully!', 'success')
//       setEditServiceMode(false)
//       setModalVisible(false)
//       getProcedureClinicId()
//     } catch (error) {
//       console.error('Update failed:', error)
//       // showCustomToast('Error updating service.', 'error')
//     } finally {
//       setSaveLoading(false)
//     }
//   }

//   // Convert file to base64
//   const toBase64 = (file) =>
//     new Promise((resolve, reject) => {
//       const reader = new FileReader()
//       reader.readAsDataURL(file)
//       reader.onload = () => resolve(reader.result)
//       reader.onerror = (error) => reject(error)
//     })

//   const handleServiceDelete = async (serviceId) => {
//     console.log(serviceId)

//     setServiceIdToDelete(serviceId.procedureId)
//     setIsModalVisible(true)
//   }

//   const handleConfirmDelete = async () => {
//     console.log(serviceIdToDelete)
//     const hospitalId = localStorage.getItem('HospitalId')
//     try {
//       setDelLoading(true)
//       const result = await deleteServiceData(serviceIdToDelete, hospitalId)
//       console.log('Service deleted:', result)
//       showCustomToast('Procedure deleted successfully!', 'success')
//       getProcedureClinicId()
//       // fetchData()
//     } catch (error) {
//       console.error('Error deleting Procedure:', error)
//     } finally {
//       setDelLoading(false)
//     }
//     setIsModalVisible(false)
//   }

//   const handleCancelDelete = () => {
//     setIsModalVisible(false)
//     console.log('Service deletion canceled')
//   }

//   const AddCancel = () => {
//     setNewService({
//       serviceName: '',
//       categoryName: '',

//       price: '',
//       discount: 0,
//       taxPercentage: 0,
//       minTime: '',
//       minTimeValue: '', //reset value
//       minTimeUnit: 'minutes', // reset unit
//       status: '',
//       serviceImage: '',
//       viewImage: '',
//       viewDescription: '',
//       consentFormType: '',
//       categoryId: '',
//     })
//     setModalVisible(false)

//     setErrors({})
//   }

//   // ------------------- HANDLERS -------------------
//   const handleChange = (e) => {
//     const { name, value, files, type } = e.target

//     if (type === 'file' && files && files[0]) {
//       const file = files[0]
//       const reader = new FileReader()
//       reader.onloadend = () => {
//         setNewService((prev) => ({
//           ...prev,
//           [name]: reader.result, // full base64 with prefix
//           serviceImageFile: file,
//         }))
//       }

//       reader.readAsDataURL(file)
//     } else {
//       const numericFields = [
//         'consultationFee',
//         'minTimeValue',
//         'price',
//         'discount',
//         'gst',
//         'taxPercentage',
//       ]

//       let newValue = value

//       if (numericFields.includes(name)) {
//         if (name === 'minTimeValue') {
//           newValue = newValue.replace(/\D/g, '') // integers only
//         } else {
//           newValue = newValue.replace(/[^0-9.]/g, '')
//           const parts = newValue.split('.')
//           if (parts.length > 2) newValue = parts[0] + '.' + parts[1]
//         }

//         // Inline validation
//         let error = ''
//         if (newValue === '') {
//           error = 'Must be a valid number.'
//         } else if (isNaN(Number(newValue))) {
//           error = 'Must be a valid number.'
//         } else if (Number(newValue) < 0) {
//           error = 'Must be greater than or equal to 0.'
//         }

//         setErrors((prev) => ({ ...prev, [name]: error }))
//       } else {
//         setErrors((prev) => ({ ...prev, [name]: '' }))
//       }

//       setNewService((prev) => ({ ...prev, [name]: newValue }))
//     }
//   }

//   const handleSubServiceChange = (e) => {
//     const selectedId = e.target.value

//     const selectedItem = isProcedure.find((p) => p.procedureId === selectedId)

//     setNewService((prev) => ({
//       ...prev,
//       subServiceId: selectedId,
//       subServiceName: selectedItem?.procedureName || '',
//     }))
//   }

//   return (
//     <div style={{ overflow: 'hidden' }}>
//       <ToastContainer />

//       <div>
//         <CForm className="d-flex justify-content-end mb-3">
//           {can('Procedure Management', 'create') && (
//             <div
//               className=" w-100"
//               style={{
//                 display: 'flex',
//                 justifyContent: 'end',
//                 alignContent: 'end',
//                 alignItems: 'end',
//               }}
//             >
//               <CButton
//                 style={{
//                   color: 'var(--color-black)',
//                   backgroundColor: 'var(--color-bgcolor)',
//                 }}
//                 onClick={() => openAddModal()}
//               >
//                 Add Procedure Details
//               </CButton>
//             </div>
//           )}
//         </CForm>
//       </div>

//       {viewService && (
//         <CModal
//           visible={!!viewService}
//           onClose={() => setViewService(null)}
//           size="xl"
//           backdrop="static"
//           className="custom-modal"
//         >
//           <CModalHeader className=" text-white">
//             <CModalTitle className="w-100 text-center fs-5 fw-bold">Procedure Details</CModalTitle>
//           </CModalHeader>

//           <CModalBody className="bg-light text-dark">
//             {/* --- Basic Details --- */}
//             <div className="p-3 mb-4 bg-white rounded shadow-sm">
//               <h6 className="fw-bold border-bottom pb-2 mb-3">Basic Information</h6>
//               <CRow className="gy-2">
//                 <CCol sm={6}>
//                   <p className="mb-1 fw-semibold">Procedure Name:</p>
//                   <span className="text-muted">{viewService.procedureName || 'N/A'}</span>
//                 </CCol>
//                 <CCol sm={6}>
//                   <p className="mb-1 fw-semibold">Procedure ID:</p>
//                   <span className="text-muted">{viewService.procedureId || 'N/A'}</span>
//                 </CCol>
//               </CRow>
//             </div>

//             {/* --- Pricing Details --- */}
//             <div className="p-3 mb-4 bg-white rounded shadow-sm">
//               <h6 className="fw-bold border-bottom pb-2 mb-3">Pricing Details</h6>
//               <CRow className="gy-2">
//                 <CCol sm={4}>
//                   <strong>Price:</strong> ₹ {Math.round(viewService.price)}
//                 </CCol>
//                 <CCol sm={4}>
//                   <strong>Discount:</strong> {Math.round(viewService.discountPercentage)}%
//                 </CCol>
//                 <CCol sm={4}>
//                   <strong>Discount Amount:</strong> ₹ {Math.round(viewService.discountAmount)}
//                 </CCol>
//                 <CCol sm={4}>
//                   <strong>Discounted Cost:</strong> ₹ {Math.round(viewService.discountedCost)}
//                 </CCol>
//                 <CCol sm={4}>
//                   <strong>Tax:</strong> {Math.round(viewService.taxPercentage)}%
//                 </CCol>
//                 <CCol sm={4}>
//                   <strong>Tax Amount:</strong> ₹ {Math.round(viewService.taxAmount)}
//                 </CCol>
//                 {/* <CCol sm={4}>
//                   <strong>Platform Fee:</strong> {Math.round(viewService.platformFeePercentage)}%
//                 </CCol>
//                 <CCol sm={4}>
//                   <strong>Platform Fee:</strong> ₹ {Math.round(viewService.platformFee)}
//                 </CCol> */}
//                 <CCol sm={4}>
//                   <strong>Clinic Pay:</strong> ₹ {Math.round(viewService.clinicPay)}
//                 </CCol>
//                 <CCol sm={4}>
//                   <strong>GST %:</strong> {Math.round(viewService.gst)}
//                 </CCol>
//                 <CCol sm={4}>
//                   <strong>Consultation Fee:</strong> ₹ {viewService.consultationFee}
//                 </CCol>
//                 <CCol sm={4}>
//                   <strong>Final Cost:</strong> ₹ {Math.round(viewService.finalCost)}
//                 </CCol>
//                 <CCol sm={4}>
//                   <strong>Service Time:</strong> {formatMinutes(viewService.minTime)}
//                 </CCol>
//               </CRow>
//             </div>

//             {/* --- Q&A Sections --- */}
//             <div className="p-3 mb-4 bg-white rounded shadow-sm">
//               <h6 className="fw-bold border-bottom pb-2 mb-3">Pre-Procedure QA</h6>
//               {Array.isArray(viewService.preProcedureQA) &&
//               viewService.preProcedureQA.length > 0 ? (
//                 viewService.preProcedureQA.map((qa, index) => {
//                   const question = Object.keys(qa)[0]
//                   const answers = qa[question]
//                   return (
//                     <div key={index} className="mb-2">
//                       <strong>{question}</strong>
//                       <ul className="mb-1 text-muted ps-3">
//                         {answers.map((ans, i) => (
//                           <li key={i}>{ans}</li>
//                         ))}
//                       </ul>
//                     </div>
//                   )
//                 })
//               ) : (
//                 <p className="text-muted">No Pre-Procedure Q&A available.</p>
//               )}
//             </div>

//             <div className="p-3 mb-4 bg-white rounded shadow-sm">
//               <h6 className="fw-bold  border-bottom pb-2 mb-3">Procedure QA</h6>
//               {Array.isArray(viewService.procedureQA) && viewService.procedureQA.length > 0 ? (
//                 viewService.procedureQA.map((qa, index) => {
//                   const question = Object.keys(qa)[0]
//                   const answers = qa[question]
//                   return (
//                     <div key={index} className="mb-2">
//                       <strong>{question}</strong>
//                       <ul className="mb-1 text-muted ps-3">
//                         {answers.map((ans, i) => (
//                           <li key={i}>{ans}</li>
//                         ))}
//                       </ul>
//                     </div>
//                   )
//                 })
//               ) : (
//                 <p className="text-muted">No Procedure Q&A available.</p>
//               )}
//             </div>

//             <div className="p-3 mb-4 bg-white rounded shadow-sm">
//               <h6 className="fw-bold border-bottom pb-2 mb-3">Post-Procedure QA</h6>
//               {Array.isArray(viewService.postProcedureQA) &&
//               viewService.postProcedureQA.length > 0 ? (
//                 viewService.postProcedureQA.map((qa, index) => {
//                   const question = Object.keys(qa)[0]
//                   const answers = qa[question]
//                   return (
//                     <div key={index} className="mb-2">
//                       <strong>{question}</strong>
//                       <ul className="mb-1 text-muted ps-3">
//                         {answers.map((ans, i) => (
//                           <li key={i}>{ans}</li>
//                         ))}
//                       </ul>
//                     </div>
//                   )
//                 })
//               ) : (
//                 <p className="text-muted">No Post-Procedure Q&A available.</p>
//               )}
//             </div>

//             {/* --- Image & Description --- */}
//             <div className="p-3 bg-white rounded shadow-sm">
//               <h6 className="fw-bold  border-bottom pb-2 mb-3">Additional Details</h6>
//               <CRow>
//                 <CCol sm={6}>
//                   <p className="fw-semibold">Service Image:</p>
//                   {viewService.procedureImage ? (
//                     <img
//                       src={`data:image/png;base64,${viewService.procedureImage}`}
//                       alt="Service"
//                       style={{
//                         width: '100%',
//                         maxWidth: '250px',
//                         borderRadius: '8px',
//                         border: '1px solid #ddd',
//                       }}
//                     />
//                   ) : (
//                     <p className="text-muted">No image available</p>
//                   )}
//                 </CCol>
//                 <CCol sm={6}>
//                   <p className="fw-semibold">Description:</p>
//                   <p className="text-muted">{viewService.description || 'N/A'}</p>
//                 </CCol>
//               </CRow>
//             </div>
//           </CModalBody>

//           <CModalFooter className="bg-light">
//             <CButton color="secondary" onClick={() => setViewService(null)}>
//               Close
//             </CButton>
//           </CModalFooter>
//         </CModal>
//       )}

//       <CModal
//         visible={modalVisible}
//         onClose={AddCancel} // reuse the same reset logic
//         size="xl"
//         backdrop="static"
//         className="custom-modal"
//       >
//         <CModalHeader>
//           <CModalTitle style={{ textAlign: 'center', width: '100%' }}>
//             {modalMode === 'edit' ? 'Edit Procedure Details' : 'Add New Procedure Details'}
//           </CModalTitle>
//         </CModalHeader>
//         <CModalBody>
//           <CForm>
//             {/* ---------------- CATEGORY / SERVICE / SUB-SERVICE ---------------- */}
//             <CRow>
//               <CCol md={3} className="mb-4">
//                 <h6>
//                   Procedure Name <span className="text-danger">*</span>
//                 </h6>

//                 <CFormSelect
//                   name="subServiceId"
//                   disabled={modalMode === 'edit'}
//                   value={newService.subServiceId || ''}
//                   onChange={handleSubServiceChange}
//                 >
//                   <option value="">Select Procedure</option>

//                   {isProcedure?.map((procedure) => (
//                     <option key={procedure.procedureId} value={procedure.procedureId}>
//                       {procedure.procedureName}
//                     </option>
//                   ))}
//                 </CFormSelect>

//                 {errors.subServiceName && (
//                   <CFormText className="text-danger">{errors.subServiceName}</CFormText>
//                 )}
//               </CCol>
//               <CCol md={3} className="mb-4">
//                 <h6>
//                   Procedure Price <span className="text-danger">*</span>
//                 </h6>
//                 <CFormInput
//                   type="text"
//                   placeholder="Procedure Price"
//                   name="price"
//                   value={newService.price || ''}
//                   onChange={handleChange}
//                   onInput={(e) => {
//                     e.target.value = e.target.value.replace(/[^0-9.]/g, '')
//                   }}
//                 />
//                 {errors.price && <CFormText className="text-danger">{errors.price}</CFormText>}
//               </CCol>
//               <CCol md={3} className="mb-4">
//                 <h6>Discount / Offer (%)</h6>
//                 <CFormInput
//                   type="text"
//                   name="discount"
//                   placeholder="Discount"
//                   value={newService.discount || ''}
//                   onChange={handleChange}
//                   onInput={(e) => {
//                     e.target.value = e.target.value.replace(/[^0-9.]/g, '')
//                   }}
//                 />
//                 {/* {errors.discount && (
//                   <CFormText className="text-danger">{errors.discount}</CFormText>
//                 )} */}
//               </CCol>

//               <CCol md={3} className="mb-4">
//                 <h6>
//                   GST (%)<span className="text-danger"></span>
//                 </h6>
//                 <CFormInput
//                   type="text"
//                   name="gst"
//                   placeholder="GST (%)"
//                   value={newService.gst || ''}
//                   onChange={handleChange}
//                 />
//                 {/* {errors.gst && <CFormText className="text-danger">{errors.gst}</CFormText>} */}
//               </CCol>
//             </CRow>

//             <CRow>
//               <CCol md={3} className="mb-4  ">
//                 <h6>Other Taxes (%)</h6>
//                 <CFormInput
//                   type="text"
//                   name="taxPercentage"
//                   placeholder="Tax Percentage"
//                   value={newService.taxPercentage || ''}
//                   onChange={handleChange}
//                   onInput={(e) => {
//                     e.target.value = e.target.value.replace(/[^0-9.]/g, '')
//                   }}
//                 />
//               </CCol>
//               <CCol md={3} className="mb-4">
//                 <h6>Offer Start Date</h6>

//                 <CFormInput
//                   type="date"
//                   name="offerValidDate"
//                   min={new Date().toISOString().split('T')[0]} // 👈 today as minimum
//                   value={newService.offerValidDate || ''}
//                   onChange={handleChange}
//                 />
//               </CCol>
//               <CCol md={3} className="mb-4">
//                 <h6>Offer End Date</h6>

//                 <CFormInput
//                   type="date"
//                   name="offerEndDate"
//                   min={new Date().toISOString().split('T')[0]} // 👈 today as minimum
//                   value={newService.offerEndDate || ''}
//                   onChange={handleChange}
//                 />
//               </CCol>
//               <CCol md={3} className="mb-4">
//                 <h6>
//                   No of Sittings <span className="text-danger">*</span>
//                 </h6>
//                 <CFormInput
//                   type="text"
//                   name="sittings"
//                   value={newService.sittings || ''}
//                   onChange={handleChange}
//                   placeholder="Enter no of sittings"
//                 />

//                 {errors.sittings && (
//                   <CFormText className="text-danger">{errors.sittings}</CFormText>
//                 )}
//               </CCol>
//             </CRow>

//             {/* ---------------- IMAGE / DESCRIPTION / STATUS ---------------- */}
//             <CRow>
//               <CCol md={3} className="mb-4">
//                 <h6>
//                   Consultation Fee <span className="text-danger">*</span>
//                 </h6>
//                 <CFormInput
//                   type="text"
//                   name="consultationFee"
//                   value={newService.consultationFee || ''}
//                   onChange={handleChange}
//                   placeholder="Enter Consultation Fee"
//                 />

//                 {errors.consultationFee && (
//                   <CFormText className="text-danger">{errors.consultationFee}</CFormText>
//                 )}
//               </CCol>
//               <CCol md={3} className="mb-4">
//                 <h6>
//                   Min Time <span className="text-danger">*</span>
//                 </h6>
//                 <div className="d-flex">
//                   <CFormInput
//                     type="text"
//                     name="minTimeValue"
//                     placeholder="Enter time"
//                     value={newService.minTimeValue || ''} // will show 45
//                     onChange={handleChange}
//                     onInput={(e) => {
//                       e.target.value = e.target.value.replace(/[^0-9]/g, '')
//                     }}
//                   />
//                   <CFormSelect
//                     name="minTimeUnit"
//                     className="ms-2"
//                     value={newService.minTimeUnit || ''} // will show minutes
//                     onChange={handleChange}
//                   >
//                     <option value="" disabled>
//                       Select Time
//                     </option>
//                     <option value="minutes">Minutes</option>
//                     <option value="hours">Hours</option>
//                   </CFormSelect>
//                 </div>

//                 {/* Separate error messages for value and unit */}
//                 {errors.minTimeValue && (
//                   <CFormText className="text-danger">{errors.minTimeValue}</CFormText>
//                 )}
//                 {errors.minTimeUnit && (
//                   <CFormText className="text-danger">{errors.minTimeUnit}</CFormText>
//                 )}
//               </CCol>
//               <CCol md={3} className="mb-4">
//                 <h6>
//                   Procedure Image <span className="text-danger">*</span>
//                 </h6>

//                 <CFormInput
//                   type="file"
//                   accept="image/*"
//                   name="serviceImage"
//                   onChange={(e) => {
//                     const file = e.target.files[0]
//                     if (file) {
//                       const reader = new FileReader()
//                       reader.onloadend = () => {
//                         // Store full base64 string including mime type
//                         setNewService({
//                           ...newService,
//                           serviceImage: reader.result, // full data URL
//                         })
//                       }
//                       reader.readAsDataURL(file)
//                     }
//                   }}
//                 />

//                 {newService?.serviceImage && (
//                   <img
//                     src={
//                       newService.serviceImage.startsWith('data:')
//                         ? newService.serviceImage
//                         : `data:image/jpeg;base64,${newService.serviceImage}`
//                     } // handle API base64
//                     alt="Preview"
//                     style={{ width: 100, height: 100, marginTop: 10, objectFit: 'cover' }}
//                   />
//                 )}

//                 {errors.serviceImage && (
//                   <CFormText className="text-danger">{errors.serviceImage}</CFormText>
//                 )}
//               </CCol>

//               <CCol md={3}>
//                 <h6>
//                   View Description <span className="text-danger">*</span>
//                 </h6>
//                 <CFormTextarea
//                   type="text"
//                   placeholder="View Description"
//                   name="viewDescription"
//                   value={newService.viewDescription || ''}
//                   onChange={handleChange}
//                 />
//                 {errors.viewDescription && (
//                   <CFormText className="text-danger">{errors.viewDescription}</CFormText>
//                 )}
//               </CCol>
//             </CRow>

//             {/* ---------------- PROCEDURE QA ---------------- */}
//             <h6 className="mt-3">Procedure (Optional)</h6>
//             <ProcedureQA
//               preQAList={newService.preProcedureQA}
//               setPreQAList={(data) => setNewService((prev) => ({ ...prev, preProcedureQA: data }))}
//               procedureQAList={newService.procedureQA}
//               setProcedureQAList={(data) =>
//                 setNewService((prev) => ({ ...prev, procedureQA: data }))
//               }
//               postQAList={newService.postProcedureQA}
//               setPostQAList={(data) =>
//                 setNewService((prev) => ({ ...prev, postProcedureQA: data }))
//               }
//             />
//           </CForm>
//         </CModalBody>

//         <CModalFooter>
//           <CButton color="secondary" onClick={AddCancel}>
//             Cancel
//           </CButton>
//           <CButton
//             color="info"
//             className="pink-Btn"
//             onClick={modalMode === 'edit' ? handleUpdateService : handleAddService}
//             disabled={saveloading}
//           >
//             {saveloading && (
//               <span className="spinner-border text-white spinner-border-sm me-2"></span>
//             )}
//             {saveloading
//               ? modalMode === 'edit'
//                 ? 'Updating...'
//                 : 'Saving...'
//               : modalMode === 'edit'
//                 ? 'Update'
//                 : 'Save'}
//           </CButton>
//         </CModalFooter>
//       </CModal>

//       {loading ? (
//         <div className="d-flex justify-content-center align-items-center">
//           <LoadingIndicator message="Loading Procedure..." />
//         </div>
//       ) : error ? (
//         <div
//           className="d-flex justify-content-center align-items-center"
//           style={{
//             height: '50vh', // full screen height

//             color: 'var(--color-black)',
//           }}
//         >
//           {error}
//         </div>
//       ) : (
//         <CTable striped hover responsive>
//           <CTableHead className="pink-table w-auto">
//             <CTableRow>
//               <CTableHeaderCell style={{ paddingLeft: '40px' }}>S.No</CTableHeaderCell>
//               <CTableHeaderCell>Procedure Name</CTableHeaderCell>
//               <CTableHeaderCell>Discount % </CTableHeaderCell>
//               <CTableHeaderCell>Offer date</CTableHeaderCell>
//               <CTableHeaderCell>Price</CTableHeaderCell>
//               <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
//             </CTableRow>
//           </CTableHead>
//           <CTableBody className="pink-table">
//             {displayData.length > 0 ? (
//               displayData.map((test, index) => (
//                 <CTableRow key={test.id}>
//                   <CTableDataCell style={{ paddingLeft: '40px' }}>
//                     {(currentPage - 1) * rowsPerPage + index + 1}
//                   </CTableDataCell>
//                   <CTableDataCell>{capitalizeWords(test.procedureName)}</CTableDataCell>
//                   <CTableDataCell>{test.discountPercentage || 'NA'}</CTableDataCell>
//                   <CTableDataCell>{new Date().toLocaleDateString('en-GB')}</CTableDataCell>

//                   <CTableDataCell>₹{test.price || 'NA'}</CTableDataCell>
//                   <CTableDataCell className="text-end">
//                     <div className="d-flex justify-content-end gap-2  ">
//                       {can('Procedure Management', 'read') && (
//                         <button
//                           className="actionBtn"
//                           onClick={() => setViewService(test)}
//                           title="View"
//                         >
//                           <Eye size={18} />
//                         </button>
//                       )}
//                       {can('Procedure Management', 'update') && (
//                         <button
//                           className="actionBtn"
//                           onClick={() => openEditModal(test)}
//                           title="Edit"
//                         >
//                           <Edit2 size={18} />
//                         </button>
//                       )}

//                       {can('Procedure Management', 'delete') && (
//                         <button
//                           className="actionBtn"
//                           onClick={() => handleServiceDelete(test)}
//                           title="Delete"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       )}
//                       <ConfirmationModal
//                         isVisible={isModalVisible}
//                         title="Delete Procedure"
//                         message="Are you sure you want to delete this procedure? This action cannot be undone."
//                         confirmText={
//                           delloading ? (
//                             <>
//                               <span
//                                 className="spinner-border spinner-border-sm me-2 text-white"
//                                 role="status"
//                               />
//                               Deleting...
//                             </>
//                           ) : (
//                             'Yes, Delete'
//                           )
//                         }
//                         cancelText="Cancel"
//                         confirmColor="danger"
//                         cancelColor="secondary"
//                         onConfirm={handleConfirmDelete}
//                         onCancel={handleCancelDelete}
//                       />
//                     </div>
//                   </CTableDataCell>
//                 </CTableRow>
//               ))
//             ) : (
//               <CTableRow>
//                 <CTableDataCell colSpan={5} className="text-center text-muted">
//                   🔍 No procedure found"
//                 </CTableDataCell>
//               </CTableRow>
//             )}
//           </CTableBody>
//         </CTable>
//       )}
//       {displayData.length > 0 && (
//         <Pagination
//           currentPage={currentPage}
//           totalPages={Math.ceil(filteredData.length / rowsPerPage)}
//           pageSize={rowsPerPage}
//           onPageChange={setCurrentPage}
//           onPageSizeChange={setRowsPerPage}
//         />
//       )}
//     </div>
//   )
// }

// export default ServiceManagement
// ServiceManagement.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { CButton, CForm } from '@coreui/react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { deleteServiceData, postServiceData, updateServiceData } from './ProcedureManagementAPI'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
import { useHospital } from '../Usecontext/HospitalContext'
import { showCustomToast } from '../../Utils/Toaster'
import LoadingIndicator from '../../Utils/loader'
import Pagination from '../../Utils/Pagination'
import ConfirmationModal from '../../components/ConfirmationModal'
import { getAllProcedures, getProcedurePricingByClinicId } from '../NGK/APIs/procedureService'

import ServiceFormModal from './ServiceFormModal'
import ServiceViewModal from './ServiceViewModal'
import ServiceTable from './ServiceTable'

const ServiceManagement = () => {
  // ---------- MASTER DATA ----------
  const [isProcedure, setIsProcedure] = useState([]) // All procedures for dropdown
  const [procedurePricing, setProcedurePricing] = useState([]) // Clinic pricing list

  // ---------- UI & STATE ----------
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [viewService, setViewService] = useState(null)

  const [saveloading, setSaveLoading] = useState(false)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [serviceIdToDelete, setServiceIdToDelete] = useState(null)
  const [delloading, setDelLoading] = useState(false)

  // ---------- FORM STATE ----------
  const [newService, setNewService] = useState({
    subServiceId: '',
    subServiceName: '',
    price: '',
    discount: '',
    gst: '',
    gstAmount: 0,
    taxPercentage: '',
    consultationFee: '',
    minTimeValue: '',
    minTimeUnit: '',
    sittings: '',
    offerValidDate: '',
    offerEndDate: '',
    serviceImage: '',
    serviceImageFile: null,
    viewDescription: '',
    procedureQA: [],
    preProcedureQA: [],
    postProcedureQA: [],
  })

  const [errors, setErrors] = useState({
    subServiceName: '',
    price: '',
    discount: '',
    taxPercentage: '',
    consultationFee: '',
    minTimeValue: '',
    minTimeUnit: '',
    sittings: '',
    viewDescription: '',
    serviceImage: '',
  })

  // ---------- GLOBAL SEARCH & PAGINATION ----------
  const { searchQuery } = useGlobalSearch()
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  // ---------- HELPERS ----------

  // Filter list by global search
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return procedurePricing
    return procedurePricing.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, procedurePricing])

  // Paginated data
  const displayData = useMemo(
    () => filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage),
    [filteredData, currentPage, rowsPerPage],
  )

  // Format minutes into "1 hr 30 min"
  const formatMinutes = (minTime) => {
    const minutes = parseInt(minTime, 10)
    if (isNaN(minutes)) return 'Invalid time'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMins = minutes % 60
    return remainingMins === 0
      ? `${hours} hour${hours > 1 ? 's' : ''}`
      : `${hours} hour${hours > 1 ? 's' : ''} ${remainingMins} min`
  }

  // ---------- API CALLS ----------

  // Get master procedures for dropdown
  const fetchProcedures = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getAllProcedures()
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setIsProcedure(list)
      if (!list.length) console.warn('Procedures not found.')
    } catch (err) {
      console.error('Error fetching procedures:', err)
      setError('Failed to fetch procedures. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Get clinic pricing by clinicId
  const fetchProcedurePricing = async () => {
    try {
      const clinicId = localStorage.getItem('HospitalId')
      const data = await getProcedurePricingByClinicId(clinicId)
      setProcedurePricing(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load pricing:', err)
    }
  }

  useEffect(() => {
    fetchProcedures()
    fetchProcedurePricing()
  }, [])

  // ---------- VALIDATION ----------

  const validateForm = () => {
    const newErrors = {}

    if (!newService.subServiceId || newService.subServiceId.trim() === '') {
      newErrors.subServiceName = 'Procedure is required.'
    }

    if (!newService.price || !/^\d+(\.\d{1,2})?$/.test(newService.price)) {
      newErrors.price = 'Procedure Price must be a valid number.'
    } else if (Number(newService.price) < 100) {
      newErrors.price = 'Procedure Price must be at least 100.'
    }

    if (!newService.consultationFee || newService.consultationFee.trim() === '') {
      newErrors.consultationFee = 'Consultation Fee is required.'
    } else if (!/^\d+(\.\d{1,2})?$/.test(newService.consultationFee)) {
      newErrors.consultationFee = 'Consultation Fee must be a valid number.'
    } else if (Number(newService.consultationFee) < 0) {
      newErrors.consultationFee = 'Consultation Fee must be greater than or equal to 0.'
    }

    if (!newService.minTimeValue || newService.minTimeValue.trim() === '') {
      newErrors.minTimeValue = 'Enter minimum time.'
    } else if (!/^\d+$/.test(newService.minTimeValue)) {
      newErrors.minTimeValue = 'Minimum time must be a number.'
    } else if (Number(newService.minTimeValue) <= 0) {
      newErrors.minTimeValue = 'Minimum time must be greater than zero.'
    }

    if (!newService.minTimeUnit) {
      newErrors.minTimeUnit = 'Please select a time unit.'
    }

    if (!newService.viewDescription || newService.viewDescription.trim() === '') {
      newErrors.viewDescription = 'View description is required.'
    }

    if (!newService.serviceImage) {
      newErrors.serviceImage = 'Please upload a procedure image.'
    }

    if (!newService.sittings || newService.sittings.trim() === '') {
      newErrors.sittings = 'Number of sittings is required.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ---------- HANDLERS: FORM FIELDS ----------

  const handleChange = (e) => {
    const { name, value, files, type } = e.target

    if (type === 'file' && files && files[0]) {
      const file = files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewService((prev) => ({
          ...prev,
          [name]: reader.result, // full base64 data URL
          serviceImageFile: file,
        }))
      }
      reader.readAsDataURL(file)
      return
    }

    const numericFields = [
      'consultationFee',
      'minTimeValue',
      'price',
      'discount',
      'gst',
      'taxPercentage',
      'sittings',
    ]

    let newValue = value

    if (numericFields.includes(name)) {
      if (name === 'minTimeValue') {
        newValue = newValue.replace(/\D/g, '')
      } else {
        newValue = newValue.replace(/[^0-9.]/g, '')
        const parts = newValue.split('.')
        if (parts.length > 2) newValue = parts[0] + '.' + parts[1]
      }

      let error = ''
      if (newValue === '') {
        error = 'Must be a valid number.'
      } else if (isNaN(Number(newValue))) {
        error = 'Must be a valid number.'
      } else if (Number(newValue) < 0) {
        error = 'Must be greater than or equal to 0.'
      }

      setErrors((prev) => ({ ...prev, [name]: error }))
    } else {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }

    setNewService((prev) => ({ ...prev, [name]: newValue }))
  }

  const handleSubServiceChange = (e) => {
    const selectedId = e.target.value
    const selectedItem = isProcedure.find((p) => p.procedureId === selectedId)

    setNewService((prev) => ({
      ...prev,
      subServiceId: selectedId,
      subServiceName: selectedItem?.procedureName || '',
    }))
  }

  // ---------- HANDLERS: MODAL OPEN/CLOSE ----------

  const resetForm = () => {
    setNewService({
      subServiceId: '',
      subServiceName: '',
      price: '',
      discount: '',
      gst: '',
      gstAmount: 0,
      taxPercentage: '',
      consultationFee: '',
      minTimeValue: '',
      minTimeUnit: '',
      sittings: '',
      offerValidDate: '',
      offerEndDate: '',
      serviceImage: '',
      serviceImageFile: null,
      viewDescription: '',
      procedureQA: [],
      preProcedureQA: [],
      postProcedureQA: [],
    })
    setErrors({})
  }

  const toInstant = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).toISOString()
  }

  const toDateInput = (isoString) => {
    if (!isoString) return ''
    return isoString.split('T')[0] // keeps only YYYY-MM-DD
  }

  const openAddModal = () => {
    setModalMode('add')
    resetForm()
    setModalVisible(true)
  }

  // Prefill form for edit
  const openEditModal = (service) => {
    setModalMode('edit')
    setModalVisible(true)

    const rawImage = service.procedureImage || ''
    const fullImage = rawImage.startsWith('data:')
      ? rawImage
      : rawImage
        ? `data:image/jpeg;base64,${rawImage}`
        : ''

    const [timeValue, timeUnit] = service.minTime ? service.minTime.split(' ') : ['', '']

    setNewService({
      subServiceId: service.procedureId,
      subServiceName: service.procedureName,

      price: String(service.price ?? ''),
      discount: String(service.discountPercentage ?? ''),
      gst: String(service.gst ?? ''),
      gstAmount: service.gstAmount ?? 0,
      taxPercentage: String(service.taxPercentage ?? ''),
      consultationFee: String(service.consultationFee ?? ''),
      minTimeValue: timeValue,
      minTimeUnit: timeUnit || '',
      sittings: String(service.sittings ?? ''),

      // offerValidDate: service.offerStart || '',
      // offerEndDate: service.offerValidDate || '',
      offerValidDate: toDateInput(service.offerStart),
      offerEndDate: toDateInput(service.offerValidDate),

      serviceImage: fullImage,
      serviceImageFile: null,

      viewDescription: service.description || '',
      procedureQA: service.procedureQA || [],
      preProcedureQA: service.preProcedureQA || [],
      postProcedureQA: service.postProcedureQA || [],
    })

    setErrors({})
  }

  const handleCloseFormModal = () => {
    setModalVisible(false)
    resetForm()
  }

  // ---------- ADD / UPDATE / DELETE ----------

  const handleAddService = async () => {
    if (!validateForm()) return

    try {
      setSaveLoading(true)

      const price = Number(newService.price || 0)
      const discount = Number(newService.discount || 0)
      const gst = Number(newService.gst || 0)
      const taxPercentage = Number(newService.taxPercentage || 0)
      const consultationFee = Number(newService.consultationFee || 0)

      const discountAmount = (price * discount) / 100
      const gstAmount = (price * gst) / 100
      const discountedCost = price - discountAmount
      const taxAmount = (discountedCost * taxPercentage) / 100
      const clinicPay = discountedCost + taxAmount
      const finalCost = clinicPay + gstAmount + consultationFee
      const formattedMinTime = `${newService.minTimeValue} ${newService.minTimeUnit}`

      const base64ImageToSend = newService.serviceImage?.startsWith('data:')
        ? newService.serviceImage.split(',')[1]
        : newService.serviceImage

      const payload = {
        clinicId: localStorage.getItem('HospitalId'),
        procedureName: newService.subServiceName,
        procedureId: newService.subServiceId,
        sittings: Number(newService.sittings || 0),
        price,
        discountPercentage: discount,
        taxPercentage,
        finalCost,
        gst,
        gstAmount,
        consultationFee,
        minTime: formattedMinTime,
        offerStart: toInstant(newService.offerValidDate),
        offerValidDate: toInstant(newService.offerEndDate),
        procedureImage: base64ImageToSend,
        procedureQA: newService.procedureQA,
        preProcedureQA: newService.preProcedureQA,
        postProcedureQA: newService.postProcedureQA,
        description: newService.viewDescription,
      }

      const response = await postServiceData(payload) // imported from ProcedureManagementAPI
      if (response.data.success || response.status === 200) {
        showCustomToast(response.data.message, 'success')
        handleCloseFormModal()
        fetchProcedurePricing()
      }
    } catch (error) {
      console.error('Error in handleAddService:', error?.response || error)
      showCustomToast(error?.response?.data?.message || 'Something went wrong', 'error')
    } finally {
      setSaveLoading(false)
    }
  }

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })

  const handleUpdateService = async () => {
    try {
      setSaveLoading(true)

      const hospitalId = localStorage.getItem('HospitalId')

      let base64ImageToSend = ''
      if (newService.serviceImageFile) {
        const fullBase64String = await toBase64(newService.serviceImageFile)
        base64ImageToSend = fullBase64String.split(',')[1]
      } else if (newService.serviceImage?.startsWith('data:')) {
        base64ImageToSend = newService.serviceImage.split(',')[1]
      } else {
        base64ImageToSend = newService.serviceImage || ''
      }

      const updatedService = {
        clinicId: hospitalId,
        procedureName: newService.subServiceName || '',
        procedureId: newService.subServiceId || '',
        description: newService.viewDescription || '',
        sittings: Number(newService.sittings || 0),
        minTime: newService.minTimeValue
          ? `${newService.minTimeValue} ${newService.minTimeUnit}`
          : '',
        offerStart: toInstant(newService.offerValidDate || ''),
        offerValidDate: toInstant(newService.offerEndDate || ''),
        procedureQA: newService.procedureQA,
        preProcedureQA: newService.preProcedureQA,
        postProcedureQA: newService.postProcedureQA,
        price: Number(newService.price || 0),
        discountPercentage: Number(newService.discount || 0),
        taxPercentage: Number(newService.taxPercentage || 0),
        procedureImage: base64ImageToSend,
        gst: Number(newService.gst || 0),
        consultationFee: Number(newService.consultationFee || 0),
      }

      const response = await updateServiceData(newService.subServiceId, hospitalId, updatedService) // imported from ProcedureManagementAPI

      if (response.success) {
        showCustomToast('Procedure updated successfully!', 'success')
        handleCloseFormModal()

        fetchProcedurePricing()
      }
    } catch (error) {
      console.error('Update failed:', error)
      showCustomToast(error?.response?.data?.message || 'Error updating service.', 'error')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleServiceDelete = (item) => {
    setServiceIdToDelete(item.procedureId)
    setIsModalVisible(true)
  }

  const handleConfirmDelete = async () => {
    const hospitalId = localStorage.getItem('HospitalId')
    try {
      setDelLoading(true)
      const result = await deleteServiceData(serviceIdToDelete, hospitalId)
      console.log('Service deleted:', result)
      showCustomToast('Procedure deleted successfully!', 'success')
      fetchProcedurePricing()
    } catch (error) {
      console.error('Error deleting Procedure:', error)
    } finally {
      setDelLoading(false)
      setIsModalVisible(false)
    }
  }

  const handleCancelDelete = () => setIsModalVisible(false)

  // ---------- RENDER ----------

  return (
    <div style={{ overflow: 'hidden' }}>
      <ToastContainer />

      {/* Top Right "Add" Button (if needed) */}
      <div>
        <CForm className="d-flex justify-content-end mb-3">
          {can('Procedure Management', 'create') && (
            <div
              className="w-100"
              style={{ display: 'flex', justifyContent: 'end', alignItems: 'end' }}
            >
              <CButton
                style={{
                  color: 'var(--color-black)',
                  backgroundColor: 'var(--color-bgcolor)',
                }}
                onClick={openAddModal}
              >
                Add Procedure Details
              </CButton>
            </div>
          )}
        </CForm>
      </div>

      {/* View Modal */}
      {viewService && (
        <ServiceViewModal
          visible={!!viewService}
          data={viewService}
          onClose={() => setViewService(null)}
          formatMinutes={formatMinutes}
        />
      )}

      {/* Add / Edit Modal */}
      <ServiceFormModal
        visible={modalVisible}
        mode={modalMode}
        onClose={handleCloseFormModal}
        onSave={handleAddService}
        onUpdate={handleUpdateService}
        saveloading={saveloading}
        newService={newService}
        errors={errors}
        isProcedure={isProcedure}
        onChange={handleChange}
        onSubServiceChange={handleSubServiceChange}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Procedure"
        message="Are you sure you want to delete this procedure? This action cannot be undone."
        confirmText={
          delloading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2 text-white" role="status" />
              Deleting...
            </>
          ) : (
            'Yes, Delete'
          )
        }
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* List / Table */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <LoadingIndicator message="Loading Procedures..." />
        </div>
      ) : error ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: '50vh', color: 'var(--color-black)' }}
        >
          {error}
        </div>
      ) : (
        <>
          <ServiceTable
            data={displayData}
            canRead={can('Procedure Management', 'read')}
            canUpdate={can('Procedure Management', 'update')}
            canDelete={can('Procedure Management', 'delete')}
            onView={setViewService}
            onEdit={openEditModal}
            onDelete={handleServiceDelete}
          />

          {displayData.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredData.length / rowsPerPage)}
              pageSize={rowsPerPage}
              onPageChange={setCurrentPage}
              onPageSizeChange={setRowsPerPage}
            />
          )}
        </>
      )}
    </div>
  )
}

export default ServiceManagement
