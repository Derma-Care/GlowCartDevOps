import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const PackageManagement = React.lazy(
  () => import('./views/NGK/PackageManagement/PackageManagement'),
)

const ProcedureManagement = React.lazy(
  () => import('./views/ProcedureManagement/ProcedureManagement'),
)
const Payouts = React.lazy(() => import('./views/Payouts/Payoutmanagement'))
const Help = React.lazy(() => import('./views/Help/Help'))
const ClinicRatingsAdmin = React.lazy(() => import('./views/NGK/ClinicRating/ClinicRatingsAdmin'))
const Resetpassword = React.lazy(() => import('./views/Resetpassword'))

const AppointmentManagement = React.lazy(
  () => import('./views/AppointmentManagement/appointmentManagement'),
)
const AppointmentDetailsPage = React.lazy(
  () => import('./views/AppointmentManagement/AppointmentDeatils'),
)

const NGlowKartPatientRegistration = React.lazy(
  () => import('./views/NGK/CustomerRrgistration/CustomerRegistration'),
)

const routes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/package', name: 'Doctors', element: PackageManagement },

  { path: '/procedure-management', name: 'Procedure Management', element: ProcedureManagement },

  { path: '/payouts', name: 'Payouts', element: Payouts },

  // { path: '/help', name: 'Help', element: Help },
  // { path: '/help', name: 'Help', element: NGlowKartPatientRegistration },
  { path: '/help', name: 'Help', element: ClinicRatingsAdmin },
  // { path: '/reviews', name: 'Help', element: ClinicRatingsAdmin },


  { path: '/reset-password', name: 'Reset Password', element: Resetpassword },

  { path: '/appointment-management', name: 'Appointments', element: AppointmentManagement },
  {
    path: '/appointment-details/:id',
    name: 'Appointment Details',
    element: AppointmentDetailsPage,
  },
]

export default routes
