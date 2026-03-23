//  Local
// export let wifiUrl = 'localhost'
//-------------------------
// Dev
export let wifiUrl = 'http://65.1.213.233:8080'
//----------------------------
// GlowKart
// export let wifiUrl = 'https://glowkartapi.ashokfruit.shop'
//-----------------------------
// Production
// export let wifiUrl = 'https://api.aesthetech.life'

//-------------------------------

export const BASE_URL = `/clinic-admin`
export const MainAdmin_URL = `/admin`
export const Customer_URL = `/api/customer`

// ====================== END POINTS ==========================

//Registrations Code
export const rgCodes = `${Customer_URL}/code`

// login
export const endPoint = '/clinicLogin'

//appointments
export const Booking_sevice = `/api`

//============= Forms ===============

//sub Service management
export const service = 'subService/getAllSubServies'
export const getservice = 'getServiceByCategoryId'
export const getService_ByClinicId = 'getSubServiceByHospitalId'
export const Category = 'getAllCategories'

//main procedure service
export const getAllProceduresNames = 'procedures/all' // need

// procedure service Details
export const getProcedures = `clinic-admin/procedure-pricing/all` // need
export const AddSubService = `clinic-admin/procedure-pricing/create` // need
export const updateService = `clinic-admin/procedure-pricing/update` //need
export const deleteService = `clinic-admin/procedure-pricing/delete` // need

//package
export const getPackage = 'clinic-admin/packages' // need
export const addPackage = 'clinic-admin/packages/create' // need
export const updatePackage = 'clinic-admin/procedure-packages/update' //need
export const deletePackage = 'clinic-admin/procedure-packages/delete' // need

//SUb Service
export const subservice = 'getSubServicesByServiceId'

//payouts

export const getAllPayouts = 'payments/getallpayments'
export const addPayouts = 'payments/addpayment'

//forgot password login
export const sendOtp = 'clinics/forgot-password'
export const resendOTP = 'clinics/resend-otp'
export const resetPassword = 'clinics/reset-password'

export const updatePassword = 'clinics/updatePassword'

//payout login
export const payoutlogin = 'clinic-admin/payout-login'

export const sendPayoutOtp = 'clinic-admin/payout-forgot-password'
export const resendPayoutOTP = 'clinic-admin/payout-resend-otp'
export const resetPayoutPassword = 'clinic-admin/payout-reset-password'
export const payoutsupdatePassword = 'clinic-admin/updatePayoutPassword'

//unwanted
export const Booking_service_Url = `/api/booking`
export const DeleteBookings = 'getAllBookings'
export const getAllBookedServices = 'getBookingsByHospitalId'
export const GetBookingBy_ClinicId = 'doctor/getDoctorsByHospitalId'

//help form
export const CreateClinicEnquiry = 'clinic-enquiries/create'
