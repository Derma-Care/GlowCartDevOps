import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormSelect,
  CRow,
  CCol,
  CBadge,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Eye, Edit2, Trash2 } from 'lucide-react'
import { COLORS } from '../../Constant/Themes'
import {
  PackageAllData,
  AddPackage,
  UpdatePackage,
  DeletePackage,
  ClinicAllData,
  getAllProcedures,
} from './PackageApi' // adjust path if needed


const getBadgeColor = (status) => {
  switch (status) {
    case 'Active': return 'success'
    case 'Inactive': return 'secondary'
    case 'Expired': return 'danger'
    default: return 'secondary'
  }
}

const defaultForm = {
  packageId: '',
  packageName: '',
  clinicId: '',
  clinicName: '',
  clinicAddress: '',
  procedures: [{ procedureName: '', noOfSittings: 1 }],
  sittings: 0,
  description: '',
  selectedProcedure: "",
  selectedSittings: 1,
  procedures: [],   // replace your old one
  price: 0,
  discountPercentage: 0,
  discountAmount: 0,
  taxPercentage: 0,
  taxAmount: 0,
  gst: 0,
  gstAmount: 0,
  platformFeePercentage: 0,
  platformFee: 0,
  consultationFee: 0,
  discountedCost: 0,
  clinicPay: 0,
  finalCost: 0,
  status: 'Active',

  // -------------------------------
  // ADD THESE 2 NEW FIELDS
  // -------------------------------
  durationNumber: '',     // numeric input
  durationUnit: 'Day',    // dropdown: Day, Week, Month

  // FINAL STRING LIKE "3 Days"
  duration: '',
};


