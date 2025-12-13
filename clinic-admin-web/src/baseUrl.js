//  Local
// export let wifiUrl = 'localhost'
//-------------------------
// Dev
// export let wifiUrl = 'http://3.6.119.57:9090'
//----------------------------
// GlowKart
export let wifiUrl = 'https://glowkartapi.ashokfruit.shop'
//-----------------------------
// Production
// export let wifiUrl = 'https://api.aesthetech.life'

//-------------------------------

export const BASE_URL = `${wifiUrl}/clinic-admin`
export const MainAdmin_URL = `${wifiUrl}/admin`
export const Customer_URL = `${wifiUrl}/api/customer`

// ====================== END POINTS ==========================

//Registrations Code
export const rgCodes = `${Customer_URL}/code`

// login
export const endPoint = '/clinicLogin'

//appointments
export const Booking_sevice = `${wifiUrl}/api`

//============= Forms ===============

//sub Service management
export const service = 'subService/getAllSubServies'
export const getservice = 'getServiceByCategoryId'
export const getService_ByClinicId = 'getSubServiceByHospitalId'
export const Category = 'getAllCategories'

//main procedure service
export const getAllProceduresNames = 'procedures/all' // need

// procedure service Details
export const getProcedures = 'procedure-pricing/all' // need
export const AddSubService = 'procedure-pricing/create' // need
export const updateService = 'procedure-pricing/update' //need
export const deleteService = 'procedure-pricing/delete' // need

//package
export const getPackage = 'packages' // need
export const addPackage = 'packages/create' // need
export const updatePackage = 'procedure-packages/update' //need
export const deletePackage = 'procedure-packages/delete' // need

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
export const payoutlogin = 'payout-login' //done

export const sendPayoutOtp = 'payout-forgot-password'
export const resendPayoutOTP = 'payout-resend-otp'
export const resetPayoutPassword = 'payout-reset-password'
export const payoutsupdatePassword = 'updatePayoutPassword'  //done

//unwanted
export const Booking_service_Url = `${wifiUrl}/api/booking`
export const DeleteBookings = 'getAllBookings'
export const getAllBookedServices = 'getBookingsByHospitalId'
export const GetBookingBy_ClinicId = 'doctor/getDoctorsByHospitalId'
