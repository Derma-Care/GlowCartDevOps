import { element } from 'prop-types'
import React from 'react'
import Package_ProcedureManagement_Tabs from './views/Package_ProcedureManagement/Package_ProcedureManagement_Tabs'


// Lazy-loaded components
const Login = React.lazy(() => import('./views/pages/login/Login'))
const serviceManagement = React.lazy(() => import('./views/servicesManagement/serviceManagement'))
const CustomerViewDetails = React.lazy(() => import('./views/customerManagement/CustomerViewDetails'))
const ClinicManagement = React.lazy(() => import('./views/clinicManagement/GlowKartClinics'))
const procedureManagement = React.lazy(() => import('./views/ProcedureManagement/ProcedureManagement'))
// const ClinicManagementDetails = React.lazy(() => import('./views/clinicManagement/ClinicDetails'))
// const AddClinic = React.lazy(() => import('./views/clinicManagement/AddClinic'))
const ClinicRegistration = React.lazy(() => import('./views/clinicManagement/GlowKartClinicRegistration'))
const categoryManagement = React.lazy(() => import('./views/categoryManagement/categoryManagement'))
const customerManagement = React.lazy(() => import('./views/customerManagement/CustomerManagement'))
const PatientManagement = React.lazy(() => import('./views/providerManagement/ProviderManagement'))
const PatientViewDetails = React.lazy(() => import('./views/providerManagement/ProviderViewDetails'))
// const BranchManagement = React.lazy(() => import('./views/clinicManagement/AddBranchForm'))
const AdsManagement = React.lazy(() => import('./views/AdsManagement/AdsManagement'))

const MembershipManagement = React.lazy(() => import('./views/MembershipManagement/MembershipManagement'))
const Clinic_getDetails = React.lazy(() => import('./views/Package_ProcedureManagement/Clinic_getDetails'))
const Payouts = React.lazy(() => import('./views/Payouts/Payout'))
// const BranchDetails = React.lazy(() => import('./views/clinicManagement/BranchDetails'))
const RegistrationCodeManagement = React.lazy(() => import('./views/RegistrationCodes/RegistrationCodes'))
const ClinicManagementDetails = React.lazy(() => import('./views/clinicManagement/GlowKartClinicDetails'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/login', name: 'Login', element: Login },
  { path: '/category-management', name: 'Category Management', element: categoryManagement },
  { path: '/service-management', name: 'Service Management', element: serviceManagement },
  { path: '/customer-management/:mobileNumber', name: 'Customer View Details', element: CustomerViewDetails },
  { path: '/customer-management', name: 'Customer Management', element: customerManagement },
  { path: '/procedure-management', name: 'Procedure Management', element: procedureManagement },
  { path: '/clinic-management', name: 'Clinic Management', element: ClinicManagement },
  // { path: '/add-clinic', name: 'Add Clinic', element: AddClinic },
  { path: '/clinic-registration', name: 'Clinic Registration', element: ClinicRegistration }, // updated route
  { path: '/patients-management', name: 'Patient Management', element: PatientManagement },
  // { path: '/clinic-management/:hospitalId', name: 'Clinic Details', element: ClinicManagementDetails },
  // { path: '/branch-details/:branchId', name: 'Branch Details', element: BranchDetails },
  { path: '/ads-management', name: 'Ads Management', element: AdsManagement },
  { path: '/payouts', name: 'Payouts', element: Payouts },
  { path: '/provider-management/:id', name: 'Patient View Details', element: PatientViewDetails },
  // { path: '/clinicDetails', name: 'ClinicDetails', element: ClinicManagementDetails },
  // { path: '/branchManagement', name: 'BranchManagement', element: BranchManagement },
  { path: '/membership-management', name: 'MembershipManagement', element: MembershipManagement },
  { path: '/packages-procedures', name: 'Procedures & Package Management', element: Clinic_getDetails },
  { path: '/registration-codes', name: 'Registration Codes ', element: RegistrationCodeManagement },
  { path: '/clinic-details/:clinicId', name: 'Clinic Details', element: ClinicManagementDetails },
  { path: "/Package_ProcedureManagement_Tabs/:clinicId", name: 'Package_ProcedureManagement_Tabs', element: Package_ProcedureManagement_Tabs }

]

export default routes