const PackageManagement = () => {
  const [activeKey, setActiveKey] = useState(0) // 0 = ALL
  const [packages, setPackages] = useState([])
  const [clinics, setClinics] = useState([])
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [modalVisible, setModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  const [selectedPackage, setSelectedPackage] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [toDeleteId, setToDeleteId] = useState(null)
  const [procedureList, setProcedureList] = useState([]); // fetched from API
  const [selectedProcedure, setSelectedProcedure] = useState("");
  const [sittingCount, setSittingCount] = useState(1);
  const [allProcedures, setAllProcedures] = useState([]);

  // load packages & clinics
  useEffect(() => {
    loadPackages()
    loadClinics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadPackages = () => {
    PackageAllData()
      .then((res) => setPackages(res.data || []))
      .catch((err) => {
        console.error('Load packages failed', err)
        toast.error('Failed to load packages')
      })
  }

  useEffect(() => {
    loadProcedures();
  }, []);

  const loadProcedures = () => {
    getAllProcedures()
      .then((res) => {
        setAllProcedures(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load procedures", err);
      });
  };
  useEffect(() => {
    setAllProcedures([
      { id: 1, name: "Hair PRP" },
      { id: 2, name: "Laser Facial" },
      { id: 3, name: "Chemical Peel" }
    ]);
  }, []);

  // const loadClinics = () => {
  //   ClinicAllData()
  //     .then((res) => setClinics(res.data || []))
  //     .catch((err) => {
  //       console.error('Load clinics failed', err)
  //       // no toast to avoid noise
  //     })
  // }



  const statusForKey = (key) => {
    if (key === 0) return 'All'
    if (key === 1) return 'Active'
    if (key === 2) return 'Inactive'
    return 'Expired'
  }

  const validate = () => {
    const e = {}

    // Required fields
    if (!form.packageName?.trim()) e.packageName = 'Package name is required'
    if (!form.price || Number(form.price) <= 0) e.price = 'Valid price is required'
    if (!form.durationNumber || !form.durationUnit) {
      e.duration = "Duration is required";
    }

    if (!form.clinicId) e.clinicId = 'Clinic is required'
    if (!form.clinicAddress?.trim()) e.clinicAddress = 'Clinic address is required'

    // Procedures validation
    if (!form.procedures.length) {
      e.procedures = 'At least one procedure is required'
    } else {
      form.procedures.forEach((p, idx) => {
        if (!p.procedureName?.trim()) {
          e[`procedureName_${idx}`] = 'Procedure name is required'
        }
        if (!p.noOfSittings || p.noOfSittings <= 0) {
          e[`noOfSittings_${idx}`] = 'Sittings must be greater than 0'
        }
      })
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // calculations: discount, taxes, final costs
  const calculateTotals = (f) => {
    const price = Number(f.price) || 0

    const discountPercentage = Number(f.discountPercentage) || 0
    const discountAmount = Number(f.discountAmount) || (price * discountPercentage) / 100
    const priceAfterDiscount = price - discountAmount
    const taxPercentage = Number(f.taxPercentage) || 0
    const taxAmount = Number(f.taxAmount) || (priceAfterDiscount * taxPercentage) / 100
    const gst = Number(f.gst) || 0
    const gstAmount = Number(f.gstAmount) || (priceAfterDiscount * gst) / 100
    const platformFeePercentage = Number(f.platformFeePercentage) || 0
    const platformFee = Number(f.platformFee) || (priceAfterDiscount * platformFeePercentage) / 100
    const consultationFee = Number(f.consultationFee) || 0
    const discountedCost = priceAfterDiscount + taxAmount + gstAmount + consultationFee
    const finalCost = discountedCost + platformFee
    const clinicPay = discountedCost - platformFee

    return {
      ...f,
      discountAmount,
      taxAmount,
      gstAmount,
      platformFee,
      discountedCost,
      finalCost,
      clinicPay,
    }
  }

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Build final readable duration: "1 Day", "5 Weeks", etc.
    const finalDuration =
      form.durationNumber && form.durationUnit
        ? `${form.durationNumber} ${form.durationUnit}${form.durationNumber > 1 ? "s" : ""}`
        : "";

    // Prepare final form for API
    const prepared = calculateTotals({
      ...form,
      duration: finalDuration,  // <-- final combined duration
    });

    if (isEditMode && selectedPackage) {
      UpdatePackage(selectedPackage.packageId, prepared)
        .then(() => {
          toast.success("Package updated successfully");
          loadPackages();
          setModalVisible(false);
          setIsEditMode(false);
          setSelectedPackage(null);
          setForm(defaultForm);
        })
        .catch((err) => {
          console.error("Update failed", err);
          toast.error("Update failed");
        });
    } else {
      AddPackage(prepared)
        .then(() => {
          toast.success("Package added successfully");
          loadPackages();
          setModalVisible(false);
          setForm(defaultForm);
        })
        .catch((err) => {
          console.error("Add failed", err);
          toast.error("Add failed");
        });
    }
  };


  const handleDeleteConfirm = () => {
    if (!toDeleteId) return
    DeletePackage(toDeleteId)
      .then(() => {
        toast.success('Package deleted successfully')
        loadPackages()
        setDeleteModalVisible(false)
      })
      .catch((err) => {
        console.error('Delete failed', err)
        toast.error('Delete failed')
      })
  }

  const filteredPackages =
    activeKey === 0 ? packages : packages.filter((p) => p.status === statusForKey(activeKey))

  const indexOfLast = currentPage * itemsPerPage
  const indexOfFirst = indexOfLast - itemsPerPage
  const currentItems = filteredPackages.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage) || 1

  const onSelectPackageToView = (pkg) => {
    setSelectedPackage(pkg)
    setViewModalVisible(true)
  }

  const onEdit = (pkg) => {
    setIsEditMode(true);
    setSelectedPackage(pkg);

    // Extract duration number + unit
    let durationNumber = "";
    let durationUnit = "Day";

    if (pkg.duration) {
      const parts = pkg.duration.trim().split(" ");
      durationNumber = parts[0] || "";
      durationUnit = parts[1]?.replace(/s$/, "") || "Day"; // Remove plural "s"
    }

    setForm({
      packageId: pkg.packageId || "",
      packageName: pkg.packageName || "",
      clinicId: pkg.clinicId || "",
      clinicName: pkg.clinicName || "",
      clinicAddress: pkg.clinicAddress || "",
      procedures: pkg.procedures && pkg.procedures.length
        ? pkg.procedures
        : [{ procedureName: "", noOfSittings: 1 }],
      sittings: pkg.sittings || 0,
      description: pkg.description || "",

      price: pkg.price || 0,
      discountPercentage: pkg.discountPercentage || 0,
      discountAmount: pkg.discountAmount || 0,
      taxPercentage: pkg.taxPercentage || 0,
      taxAmount: pkg.taxAmount || 0,
      gst: pkg.gst || 0,
      gstAmount: pkg.gstAmount || 0,
      platformFeePercentage: pkg.platformFeePercentage || 0,
      platformFee: pkg.platformFee || 0,
      consultationFee: pkg.consultationFee || 0,
      discountedCost: pkg.discountedCost || 0,
      clinicPay: pkg.clinicPay || 0,
      finalCost: pkg.finalCost || 0,
      status: pkg.status || "Active",

      // ---------------------
      // ADD THESE:
      // ---------------------
      durationNumber,
      durationUnit,
      duration: pkg.duration || ""
    });

    setModalVisible(true);
  };


  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (err) => reject(err)
    })

  const renderTable = () => (
    <>
      <CTable striped hover responsive>
        <CTableHead className="pink-table">
          <CTableRow>
            <CTableHeaderCell>S.No</CTableHeaderCell>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Clinic</CTableHeaderCell>
            <CTableHeaderCell>Price</CTableHeaderCell>
            <CTableHeaderCell>Duration</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody className="pink-table">
          {currentItems.length ? (
            currentItems.map((pkg, i) => (
              <CTableRow key={pkg.packageId || pkg.id || i}>
                <CTableDataCell>{indexOfFirst + i + 1}</CTableDataCell>
                <CTableDataCell>{pkg.packageName}</CTableDataCell>
                <CTableDataCell>{pkg.clinicName}</CTableDataCell>
                <CTableDataCell>₹{pkg.price}</CTableDataCell>
                <CTableDataCell>{pkg.duration}</CTableDataCell>
                <CTableDataCell>
                  <CBadge color={getBadgeColor(pkg.status)}>{pkg.status}</CBadge>
                </CTableDataCell>
                <CTableDataCell className="text-center">
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    <button className="actionBtn" onClick={() => onSelectPackageToView(pkg)}>
                      <Eye size={18} />
                    </button>

                    <button className="actionBtn" onClick={() => onEdit(pkg)}>
                      <Edit2 size={18} />
                    </button>

                    <button
                      className="actionBtn"
                      onClick={() => {
                        setToDeleteId(pkg.packageId)
                        setDeleteModalVisible(true)
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan={7} className="text-center text-muted">
                No records found
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      {filteredPackages.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            Rows per page:
            <select
              className="ms-2"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>

          <div>
            <span className="me-3">
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredPackages.length)} of{' '}
              {filteredPackages.length}
            </span>

            <CPagination>
              <CPaginationItem disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                Previous
              </CPaginationItem>

              {[...Array(totalPages)].map((_, i) => (
                <CPaginationItem key={i} active={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </CPaginationItem>
              ))}

              <CPaginationItem disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                Next
              </CPaginationItem>
            </CPagination>
          </div>
        </div>
      )}
    </>
  )
  const RequiredLabel = ({ label }) => (
    <span>
      {label} <span style={{ color: 'red' }}>*</span>
    </span>
  )
  const clearError = (field) => {
    setErrors((prev) => {
      const newErr = { ...prev }
      delete newErr[field]
      return newErr
    })
  }
  const resetForm = () => {
    setForm({
      packageId: "",
      packageName: "",
      clinicId: "",
      clinicName: "",
      clinicAddress: "",
      procedures: [{ procedureName: "", noOfSittings: 1 }],
      sittings: 0,
      description: "",

      price: 0,
      discountPercentage: 0,
      discountAmount: 0,
      taxPercentage: 0,
      taxAmount: 0,
      gst: 0,
      gstAmount: 0,
      platformFeePercentage: 0,
      platformFee: 0,
      consultationFee: 0,
      discountedCost: 0,
      clinicPay: 0,
      finalCost: 0,
      status: "Active",

      // IMPORTANT — RESET THESE TOO
      durationNumber: "",
      durationUnit: "Day",
      duration: "",
    })

    setErrors({})
  }
  const handleGetLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        alert("Location is not supported on this device");
        resolve(false);
        return;
      }

      setLoadingLocation(true);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;

            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );

            const data = await response.json();

            const readable =
              (data && data.display_name) ? data.display_name : `${latitude}, ${longitude}`;

            // update the clinicAddress in form
            setForm((prev) => ({
              ...prev,
              clinicAddress: readable,
            }));

            // clear any address error if present
            clearError("clinicAddress");

            setLoadingLocation(false);
            resolve(true);
          } catch (error) {
            console.error(error);
            setLoadingLocation(false);
            alert("Unable to fetch address");
            resolve(false);
          }
        },
        (err) => {
          console.error(err);
          setLoadingLocation(false);
          alert("Location permission denied");
          resolve(false);
        },
        // optional options:
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };


  return (
    <CCard className="shadow-sm border-light">
      <ToastContainer position="top-right" />

      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Package Management</h4>

        <CButton
          style={{ backgroundColor: COLORS.black, color: 'white' }}
          onClick={() => {
            setIsEditMode(false)
            setSelectedPackage(null)
            setForm(defaultForm)
            setModalVisible(true)
          }}
        >
          + Add Package
        </CButton>
      </CCardHeader>

      <CCardBody>
        {/* TABS */}
        <CNav variant="tabs" className="mb-3">
          <CNavItem>
            <CNavLink active={activeKey === 0} onClick={() => setActiveKey(0)}>
              All
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)}>
              Active
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 2} onClick={() => setActiveKey(2)}>
              Inactive
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 3} onClick={() => setActiveKey(3)}>
              Expired
            </CNavLink>
          </CNavItem>
        </CNav>

        <CTabContent>
          <CTabPane visible>{renderTable()}</CTabPane>
        </CTabContent>

        {/* Add/Edit Modal */}
        <CModal
          visible={modalVisible}
          onClose={() => {
            resetForm()
            setModalVisible(false)
          }}
          size="lg"
        >

          <CModalHeader>
            <CModalTitle>{isEditMode ? 'Edit Package' : 'Add Package'}</CModalTitle>
          </CModalHeader>

          <form onSubmit={handleAddOrUpdate}>
            <CModalBody style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <CRow className="g-3">

                <CCol md={12}>
                  <CFormInput
                    label={<RequiredLabel label="Package Name" />}
                    value={form.packageName}
                    onChange={(e) => {
                      setForm({ ...form, packageName: e.target.value })
                      clearError("packageName")
                    }}

                    invalid={!!errors.packageName}
                  />
                  {errors.packageName && <div className="text-danger">{errors.packageName}</div>}

                </CCol>

                <CCol md={6}>
                  <CFormInput
                    type="text"
                    label={<RequiredLabel label="Price" />}
                    value={form.price}
                    onChange={(e) => {
                      let value = e.target.value;

                      // Allow ONLY digits and dot
                      value = value.replace(/[^0-9.]/g, '');

                      // Prevent leading zeros like "0123"
                      if (value.length > 1 && value.startsWith("0") && !value.startsWith("0.")) {
                        value = value.replace(/^0+/, "");
                      }

                      // Update form
                      setForm({ ...form, price: value });

                      // Clear the error if any
                      if (errors.price) {
                        setErrors({ ...errors, price: '' });
                      }
                    }}
                    invalid={!!errors.price}
                  />


                  {errors.price && <div className="text-danger">{errors.price}</div>}
                </CCol>

                <CCol md={6}>
                  <label><RequiredLabel label="Duration" /></label>

                  <div style={{ display: "flex", gap: "10px" }}>
                    {/* NUMBER INPUT */}
                    <CFormInput
                      type="number"
                      min="1"
                      value={form.durationNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        setForm({ ...form, durationNumber: value });
                        clearError("duration");
                      }}
                      invalid={!!errors.duration}
                      placeholder="Enter number"
                      style={{ flex: 1 }}
                    />

                    {/* UNIT DROPDOWN */}
                    <CFormSelect
                      value={form.durationUnit}
                      onChange={(e) => {
                        setForm({ ...form, durationUnit: e.target.value });
                        clearError("duration");
                      }}
                      invalid={!!errors.duration}
                      style={{ width: "150px" }}
                    >
                      <option value="">Select Unit</option>
                      <option value="day">Day</option>
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                    </CFormSelect>
                  </div>

                  {errors.duration && (
                    <div className="text-danger">{errors.duration}</div>
                  )}
                </CCol>


                <CCol md={4}>
                  <CFormSelect
                    label={<RequiredLabel label="Clinic" />}
                    value={form.clinicId}
                    onChange={(e) => {
                      const clinicId = e.target.value

                      const clinic = clinics.find((c) => String(c.clinicId) === clinicId) || {}

                      setForm({
                        ...form,
                        clinicId,
                        clinicName: clinic.clinicName || '',
                        clinicAddress: clinic.clinicAddress || '',
                      })

                      // 🟢 Remove the error because user selected a value
                      if (clinicId) {
                        clearError("clinicId")
                      }
                    }}
                    invalid={!!errors.clinicId}
                  >
                    <option value="">Select Clinic</option>
                    {clinics.map((c) => (
                      <option key={c.clinicId} value={String(c.clinicId)}>
                        {c.clinicName}
                      </option>
                    ))}
                  </CFormSelect>

                  {errors.clinicId && <div className="text-danger">{errors.clinicId}</div>}
                </CCol>
                <CCol md={8}>
                  <div className="d-flex align-items-end gap-2">

                    {/* Address Input */}
                    <div className="flex-grow-1">
                      <CFormInput
                        label={<RequiredLabel label="Clinic Address" />}
                        value={form.clinicAddress}
                        onChange={(e) => {
                          const value = e.target.value;
                          setForm((prev) => ({ ...prev, clinicAddress: value }));
                          if (value.trim() !== "") clearError("clinicAddress");
                        }}
                        invalid={!!errors.clinicAddress}
                      />
                      {errors.clinicAddress && (
                        <div className="text-danger">{errors.clinicAddress}</div>
                      )}
                    </div>

                    {/* Button Beside Input */}
                    <div style={{ marginTop: "30px" }}>
                      <CButton
                        color="primary"
                        onClick={handleGetLocation}
                        disabled={loadingLocation}
                      >
                        {loadingLocation ? "Fetching..." : "Use Current Location"}
                      </CButton>
                    </div>

                  </div>
                </CCol>



                {/* ------------------ PROCEDURES SECTION (FINAL CLEAN VERSION) ------------------ */}

                {/* Section Title */}
                <CCol md={12}>
                  <div className="mb-2"><strong>Procedures</strong></div>
                </CCol>

                {/* Procedure Dropdown */}
                <CCol md={4}>
                  <CFormSelect
                  
                      label={<RequiredLabel label="Procedure" />}
                    value={form.selectedProcedure || ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, selectedProcedure: e.target.value }))
                    }
                  >
                    <option value="">Select Procedure</option>
                    {allProcedures.map((proc) => (
                      <option key={proc.id} value={proc.name}>
                        {proc.name}
                      </option>
                    ))}
                  </CFormSelect>
                  {errors?.procedures && (
                    <small style={{ color: "red" }}>{errors.procedures}</small>
                  )}
                </CCol>

                {/* No. of Sittings */}
                <CCol md={4}>
                  <CFormInput
                    type="number"
                    min={1}
                    label="No. of Sittings"
                    value={form.selectedSittings || 1}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        selectedSittings: Number(e.target.value),
                      }))
                    }
                  />
                </CCol>

                {/* Add Procedure Button */}
                <CCol md={3} className="d-flex align-items-end">
                  <CButton
                    color="secondary"
                    onClick={() => {
                      if (!form.selectedProcedure) {
                        alert("Please select a procedure");
                        return;
                      }

                      const newRow = {
                        procedureName: form.selectedProcedure,
                        noOfSittings: form.selectedSittings,
                      };

                      setForm((prev) => ({
                        ...prev,
                        procedures: [...prev.procedures, newRow],
                        selectedProcedure: "",
                        selectedSittings: 1,
                      }));
                    }}
                  >
                    + Add Procedure
                  </CButton>
                </CCol>

                {/* Procedures Table */}
                {form.procedures.length > 0 && (
                  <CCol md={12} className="mt-4">

                    <div className="table-responsive shadow-sm rounded border">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark">
                          <tr>
                            <th style={{ width: "45%" }}>Procedure</th>
                            <th style={{ width: "25%" }}>No. of Sittings</th>
                            <th style={{ width: "20%" }} className="text-center">Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {form.procedures.map((row, idx) => (
                            <tr key={idx}>
                              <td className="fw-semibold">{row.name}</td>

                              <td>
                                <span className="badge bg-primary px-3 py-2">
                                  {row.sittings}
                                </span>
                              </td>

                              <td className="text-center">
                                <CButton
                                  color="danger"
                                  size="sm"
                                  className="px-3"
                                  onClick={() => {
                                    const updated = form.procedures.filter((_, i) => i !== idx);
                                    setForm((prev) => ({ ...prev, procedures: updated }));
                                  }}
                                >
                                  Remove
                                </CButton>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </CCol>
                )}

                <CCol md={12}>
                  <CFormInput label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </CCol>


                <CCol md={4}><CFormInput label="Discount %" value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value.replace(/[^0-9.]/g, '') })} /></CCol>
                <CCol md={4}><CFormInput label="Tax %" value={form.taxPercentage} onChange={(e) => setForm({ ...form, taxPercentage: e.target.value.replace(/[^0-9.]/g, '') })} /></CCol>
                <CCol md={4}><CFormInput label="GST %" value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value.replace(/[^0-9.]/g, '') })} /></CCol>

                <CCol md={6}><CFormInput label="Platform Fee %" value={form.platformFeePercentage} onChange={(e) => setForm({ ...form, platformFeePercentage: e.target.value.replace(/[^0-9.]/g, '') })} /></CCol>
                <CCol md={6}><CFormInput label="Consultation Fee" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value.replace(/[^0-9.]/g, '') })} /></CCol>

                <CCol md={4}><CFormInput label="Discount Amount" value={form.discountAmount} readOnly /></CCol>
                <CCol md={4}><CFormInput label="GST Amount" value={form.gstAmount} readOnly /></CCol>
                <CCol md={4}><CFormInput label="Platform Fee" value={form.platformFee} readOnly /></CCol>

                <CCol md={6}><CFormInput label="Clinic Pay" value={form.clinicPay} readOnly /></CCol>
                <CCol md={6}><CFormInput label="Final Cost" value={form.finalCost} readOnly /></CCol>

                <CCol md={6}><CFormSelect label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Inactive</option><option>Expired</option></CFormSelect></CCol>
                <CCol md={6}><CFormInput label="Sittings" type="number" value={form.sittings} onChange={(e) => setForm({ ...form, sittings: Number(e.target.value) })} /></CCol>

              </CRow>
            </CModalBody>

            <CModalFooter>
              <CButton
                color="secondary"
                onClick={() => {
                  resetForm()
                  setModalVisible(false)
                }}
              >
                Cancel
              </CButton>
              <CButton color="primary" type="submit" onClick={() => setForm(calculateTotals(form))}>{isEditMode ? 'Update' : 'Add'}</CButton>
            </CModalFooter>
          </form>
        </CModal>

        {/* View Modal */}
        <CModal visible={viewModalVisible} onClose={() => setViewModalVisible(false)} size="lg">
          <CModalHeader><CModalTitle>Package Details</CModalTitle></CModalHeader>
          <CModalBody>
            {selectedPackage && (
              <div>
                <p><strong>Name:</strong> {selectedPackage.packageName}</p>
                <p><strong>Clinic:</strong> {selectedPackage.clinicName}</p>
                <p><strong>Price:</strong> ₹{selectedPackage.price}</p>
                <p><strong>Description:</strong> {selectedPackage.description}</p>
                <h6>Procedures</h6>
                <ul>{(selectedPackage.procedures || []).map((p, i) => (<li key={i}>{p.procedureName} - {p.noOfSittings} sittings</li>))}</ul>
              </div>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setViewModalVisible(false)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Delete Confirmation */}
        <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
          <CModalHeader><CModalTitle>Confirm Delete</CModalTitle></CModalHeader>
          <CModalBody>Are you sure you want to delete this package?</CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>Cancel</CButton>
            <CButton color="danger" onClick={handleDeleteConfirm}>Delete</CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  )
}

export default PackageManagement 