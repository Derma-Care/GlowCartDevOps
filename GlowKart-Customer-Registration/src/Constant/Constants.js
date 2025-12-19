export const emailPattern =
  /^(?=[a-zA-Z0-9._-]*[a-zA-Z])[a-zA-Z0-9._-]+@[a-zA-Z]+(?:[.-]?[a-zA-Z]+)*\.[a-zA-Z]{2,6}$/

export const clinicId = localStorage.getItem('HospitalId')
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/;
