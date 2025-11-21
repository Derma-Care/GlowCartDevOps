import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import FileInput from './FileInput'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormLabel,
  CFormInput,
  CFormFeedback,
  CFormSelect,
  CButton,
  CRow,
  CCol,
  CTooltip,
  CFormCheck,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { BASE_URL, CLINIC_REGISTRATION_URL, ClinicAllData, getAllQuestions, postAllQuestionsAndAnswers } from '../../baseUrl'
import { CategoryData } from '../categoryManagement/CategoryAPI'
import sendDermaCareOnboardingEmail from '../../Utils/Emailjs'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getClinicTimings } from './AddClinicAPI'

const ClinicRegistration = () => {
  const refs = {
    contractorDocuments: useRef(),
    hospitalDocuments: useRef(),
    clinicalEstablishmentCertificate: useRef(),
    businessRegistrationCertificate: useRef(),
    pharmacistCertificate: useRef(),
    biomedicalWasteManagementAuth: useRef(),
    fireSafetyCertificate: useRef(),
    professionalIndemnityInsurance: useRef(),
    gstRegistrationCertificate: useRef(),
    hospitalLogo: useRef(),
    clinicContract: useRef(),
    drugLicenceCertificate: useRef(),
    drugLicenceFormType20_21: useRef(),
    tradeLicence: useRef(),
    drugLicenseCertificate: useRef(),
    drugLicenseFormType: useRef(),
  };

  const savedQuestionId = localStorage.getItem("savedQuestionId");
  const navigate = useNavigate(); // ✅ add this

  const [errors, setErrors] = useState({})
  const [categories, setCategories] = useState([])
  const [selectedOption, setSelectedOption] = useState('')
  const [selectedPharmacistOption, setSelectedPharmacistOption] = useState('')
  const [clinicTypeOption, setClinicTypeOption] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timings, setTimings] = useState([])
  const [loadingTimings, setLoadingTimings] = useState(false)
  const [nabhQuestions, setNabhQuestions] = useState([]);
  const [nabhAnswers, setNabhAnswers] = useState([]);
  const [showNabhModal, setShowNabhModal] = useState(false);
  const [nabhScore, setNabhScore] = useState(null);
  const [nabhSubmitted, setNabhSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    contactNumber: '',
    openingTime: '',
    closingTime: '',
    hospitalLogo: null,
    emailAddress: '',
    website: '',
    licenseNumber: '',
    issuingAuthority: '',
    recommended: false,
    clinicSoftware: false,
    hospitalDocuments: null,
    contractorDocuments: null,
    freeFollowUps: '',
    clinicalEstablishmentCertificate: null,
    businessRegistrationCertificate: null,
    clinicType: '',                           // (Existing)
    medicinesSoldOnSite: false,
    drugLicenseCertificate: null,
    drugLicenseFormType: null,
    hasPharmacist: '',
    pharmacistCertificate: null,
    biomedicalWasteManagementAuth: null,
    tradeLicense: null,
    fireSafetyCertificate: null,
    professionalIndemnityInsurance: null,
    gstRegistrationCertificate: null,
    others: [],
    consultationExpiration: '',
    subscription: '',
    instagramHandle: '',
    twitterHandle: '',
    facebookHandle: '',
    latitude: "",
    longitude: "",
    walkthrough: "",
    branch: "",
    nabhScore: nabhScore,

    // 👇 Newly added fields
    clinicSpecializationType: '',             // Dermatology / Aesthetic / Cosmetology / Multi-specialty
    primaryContactPerson: '',
    designation: '',
    alternateContactNumber: '',
    clinicManagementSoftwareUsage: '',        // yes/no or name of software
    bankAccountName: '',
    bankAccountNumber: '',
    ifscCode: '',
    upiId: '',
    panNumber: ''
  });


  //get timings
  useEffect(() => {
    const fetchTimings = async () => {
      setLoadingTimings(true)
      const result = await getClinicTimings()
      if (result.success) {
        setTimings(result.data)
      } else {
        toast.error(result.message || 'Failed to fetch clinic timings')
      }
      setLoadingTimings(false)
    }

    fetchTimings()
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await CategoryData()

        if (response?.data) {
          setCategories(response.data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const preventNumberInput = (e) => {
    const isNumber = /[0-9]/.test(e.key)
    if (isNumber) {
      e.preventDefault()
    }

  }

  const websiteRegex = /^(https?:\/\/)[\w\-]+(\.[\w\-]+)+[/#?]?.*$/
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/

  const validateForm = () => {
    const newErrors = {}

    // Hospital Name
    if (!formData.name?.trim()) {
      newErrors.name = 'Clinic name is required'
    } else if (!/^[a-zA-Z\s]{2,50}$/.test(formData.name)) {
      newErrors.name = 'Clinic name must contain only letters'
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    // City validation
    if (!formData.city?.trim()) {
      newErrors.city = 'City is required'
    } else if (!/^[a-zA-Z\s]{2,30}$/.test(formData.city)) {
      newErrors.city = 'City name must contain only letters'
    }
    // Email validation-
    if (!formData.emailAddress?.trim()) {
      newErrors.emailAddress = 'Email is required';
    } else if (formData.emailAddress.includes(' ')) {
      newErrors.emailAddress = 'Email cannot contain spaces';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
      newErrors.emailAddress = 'Email must contain "@" and "." in a valid format';
    }

    // Contact Number
    const phoneRegex = /^[5-9][0-9]{9}$/ // This regex checks if the number starts with 5-9 and is followed by 9 digits

    if (!formData.contactNumber?.trim()) {
      newErrors.contactNumber = 'Contact number is required'
    } else {
      const contactNumber = formData.contactNumber.trim()
      if (contactNumber.length !== 10) {
        newErrors.contactNumber = 'Contact number must be exactly 10 digits long'
      } else if (!phoneRegex.test(contactNumber)) {
        newErrors.contactNumber = 'Contact number must start with a digit between 5 and 9'
      }
    }

    // Time validation
    // Time validation
    if (!formData.openingTime) {
      newErrors.openingTime = 'Opening time is required'
    }

    if (!formData.closingTime) {
      newErrors.closingTime = 'Closing time is required'
    } else if (formData.openingTime && formData.closingTime) {
      const parseTime = (timeStr) => {
        const [time, modifier] = timeStr.split(' ')
        let [hours, minutes] = time.split(':').map(Number)

        if (modifier === 'PM' && hours !== 12) {
          hours += 12
        } else if (modifier === 'AM' && hours === 12) {
          hours = 0
        }

        return new Date(0, 0, 0, hours, minutes)
      }

      const openingDate = parseTime(formData.openingTime)
      const closingDate = parseTime(formData.closingTime)

      if (closingDate <= openingDate) {
        newErrors.closingTime = 'Closing time must be after opening time'
      }
    }

    //consultation Expiration
    if (!formData.consultationExpiration) {
      newErrors.consultationExpiration = 'Consultation days are required'
    } else if (isNaN(formData.consultationExpiration) || formData.consultationExpiration < 0) {
      newErrors.consultationExpiration = 'Enter a valid number greater than 0'
    }

    // License Number
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required'
    }

    // Issuing Authority
    if (!formData.issuingAuthority.trim()) {
      newErrors.issuingAuthority = 'Issuing Authority is required'
    }

    // Hospital Logo
    if (!formData.hospitalLogo) {
      newErrors.hospitalLogo = 'Hospital logo is required'
    }

    // Hospital Documents
    if (!formData.hospitalDocuments) {
      newErrors.hospitalDocuments = 'Please upload the document'
    }
    if (!formData.contractorDocuments) {
      newErrors.contractorDocuments = 'Please upload the document'
    }
    if (!formData.clinicalEstablishmentCertificate) {
      newErrors.clinicalEstablishmentCertificate = 'Please upload at least one document'
    }
    if (!formData.businessRegistrationCertificate) {
      newErrors.businessRegistrationCertificate = 'Please upload at least one document'
    }
    if (!formData.drugLicenseCertificate && selectedOption === 'Yes') {
      newErrors.drugLicenseCertificate = 'Please upload at least one document'
    }
    if (!formData.drugLicenseFormType && selectedOption === 'Yes') {
      newErrors.drugLicenseFormType = 'Please upload at least one document'
    }
    if (
      selectedOption === 'Yes' &&
      selectedPharmacistOption === 'Yes' &&
      !formData.pharmacistCertificate
    ) {
      newErrors.pharmacistCertificate = 'Please upload at least one document'
    }

    if (!formData.biomedicalWasteManagementAuth) {
      newErrors.biomedicalWasteManagementAuth = 'Please upload at least one document'
    }
    if (!formData.tradeLicense) {
      newErrors.tradeLicense = 'Please upload at least one document'
    }
    if (!formData.fireSafetyCertificate) {
      newErrors.fireSafetyCertificate = 'Please upload at least one document'
    }
    // if (!formData.professionalIndemnityInsurance) {
    //   newErrors.professionalIndemnityInsurance = 'Please upload at least one document'
    // }
    if (!formData.gstRegistrationCertificate) {
      newErrors.gstRegistrationCertificate = 'Please upload at least one document'
    }

    if (!formData.clinicType || formData.clinicType.trim() === "") {
      newErrors.clinicType = "Please select a clinic type.";
    }
    if (!selectedPharmacistOption || selectedPharmacistOption.trim() === '') {
      newErrors.hasPharmacist = 'Please select whether clinic has a valid pharmacist.'
    }

    if (!formData.website.trim()) {
      newErrors.website = 'Website is required.'
    } else {
      const cleanedWebsite = formData.website.replace(/\s+/g, '') // remove all spaces
      if (!websiteRegex.test(normalizeWebsite(cleanedWebsite))) {
        newErrors.website = 'Website must start with http:// or https:// and be a valid URL'
      }
    }

    if (!formData.subscription || formData.subscription.trim() === '') {
      newErrors.subscription = 'Please select a subscription type'
    }
    // Latitude validation
    // Latitude
    if (!formData.latitude) {
      newErrors.latitude = "Latitude is required";
    } else {
      const lat = parseFloat(formData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.latitude = "Latitude must be between -90 and 90";
      } else {
        delete newErrors.latitude; // ✅ clear error if valid
      }
    }

    // Longitude
    if (!formData.longitude) {
      newErrors.longitude = "Longitude is required";
    } else {
      const lng = parseFloat(formData.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.longitude = "Longitude must be between -180 and 180";
      } else {
        delete newErrors.longitude; // ✅ clear error if valid
      }
    }
    // 🔹 Clinic Specialization Type
    if (!formData.clinicSpecializationType?.trim()) {
      newErrors.clinicSpecializationType = "Clinic Specialization Type is required"
    }

    // 🔹 Primary Contact Person
    if (!formData.primaryContactPerson?.trim()) {
      newErrors.primaryContactPerson = "Primary contact person is required"
    } else if (!/^[a-zA-Z\s]{2,50}$/.test(formData.primaryContactPerson)) {
      newErrors.primaryContactPerson = "Name must contain only letters"
    }

    // 🔹 Designation
    if (!formData.designation?.trim()) {
      newErrors.designation = "Designation is required"
    }

    // 🔹 Alternate Contact Number (optional)
    if (formData.alternateContactNumber?.trim()) {
      const alt = formData.alternateContactNumber.trim()
      if (alt.length !== 10 || !/^[5-9][0-9]{9}$/.test(alt)) {
        newErrors.alternateContactNumber = "Alternate number must be 10 digits & start with 5-9"
      }
    }

    // 🔹 Clinic Management Software
    if (!formData.clinicManagementSoftwareUsage?.trim()) {
      newErrors.clinicManagementSoftwareUsage = "Please specify if you use clinic software"
    }

    // 🔹 Bank Account Name
    if (!formData.bankAccountName?.trim()) {
      newErrors.bankAccountName = "Bank Account Name is required"
    }

    // 🔹 Bank Account Number
    if (!formData.bankAccountNumber?.trim()) {
      newErrors.bankAccountNumber = "Bank Account Number is required"
    } else if (!/^[0-9]{9,18}$/.test(formData.bankAccountNumber)) {
      newErrors.bankAccountNumber = "Bank Account Number must be 9–18 digits"
    }

    // 🔹 IFSC Code
    if (!formData.ifscCode?.trim()) {
      newErrors.ifscCode = "IFSC Code is required"
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(formData.ifscCode)) {
      newErrors.ifscCode = "Invalid IFSC Code format"
    }

    // 🔹 UPI ID (optional)
    if (formData.upiId?.trim()) {
      const upiRegex = /^[\w.-]+@[\w.-]+$/
      if (!upiRegex.test(formData.upiId)) {
        newErrors.upiId = "Invalid UPI ID"
      }
    }

    // 🔹 PAN Number
    if (!formData.panNumber?.trim()) {
      newErrors.panNumber = "PAN Number is required"
    } else if (!/[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.panNumber)) {
      newErrors.panNumber = "Invalid PAN format"
    }

    if (!formData.branch?.trim()) {
      newErrors.branch = "Branch name is required"
    }
    if (!formData.nabhScore || !String(formData.nabhScore).trim()) {
      newErrors.nabhScore = "NABH Score is required";
    }
    if (!formData.freeFollowUps) {
      newErrors.freeFollowUps = "Free Follow Ups is required"
    } else if (isNaN(formData.freeFollowUps) || formData.freeFollowUps < 0) {
      newErrors.freeFollowUps = "Free Follow Ups must be a positive number"
    }
    // No `else { newErrors.website = '' }`

    console.log('Validation errors:', newErrors)

    // validate fields and set errors
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fill all required fields', { position: 'top-right' })
      return false // stop form submit
    }

    return true // all good
  }



  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear the error once the field is updated
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }))
  }


  const handleAppendFiles = async (e, fieldName, maxFiles = 6) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (!selectedFiles.length) return

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/zip',
    ]

    const MAX_SIZE_BYTES = 500 * 1024 // 500 KB

    // Validate each selected file
    for (let file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, [fieldName]: 'Invalid file type' }))
        return
      }
      if (file.size > MAX_SIZE_BYTES) {
        setErrors(prev => ({ ...prev, [fieldName]: 'File size must be less than or equal to 500 KB' }))
        return
      }
    }

    // Convert files to raw Base64
    const base64Files = await Promise.all(
      selectedFiles.slice(0, maxFiles).map(file =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => {
            const rawBase64 = reader.result.split(',')[1] // Remove "data:application/pdf;base64,"
            resolve({ name: file.name, base64: rawBase64 })
          }
          reader.onerror = err => reject(err)
        })
      )
    )

    // Append to existing files in state
    setFormData(prev => {
      const existingFiles = Array.isArray(prev[fieldName]) ? prev[fieldName] : []
      const combinedFiles = [...existingFiles, ...base64Files].slice(0, maxFiles)
      return { ...prev, [fieldName]: combinedFiles }
    })

    setErrors(prev => ({ ...prev, [fieldName]: '' }))
  }

  const normalizeWebsite = (url) => {
    // If starts with www. or does not have protocol, prepend https://
    if (!/^https?:\/\//i.test(url)) {
      return 'https://' + url
    }
    return url
  }
  console.log('submit button clicked')

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        // Only keep the part after comma (raw Base64)
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const [existingDoctors, setExistingDoctors] = useState([])
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/${ClinicAllData}`)
        const clinicList = Array.isArray(response.data) // your actual API
        // const data = await response.json()
        console.log('Fetched doctor data:', response.data) // <-- CHECK THIS STRUCTURE
        setExistingDoctors(response.data.data)
      } catch (err) {
        console.error('Failed to load existing doctor data', err)
      }
    }

    fetchDoctors()
  }, [])

  useEffect(() => {
    const storedConsultation = localStorage.getItem('consultationExpiration')
    if (storedConsultation) {
      const onlyNumber = storedConsultation.replace(/\D/g, '')
      setFormData((prev) => ({
        ...prev,
        consultationExpiration: onlyNumber,
      }))
    }
  }, [])

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/${getAllQuestions}`, {
          params: { id: savedQuestionId }
        });

        console.log("Fetched data:", response.data);

        if (response.data.success && response.data.data) {
          const qaList = response.data.data.questionsAndAnswers || [];

          // Extract questions
          setNabhQuestions(qaList.map((item) => item.question));

          // Extract existing answers (boolean values)
          setNabhAnswers(qaList.map((item) => item.answer));
        }
      } catch (err) {
        console.error("Error fetching NABH questions:", err);
      }
    };

    fetchQuestions();
  }, [savedQuestionId]);



  const handleNabhSubmit = async () => {
    try {
      const payload = {
        questionsAndAnswers: nabhQuestions.map((q, index) => ({
          question: q,
          answer: nabhAnswers[index] === true,
        })),
      };

      const response = await axios.post(
        `${BASE_URL}/${postAllQuestionsAndAnswers}`,
        payload
      );

      if (response.data.success) {
        const score = response.data.data?.score ?? 0;

        setNabhScore(score);
        setFormData(prev => ({
          ...prev,
          nabhScore: score,
        }));
        setNabhSubmitted(true);
        setShowNabhModal(false);
        setErrors(prev => ({ ...prev, nabhScore: '' }));

      }
    } catch (error) {
      console.error("Error saving NABH answers:", error);
    }
  };


  // ✅ Save to localStorage for frontend-only preview/debug
  const formattedConsultationDays = `${formData.consultationExpiration} days`
  const previewData = {
    ...formData,
    consultationExpiration: formattedConsultationDays,
  }
  localStorage.setItem('clinicFormPreview', JSON.stringify(previewData))
  console.log('👁️ Clinic Form Preview (Frontend only):', previewData)

  const previewFromLocalStorage = JSON.parse(localStorage.getItem('clinicFormPreview'))
  console.log('📦 Loaded from localStorage for preview:', previewFromLocalStorage)

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);

    const { emailAddress, contactNumber, licenseNumber } = formData;
    const safeExistingDoctors = Array.isArray(existingDoctors) ? existingDoctors : [];

    const isEmailDuplicate = safeExistingDoctors.some(
      (doc) => doc.emailAddress?.toLowerCase() === emailAddress?.toLowerCase()
    );
    const isMobileDuplicate = safeExistingDoctors.some(
      (doc) => doc.contactNumber === contactNumber
    );
    const isLicenseDuplicate = safeExistingDoctors.some(
      (doc) => doc.licenseNumber?.toLowerCase() === licenseNumber?.toLowerCase()
    );

    if (isEmailDuplicate || isMobileDuplicate || isLicenseDuplicate) {
      const newErrors = {};

      if (isEmailDuplicate) {
        newErrors.emailAddress = "Email already exists";
      }
      if (isMobileDuplicate) {
        newErrors.contactNumber = "Mobile number already exists";
      }
      if (isLicenseDuplicate) {
        newErrors.licenseNumber = "License Number already exists";
      }

      setErrors((prev) => ({ ...prev, ...newErrors }));
      setIsSubmitting(false);
      return;
    }


    try {
      // 🔹 Helper functions
      const convertIfExists = async (file) => {
        if (!file) return "";
        if (file instanceof Blob) return await convertFileToBase64(file);
        return file; // already Base64
      };

      const convertMultipleIfExists = async (files) => {
        if (!Array.isArray(files)) return [];
        return Promise.all(
          files.map(async (file) => {
            if (file?.base64) return file.base64;
            if (file instanceof Blob) return await convertFileToBase64(file);
            return file;
          })
        );
      };

      // 🔹 Convert files
      const hospitalLogoBase64 = await convertIfExists(formData.hospitalLogo);
      const hospitalDocumentsBase64 = await convertIfExists(formData.hospitalDocuments);
      const hospitalContractBase64 = await convertIfExists(formData.contractorDocuments);
      const clinicalEstablishmentCertificateBase64 = await convertIfExists(
        formData.clinicalEstablishmentCertificate
      );
      const businessRegistrationCertificateBase64 = await convertIfExists(
        formData.businessRegistrationCertificate
      );
      const drugLicenseCertificateBase64 = await convertIfExists(formData.drugLicenseCertificate);
      const drugLicenseFormTypeBase64 = await convertIfExists(formData.drugLicenseFormType);
      const pharmacistCertificateBase64 = await convertIfExists(formData.pharmacistCertificate);
      const biomedicalWasteManagementAuthBase64 = await convertIfExists(
        formData.biomedicalWasteManagementAuth
      );
      const tradeLicenseBase64 = await convertIfExists(formData.tradeLicense);
      const fireSafetyCertificateBase64 = await convertIfExists(formData.fireSafetyCertificate);
      const professionalIndemnityInsuranceBase64 = await convertIfExists(
        formData.professionalIndemnityInsurance
      );
      const gstRegistrationCertificateBase64 = await convertIfExists(
        formData.gstRegistrationCertificate
      );
      const othersBase64 = await convertMultipleIfExists(formData.others);
      const onboardingToken = localStorage.getItem("onboardingToken");
      // 🔹 Prepare payload
      const clinicData = {
        token: onboardingToken,                              // ✅ REQUIRED
        contractorDocuments: hospitalContractBase64,
        address: formData.address,
        alternateContactNumber: formData.alternateContactNumber,
        bankAccountName: formData.bankAccountName,
        bankAccountNumber: formData.bankAccountNumber,
        biomedicalWasteManagementAuth: biomedicalWasteManagementAuthBase64,
        branch: formData.branch,
        businessRegistrationCertificate: businessRegistrationCertificateBase64,
        city: formData.city,
        clinicManagementSoftwareUsage: formData.clinicManagementSoftwareUsage,
        clinicSoftware: !!formData.clinicSoftware,
        clinicSpecializationType: formData.clinicSpecializationType,
        clinicType: formData.clinicType,
        clinicalEstablishmentCertificate: clinicalEstablishmentCertificateBase64,
        closingTime: formData.closingTime,
        consultationExpiration: formData.consultationExpiration
          ? `${formData.consultationExpiration} days`
          : "",
        contactNumber: formData.contactNumber,
        designation: formData.designation,
        drugLicenseCertificate: drugLicenseCertificateBase64,
        drugLicenseFormType: drugLicenseFormTypeBase64,
        emailAddress: formData.emailAddress,
        facebookHandle: formData.facebookHandle,
        fireSafetyCertificate: fireSafetyCertificateBase64,
        freeFollowUps: formData.freeFollowUps,
        gstRegistrationCertificate: gstRegistrationCertificateBase64,
        hasPharmacist: selectedPharmacistOption,

        hospitalDocuments: hospitalDocumentsBase64,
        hospitalLogo: hospitalLogoBase64,
        ifscCode: formData.ifscCode,
        instagramHandle: formData.instagramHandle,
        issuingAuthority: formData.issuingAuthority,
        latitude: formData.latitude,
        licenseNumber: formData.licenseNumber,
        longitude: formData.longitude,
        medicinesSoldOnSite: formData.medicinesSoldOnSite,
        nabhScore: formData.nabhScore,
        name: formData.name,
        openingTime: formData.openingTime,
        others: othersBase64,
        panNumber: formData.panNumber,
        pharmacistCertificate: pharmacistCertificateBase64,
        primaryContactPerson: formData.primaryContactPerson,
        professionalIndemnityInsurance: professionalIndemnityInsuranceBase64,
        recommended: !!formData.recommended,
        subscription: formData.subscription,
        tradeLicense: tradeLicenseBase64,
        twitterHandle: formData.twitterHandle,
        upiId: formData.upiId,
        walkthrough: formData.walkthrough,
        website: normalizeWebsite(formData.website.trim())
      };



      // 🔹 API Call
      const response = await axios.post(CLINIC_REGISTRATION_URL, clinicData);

      const savedClinicData = response.data;
      // ✅ Get token correctly
      const apiToken = savedClinicData?.data?.token;
      console.log("API Token:", apiToken);
      localStorage.setItem("apiToken", apiToken);
      if (savedClinicData.success) {
        toast.success(savedClinicData.message || "Clinic Added Successfully", {
          position: "top-right",
        });

        // 🔹 Send onboarding email + navigate after small delay
        setTimeout(() => {
          sendDermaCareOnboardingEmail({
            name: formData.name,
            email: formData.emailAddress,
            password: savedClinicData.data.clinicTemporaryPassword,
            userID: savedClinicData.data.clinicUsername,
          });

          navigate("/clinic-management", {
            state: {
              refresh: true,
              newClinic: savedClinicData,
            },
          });
        }, 1000);
      } else {
        toast.error(savedClinicData.message || "Something went wrong", {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error submitting clinic data:", error);
      toast.error(error.message || "Something went wrong", { position: "top-right" });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="container mt-4">
      <ToastContainer />
      <CCard className="shadow-sm border-0 rounded-3">
        <CCardHeader className="bg-primary text-white">
          <h3 className="mb-0">Add New Clinic</h3>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            <h5 className="mb-3 text-primary mt-6">Clinic Information</h5>
            <CRow className="mb-4 g-3">
              <CCol md={4}>
                <CFormLabel>
                  Clinic Name
                  <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFormData((prev) => ({ ...prev, [name]: value }));

                    const error =
                      !value.trim()
                        ? "Clinic name is required"
                        : value.length < 2
                          ? "Clinic name must be at least 2 characters"
                          : value.length > 100
                            ? "Clinic name cannot exceed 100 characters"
                            : "";

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.name}
                />

                {errors.name && <CFormFeedback invalid>{errors.name}</CFormFeedback>}
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Email Address<span style={{ color: 'red' }}>*</span>
                </CFormLabel>

                <CFormInput
                  type="email"
                  name="emailAddress"

                  value={formData.emailAddress}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFormData((prev) => ({ ...prev, [name]: value }));
                    setErrors((prev) => ({ ...prev, [name]: '' }))
                  }}
                  // onBlur={EmailBlur}
                  invalid={!!errors.emailAddress}
                />
                {errors.emailAddress && (
                  <CFormFeedback invalid>{errors.emailAddress}</CFormFeedback>
                )}
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Contact Number<span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                    handleInputChange({ target: { name: 'contactNumber', value } });
                  }}
                  maxLength={10}
                  invalid={!!errors.contactNumber}
                />
                {errors.contactNumber && (
                  <CFormFeedback invalid>{errors.contactNumber}</CFormFeedback>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>
                  Website<span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={(e) => {
                    const { name, value } = e.target;

                    // Update form data
                    setFormData((prev) => ({ ...prev, [name]: value }));

                    // Real-time validation
                    let error = '';
                    if (!value.trim()) {
                      error = 'Website is required';
                    } else if (!/^https?:\/\/[^\s]+$/.test(value.trim())) {
                      error = 'Website must start with http:// or https:// and contain no spaces';
                    }

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.website}
                />
                {errors.website && (
                  <div style={{ color: 'red', fontSize: '0.9rem' }}>{errors.website}</div>
                )}
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Clinic Specialization Type <span className="text-danger">*</span>
                </CFormLabel>

                <CFormSelect
                  name="clinicSpecializationType"
                  value={formData.clinicSpecializationType || ""}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFormData((prev) => ({ ...prev, [name]: value }));

                    const error = !value.trim()
                      ? "Clinic Specialization Type is required"
                      : "";

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.clinicSpecializationType}
                >
                  <option value="">Select Clinic Type</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Aesthetic">Aesthetic</option>
                  <option value="Cosmetology">Cosmetology</option>
                  <option value="Multi-specialty">Multi-specialty</option>
                </CFormSelect>

                {errors.clinicSpecializationType && (
                  <CFormFeedback invalid>{errors.clinicSpecializationType}</CFormFeedback>
                )}
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Designation <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="designation"
                  value={formData.designation || ""}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFormData((prev) => ({ ...prev, [name]: value }));

                    const error = !value.trim()
                      ? "Designation is required"
                      : "";

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.designation}
                />
                {errors.designation && (
                  <CFormFeedback invalid>{errors.designation}</CFormFeedback>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>
                  Do you use any Clinic Management Software?
                </CFormLabel>
                <CFormSelect
                  name="clinicSoftware"
                  value={formData.clinicSoftware}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clinicSoftware: e.target.value === 'true',
                    }))
                  }
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </CFormSelect>

              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Recommendation Status
                  {/* <span className="text-danger">*</span> */}
                </CFormLabel>
                <CFormSelect
                  name="recommended"
                  value={formData.recommended}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      recommended: e.target.value === 'true',
                    }))
                  }
                >
                  <option value="true">Yes, Recommend</option>
                  <option value="false">No, Don't Recommend</option>
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Clinic Type <span className="text-danger">*</span>
                </CFormLabel>

                <CFormSelect
                  name="clinicType"
                  value={formData.clinicType}
                  onChange={(e) => {
                    const value = e.target.value;

                    setFormData((prev) => ({ ...prev, clinicType: value }));

                    setErrors((prev) => ({
                      ...prev,
                      clinicType: value ? "" : "Please select a clinic type.",
                    }));
                  }}
                  invalid={!!errors.clinicType}
                >
                  <option value="">Select Type</option>
                  <option value="Proprietorship">Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                  <option value="LLP">LLP</option>
                  <option value="Private Limited">Private Limited</option>
                </CFormSelect>

                {errors.clinicType && (
                  <CFormFeedback invalid>{errors.clinicType}</CFormFeedback>
                )}
              </CCol>


            </CRow>

            <h5 className="mb-3 text-primary mt-6">Clinic Contact Details</h5>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Primary Contact Person
                  <span className="text-danger">*</span>
                </CFormLabel>

                <CFormInput
                  type="text"
                  name="primaryContactPerson"
                  value={formData.primaryContactPerson || ""}
                  maxLength={50} // optional, limit name length
                  onChange={(e) => {
                    let { name, value } = e.target;

                    // Remove digits and special characters (allow letters and spaces)
                    value = value.replace(/[^a-zA-Z\s]/g, '');

                    setFormData((prev) => ({ ...prev, [name]: value }));

                    // Validation
                    let error = "";
                    if (!value.trim()) {
                      error = "Name is required";
                    }

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.primaryContactPerson}

                />

                {errors.primaryContactPerson && (
                  <CFormFeedback invalid>{errors.primaryContactPerson}</CFormFeedback>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Alternate Contact Number</CFormLabel>

                <CFormInput
                  type="text" // keep as text for better control
                  name="alternateContactNumber"
                  value={formData.alternateContactNumber || ""}
                  maxLength={10} // restrict input to 10 digits
                  onChange={(e) => {
                    let { name, value } = e.target;

                    // remove non-numeric characters
                    value = value.replace(/\D/g, '');

                    // restrict to 10 digits
                    if (value.length > 10) value = value.slice(0, 10);

                    setFormData((prev) => ({ ...prev, [name]: value }));

                    let error = "";
                    if (value && !/^[6-9][0-9]{9}$/.test(value)) {
                      error = "Enter a valid 10-digit mobile number starting with 6-9";
                    }

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.alternateContactNumber}
                />

                {errors.alternateContactNumber && (
                  <CFormFeedback invalid>{errors.alternateContactNumber}</CFormFeedback>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Address<span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  invalid={!!errors.address}
                />
                {errors.address && <CFormFeedback invalid>{errors.address}</CFormFeedback>}
              </CCol>
              <CCol md={6}>
                <CFormLabel>
                  City<span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  onKeyDown={preventNumberInput}
                  invalid={!!errors.city}
                />
                {errors.city && <CFormFeedback invalid>{errors.city}</CFormFeedback>}
              </CCol>
            </CRow>

            <h5 className="mb-3 text-primary mt-6">Bank & Financial Information</h5>
            <CRow className='mb-3'>
              <CCol md={4}>
                <CFormLabel>
                  Bank Account Name <span className="text-danger">*</span>
                </CFormLabel>

                <CFormInput
                  type="text"
                  name="bankAccountName"
                  value={formData.bankAccountName || ""}
                  onChange={(e) => {
                    const { name, value } = e.target;

                    // Remove numbers and special characters
                    const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '');

                    setFormData((prev) => ({ ...prev, [name]: lettersOnly }));

                    let error = "";
                    if (!lettersOnly.trim()) {
                      error = "Bank Account Name is required";
                    } else if (lettersOnly.length < 2) {
                      error = "Must be at least 2 characters";
                    } else if (lettersOnly.length > 50) {
                      error = "Cannot exceed 50 characters";
                    }

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.bankAccountName}
                />

                {errors.bankAccountName && (
                  <CFormFeedback invalid>{errors.bankAccountName}</CFormFeedback>
                )}
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Bank Account Number <span className="text-danger">*</span>
                </CFormLabel>

                <CFormInput
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber || ""}
                  maxLength={18} // maximum digits
                  onChange={(e) => {
                    let { name, value } = e.target;

                    // Remove non-numeric characters
                    value = value.replace(/\D/g, '');

                    // Optional: restrict to 18 digits max
                    if (value.length > 18) value = value.slice(0, 18);

                    setFormData((prev) => ({ ...prev, [name]: value }));

                    let error = "";
                    if (!value.trim()) {
                      error = "Bank Account Number is required";
                    } else if (value.length < 9) {
                      error = "Bank Account Number must be at least 9 digits";
                    }

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.bankAccountNumber}
                />

                {errors.bankAccountNumber && (
                  <CFormFeedback invalid>{errors.bankAccountNumber}</CFormFeedback>
                )}
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  IFSC Code <span className="text-danger">*</span>
                </CFormLabel>

                <CFormInput
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode || ""}
                  maxLength={11} // IFSC is always 11 characters
                  onChange={(e) => {
                    let { name, value } = e.target;

                    // Convert input to uppercase automatically
                    value = value.toUpperCase();

                    setFormData((prev) => ({ ...prev, [name]: value }));

                    // Validation
                    let error = "";
                    if (!value.trim()) {
                      error = "IFSC Code is required";
                    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) {
                      error = "Invalid IFSC Code";
                    }

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.ifscCode}
                />

                {errors.ifscCode && <CFormFeedback invalid>{errors.ifscCode}</CFormFeedback>}
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>UPI ID</CFormLabel>

                <CFormInput
                  type="text"
                  name="upiId"
                  value={formData.upiId || ""}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFormData((prev) => ({ ...prev, [name]: value }));
                  }}
                />
              </CCol>

              <CCol md={4}>
                <CFormLabel>
                  PAN Number <span className="text-danger">*</span>
                </CFormLabel>

                <CFormInput
                  type="text"
                  name="panNumber"
                  value={formData.panNumber || ""}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFormData((prev) => ({ ...prev, [name]: value }));

                    const error =
                      !value.trim()
                        ? "PAN Number is required"
                        : !/[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(value)
                          ? "Invalid PAN format"
                          : "";

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.panNumber}
                />

                {errors.panNumber && (
                  <CFormFeedback invalid>{errors.panNumber}</CFormFeedback>
                )}
              </CCol>
            </CRow>

            <h5 className="mb-3 text-primary mt-6">Clinic Operations</h5>

            <CRow className='mb-3'>

              <CCol md={4}>
                <CFormLabel>
                  Clinic Management Software <span className="text-danger">*</span>
                </CFormLabel>

                <CFormInput
                  type="text"
                  name="clinicManagementSoftwareUsage"
                  value={formData.clinicManagementSoftwareUsage || ""}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFormData((prev) => ({ ...prev, [name]: value }));

                    const error = !value.trim()
                      ? "This field is required"
                      : "";

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.clinicManagementSoftwareUsage}
                />

                {errors.clinicManagementSoftwareUsage && (
                  <CFormFeedback invalid>{errors.clinicManagementSoftwareUsage}</CFormFeedback>
                )}
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Subscription<span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  name="subscription" // ✅ Must match key in formData
                  className="form-select"
                  value={formData.subscription}
                  onChange={handleInputChange} // ✅ Uses generic input handler
                  invalid={!!errors.subscription}
                >
                  <option value="">Select Subscription</option>
                  <option value="Free">Free</option>
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </CFormSelect>
                {errors.subscription && <div className="text-danger">{errors.subscription}</div>}
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Medicines sold on-site

                </CFormLabel>
                <CFormSelect
                  name='medicinesSoldOnSite'
                  value={formData.medicinesSoldOnSite}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      medicinesSoldOnSite: e.target.value === 'true',
                    }))
                  }
                >

                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </CFormSelect>

              </CCol>
            </CRow>

            <CRow className='mb-3'>
              <CCol md={4}>
                <CFormLabel>
                  Consultation Expiration (in days) <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="consultationExpiration"
                  value={formData.consultationExpiration}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, ""); // allow only digits
                    if (value.length > 2) value = value.slice(0, 2); // limit to 2 digits

                    setFormData((prev) => ({
                      ...prev,
                      consultationExpiration: value,
                    }));

                    // Clear error if valid
                    if (value) {
                      setErrors((prev) => ({
                        ...prev,
                        consultationExpiration: "",
                      }));
                    } else {
                      // Add error again if empty
                      setErrors((prev) => ({
                        ...prev,
                        consultationExpiration: "Consultation Expiration is required",
                      }));
                    }
                  }}
                  onBlur={(e) => {
                    let value = e.target.value;
                    if (value.length === 1) {
                      value = value.padStart(2, "0"); // add leading zero
                    }

                    setFormData((prev) => ({
                      ...prev,
                      consultationExpiration: value,
                    }));

                    // Double check on blur (so if user tabs away empty field, error comes back)
                    if (!value) {
                      setErrors((prev) => ({
                        ...prev,
                        consultationExpiration: "Consultation Expiration is required",
                      }));
                    }
                  }}
                  placeholder="Enter consultation days (01-99)"
                  invalid={!!errors.consultationExpiration}
                />
                {errors.consultationExpiration && (
                  <CFormFeedback invalid>{errors.consultationExpiration}</CFormFeedback>
                )}
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  No. of Free Follow Ups <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="number"
                  name="freeFollowUps"
                  value={formData.freeFollowUps}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Enter next visit consultation count"
                  invalid={!!errors.freeFollowUps}
                />
                {errors.freeFollowUps && (
                  <CFormFeedback invalid>{errors.freeFollowUps}</CFormFeedback>
                )}
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Opening Time<span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormSelect
                  name="openingTime"
                  value={formData.openingTime}
                  onChange={handleInputChange}
                  invalid={!!errors.openingTime}
                  disabled={loadingTimings}
                >
                  <option value="">Select Opening Time</option>
                  {timings.map((slot, idx) => (
                    <option key={idx} value={slot.openingTime}>
                      {slot.openingTime}
                    </option>
                  ))}
                </CFormSelect>
                {errors.openingTime && (
                  <CFormFeedback invalid>{errors.openingTime}</CFormFeedback>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>
                  Closing Time<span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormSelect
                  name="closingTime"
                  value={formData.closingTime}
                  onChange={handleInputChange}
                  invalid={!!errors.closingTime}
                  disabled={loadingTimings}
                >
                  <option value="">Select Closing Time</option>

                  {timings.map((slot, idx) => (
                    <option key={idx} value={slot.closingTime}>
                      {slot.closingTime}
                    </option>
                  ))}
                </CFormSelect>
                {errors.closingTime && (
                  <CFormFeedback invalid>{errors.closingTime}</CFormFeedback>
                )}
              </CCol>
            </CRow>


            <h5 className="mb-3 text-primary mt-6">Licenses & Certifications</h5>

            <CRow className='mb-3'>
              <CCol md={6}>
                <CFormLabel>
                  License Number<span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  invalid={!!errors.licenseNumber}
                />
                {errors.licenseNumber && (
                  <CFormFeedback invalid>{errors.licenseNumber}</CFormFeedback>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel>
                  Issuing Authority<span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="issuingAuthority"
                  value={formData.issuingAuthority}
                  onChange={handleInputChange}
                  onKeyDown={preventNumberInput}
                  invalid={!!errors.issuingAuthority}
                />
                {errors.issuingAuthority && (
                  <CFormFeedback invalid>{errors.issuingAuthority}</CFormFeedback>
                )}
              </CCol>


            </CRow>
            <CRow className="mb-3">
              <FileInput
                label="Trade Licence / Shop & Establishment Certificate"
                name="tradeLicense"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                inputRef={refs.tradeLicence}
              />

              <FileInput
                label="Fire Safety Certificate"
                name="fireSafetyCertificate"
                accept=".pdf,.doc,.docx,.jpeg,.png,.zip"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                inputRef={refs.fireSafetyCertificate}
              />
            </CRow>
            <CRow className='mb-3'>
              <FileInput
                label="GST Registration Certificate"
                name="gstRegistrationCertificate"
                accept=".pdf,.doc,.docx,.jpeg,.png,.zip"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                inputRef={refs.gstRegistrationCertificate}
              />
              <FileInput
                label="Professional Indemnity Insurance"
                name="professionalIndemnityInsurance"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                inputRef={refs.professionalIndemnityInsurance}
                required={false}  // <-- makes it optional
              />
              {selectedOption === "Yes" && (
                <CRow className="mb-3">
                  <FileInput
                    label="Drug Licence Certificate"
                    name="drugLicenseCertificate"
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                    inputRef={refs.drugLicenseCertificate}
                  />

                  <FileInput
                    label="Drug Licence Form Type 20/21"
                    name="drugLicenseFormType"
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                    inputRef={refs.drugLicenseFormType}
                  />
                </CRow>
              )}

            </CRow>



            <h5 className="mb-3 text-primary mt-6">Virtual Tour & Branch Info</h5>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Virtual Clinic Tour <span className="text-danger"></span>
                </CFormLabel>
                <CFormInput
                  type="url"
                  placeholder="https://example.com/VirtualClinicTour"
                  value={formData.walkthrough || ""}
                  onChange={(e) => {
                    const { value } = e.target;

                    // Update form data
                    setFormData((prev) => ({ ...prev, walkthrough: value }));

                    // Real-time validation
                    let error = "";

                    if (value.trim()) {
                      try {
                        new URL(value); // throws if invalid
                      } catch {
                        error = "Enter a valid URL (e.g. https://example.com)";
                      }
                    }

                    // Set or clear error
                    setErrors((prev) => ({
                      ...prev,
                      walkthrough: error || undefined,
                    }));
                  }}
                  invalid={!!errors.walkthrough}
                />
                {errors.walkthrough && (
                  <div style={{ color: 'red', fontSize: '0.9rem' }}>{errors.walkthrough}</div>
                )}


              </CCol>
              {/* ✅ Branch Input */}

              <CCol md={6}>
                <CFormLabel>
                  Branch <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="Enter branch name"
                  value={formData.branch || ""}
                  onChange={(e) => {
                    const value = e.target.value;

                    setFormData((prev) => ({ ...prev, branch: value }));
                    if (!value) {
                      setErrors((prev) => ({ ...prev, branch: "Branch name is required" }))
                    }
                    else {
                      setErrors((prev) => ({ ...prev, branch: "" }))
                    }
                  }}

                  invalid={!!errors.branch}
                />
                {errors.branch && <CFormFeedback invalid>{errors.branch}</CFormFeedback>}
              </CCol>

            </CRow>

            <h5 className="mb-3 text-primary mt-6">Social Media</h5>
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>Instagram</CFormLabel>
                <CFormInput
                  type="text"
                  id="instagram"
                  placeholder="@clinic_handle"
                  name="instagramHandle"
                  value={formData.instagramHandle}
                  onChange={handleInputChange}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Facebook</CFormLabel>
                <CFormInput
                  type="text"
                  id="facebook"
                  placeholder="facebook.com/clinic"
                  name="facebookHandle"
                  value={formData.facebookHandle}
                  onChange={handleInputChange}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Twitter</CFormLabel>
                <CFormInput
                  type="text"
                  id="twitter"
                  placeholder="@clinic_tweet"
                  name="twitterHandle"
                  value={formData.twitterHandle}
                  onChange={handleInputChange}
                />
              </CCol>
            </CRow>
            <h5 className="mb-3 text-primary mt-6">Clinic Staff & Pharmacist</h5>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Clinic has a valid pharmacist
                  <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  value={selectedPharmacistOption}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSelectedPharmacistOption(value);

                    setFormData(prev => ({
                      ...prev,
                      hasPharmacist: value
                    }));

                    setErrors(prev => ({ ...prev, hasPharmacist: '' }));
                  }}
                >
                  <option value="">Select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </CFormSelect>

                {errors.hasPharmacist && (
                  <CFormFeedback invalid>{errors.hasPharmacist}</CFormFeedback>
                )}
              </CCol>
              {selectedPharmacistOption === 'Yes' && (
                <FileInput
                  label="Pharmacist Certificate"
                  name="pharmacistCertificate"
                  accept=".pdf,.doc,.docx,.jpeg,.png,.zip"
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  setErrors={setErrors}
                  inputRef={refs.pharmacistCertificate}
                />)}
            </CRow>
            <h5 className="mb-3 text-primary mt-6">Location & Coordinates</h5>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Clinic Latitude <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="number"
                  step="any"
                  placeholder="Enter latitude"
                  value={formData.latitude || ""}
                  onChange={(e) => {
                    const { value } = e.target;
                    setFormData((prev) => ({ ...prev, latitude: value }));

                    // validate immediately
                    const lat = parseFloat(value);
                    let error = "";
                    if (!value) {
                      error = "Latitude is required";
                    } else if (isNaN(lat) || lat < -90 || lat > 90) {
                      error = "Latitude must be between -90 and 90";
                    }

                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      if (error) {
                        newErrors.latitude = error;
                      } else {
                        delete newErrors.latitude; // ✅ remove error when valid
                      }
                      return newErrors;
                    });
                  }}
                  invalid={!!errors.latitude}
                />
                {errors.latitude && (
                  <CFormFeedback invalid>{errors.latitude}</CFormFeedback>
                )}

              </CCol>

              <CCol md={6}>
                <CFormLabel>
                  Clinic Longitude <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="number"
                  step="any"
                  placeholder="Enter longitude"
                  value={formData.longitude || ""}
                  onChange={(e) => {
                    const { value } = e.target;
                    setFormData((prev) => ({ ...prev, longitude: value }));

                    // validate immediately
                    const lng = parseFloat(value);
                    let error = "";
                    if (!value) {
                      error = "Longitude is required";
                    } else if (isNaN(lng) || lng < -180 || lng > 180) {
                      error = "Longitude must be between -180 and 180";
                    }

                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      if (error) {
                        newErrors.longitude = error;
                      } else {
                        delete newErrors.longitude; // ✅ remove error when valid
                      }
                      return newErrors;
                    });
                  }}
                  invalid={!!errors.longitude}
                />
                {errors.longitude && (
                  <CFormFeedback invalid>{errors.longitude}</CFormFeedback>
                )}

              </CCol>
            </CRow>

            <h5 className="mb-3 text-primary mt-6">Other Attachments / Documents</h5>
            <CRow className="mb-3">
              <FileInput
                label="Clinic Contract"
                name="contractorDocuments"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                inputRef={refs.contractorDocuments} // ✅ should match ref name
              />
              <FileInput
                label="Clinic Logo"
                name="hospitalLogo"
                accept=".jpeg,.jpg,.png"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                inputRef={refs.hospitalLogo}
              />
              <FileInput
                label="Clinic Documents"
                name="hospitalDocuments"
                accept=".pdf,.doc,.docx,.jpeg,.png,.zip"
                tooltip="Issued by Local Fire Department"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                inputRef={refs.hospitalDocuments}
              />
              <FileInput
                label="Clinical Establishment Registration Certificate"
                name="clinicalEstablishmentCertificate"
                accept=".pdf,.doc,.docx,.jpeg,.png,.zip"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                inputRef={refs.clinicalEstablishmentCertificate}
              />
              <FileInput
                label="Business Registration Certificate"
                name="businessRegistrationCertificate"
                accept=".pdf,.doc,.docx,.jpeg,.png,.zip"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                inputRef={refs.businessRegistrationCertificate}
              />
              <FileInput
                label="Biomedical Waste Management Authorization"
                name="biomedicalWasteManagementAuth"
                tooltip="Issued by State Pollution Control Board (SPCB)"
                accept=".pdf,.doc,.docx,.jpeg,.png"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                inputRef={refs.biomedicalWasteManagementAuth}
              />
              <CCol md={6}>
                <CTooltip content="NABH Accreditation / Aesthetic Procedure Training Certificate">
                  <CFormLabel>Others (NABH / Aesthetic Training)</CFormLabel>
                </CTooltip>
                <CFormInput
                  type="file"
                  name="others"
                  multiple
                  onChange={(e) => handleAppendFiles(e, 'others', 6)}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                  invalid={!!errors.others}
                />


                {errors.others && <CFormFeedback invalid>{errors.others}</CFormFeedback>}

                {/* Display selected file names below input */}
                {Array.isArray(formData.others) && formData.others.length > 0 && (
                  <div className="mt-2">
                    {formData.others.map((file, index) => (
                      <div
                        key={index}
                        className="d-flex justify-content-between align-items-center border rounded px-2 py-1 mb-1"
                      >
                        <small className="text-dark">{file.name}</small>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            const updatedFiles = formData.others.filter((_, i) => i !== index)
                            setFormData((prev) => ({
                              ...prev,
                              others: updatedFiles,
                            }))
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CCol>
            </CRow>

            <h5 className="mb-3 text-primary mt-6">NABH Accreditation</h5>
            {/* ✅ NABH Score - Opens Modal */}
            <CRow className="mb-3">
              <CCol md={12} className='d-flex align-items-center'>
                <CFormLabel className="me-3">NABH Score <span className="text-danger">*</span></CFormLabel>
                {nabhScore !== null && (
                  <span className="me-3 fw-bold text-success">{nabhScore}</span>
                )}
                <CButton
                  color="primary"
                  onClick={() => !nabhSubmitted && setShowNabhModal(true)}
                  disabled={nabhSubmitted}
                >
                  Open NABH Questionnaire
                </CButton>
              </CCol>
              {errors.nabhScore && (
                <CCol md={12}>
                  <div className="text-danger mt-1">{errors.nabhScore}</div>
                </CCol>
              )}
            </CRow>
            <CModal visible={showNabhModal} onClose={() => setShowNabhModal(false)} size="lg" className="custom-modal"
              backdrop="static">
              <CModalHeader>
                <CModalTitle>NABH Questionnaire</CModalTitle>
              </CModalHeader>
              <CModalBody>
                {nabhQuestions.map((question, index) => (
                  <CRow key={index} className="mb-4">
                    {/* Question with number */}
                    <CCol md={12}>
                      <CFormLabel>
                        {index + 1}. {question}
                      </CFormLabel>
                    </CCol>

                    {/* Radio buttons below the question */}
                    <CCol md={12} className="d-flex mt-2">
                      <CFormCheck
                        type="radio"
                        name={`nabh-${index}`}
                        id={`nabh-${index}-yes`}
                        label="Yes"
                        checked={nabhAnswers[index] === true}
                        onChange={() => {
                          const updated = [...nabhAnswers];
                          updated[index] = true;
                          setNabhAnswers(updated);
                        }}
                        className="me-4"
                      />
                      <CFormCheck
                        type="radio"
                        name={`nabh-${index}`}
                        id={`nabh-${index}-no`}
                        label="No"
                        checked={nabhAnswers[index] === false}
                        onChange={() => {
                          const updated = [...nabhAnswers];
                          updated[index] = false;
                          setNabhAnswers(updated);
                        }}
                      />

                    </CCol>
                  </CRow>
                ))}
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setShowNabhModal(false)}>
                  Close
                </CButton>
                <CButton color="primary" onClick={handleNabhSubmit}>
                  Save
                </CButton>
              </CModalFooter>
            </CModal>

            {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}

            <div className="d-flex justify-content-end gap-2 mt-4">
              <CButton color="secondary" onClick={() => navigate('/clinic-management')}>
                Cancel
              </CButton>
              <CButton type="submit" color="success" className="me-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving Data...
                  </>
                ) : (
                  'Save Clinic'
                )}
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </div >
  )
}

export default ClinicRegistration