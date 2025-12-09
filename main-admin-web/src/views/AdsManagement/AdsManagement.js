import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CCard,
  CCardBody,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormLabel,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CImage,
} from "@coreui/react";
import { Eye, Trash2, Edit2 } from "lucide-react";
import { BASE_URL_API } from "../../baseUrl";

const AdsManagement = () => {
  const [activeKey, setActiveKey] = useState(1);
  const [adsData, setAdsData] = useState({ dashboard: [], service: [], clinic: [] });

  // Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", media: "", mediaType: "" });
  const [formErrors, setFormErrors] = useState({ title: "", media: "" });

  // View Modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ _id: "", title: "", media: "", mediaType: "" });
  const [editErrors, setEditErrors] = useState({ title: "", media: "" });

  // Fetch Ads
  const fetchAds = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL_API}/ads`);
      setAdsData({
        dashboard: data.filter((ad) => ad.type === "dashboard"),
        service: data.filter((ad) => ad.type === "service"),
        clinic: data.filter((ad) => ad.type === "clinic"),
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // Open Add Modal
  const openAddModal = () => {
    setFormData({ title: "", media: "", mediaType: "" });
    setFormErrors({ title: "", media: "" });
    setShowAddModal(true);
  };

  // Handle Media Upload
  const handleMediaUpload = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const type = file.type.startsWith("image") ? "image" : "video";
      if (isEdit) {
        setEditData({ ...editData, media: URL.createObjectURL(file), mediaType: type });
        setEditErrors({ ...editErrors, media: "" });
      } else {
        setFormData({ ...formData, media: URL.createObjectURL(file), mediaType: type });
        setFormErrors({ ...formErrors, media: "" });
      }
    }
  };

  // Validate Add Form
  const validateAddForm = () => {
    let errors = { title: "", media: "" };
    let valid = true;
    if (!formData.title.trim()) {
      errors.title = "Title is required.";
      valid = false;
    }
    if (!formData.media) {
      errors.media = "Media file is required.";
      valid = false;
    }
    setFormErrors(errors);
    return valid;
  };

  // Save Ad
  const handleSaveAd = async () => {
    if (!validateAddForm()) return;

    const typeKey = activeKey === 1 ? "dashboard" : activeKey === 2 ? "service" : "clinic";
    const payload = {
      title: formData.title,
      type: typeKey,
      media: formData.media,
      mediaType: formData.mediaType,
    };

    try {
      const { data } = await axios.post(`${BASE_URL_API}/ads`, payload);
      setAdsData((prev) => ({
        ...prev,
        [typeKey]: [...prev[typeKey], data.data],
      }));
      setShowAddModal(false);
      setFormData({ title: "", media: "", mediaType: "" });
      setFormErrors({ title: "", media: "" });
    } catch (err) {
      console.log(err);
    }
  };

  // Validate Edit Form
  const validateEditForm = () => {
    let errors = { title: "", media: "" };
    let valid = true;
    if (!editData.title.trim()) {
      errors.title = "Title is required.";
      valid = false;
    }
    if (!editData.media) {
      errors.media = "Media file is required.";
      valid = false;
    }
    setEditErrors(errors);
    return valid;
  };

  // Update Ad
  const handleUpdateAd = async () => {
    if (!validateEditForm()) return;

    const payload = {
      title: editData.title,
      media: editData.media,
      mediaType: editData.mediaType,
    };

    try {
      await axios.put(`${BASE_URL_API}/ads/${editData._id}`, payload);
      fetchAds();
      setShowEditModal(false);
      setEditData({ _id: "", title: "", media: "", mediaType: "" });
      setEditErrors({ title: "", media: "" });
    } catch (err) {
      console.log(err);
    }
  };

  // Delete Ad
  const deleteAd = async (id) => {
    if (!window.confirm("Delete this ad?")) return;
    try {
      await axios.delete(`${BASE_URL_API}/ads/${id}`);
      fetchAds();
    } catch (err) {
      console.log(err);
    }
  };

  // View & Edit Handlers
  const handleView = (ad) => {
    setSelectedAd(ad);
    setShowViewModal(true);
  };

  const handleEdit = (ad) => {
    setEditData({ _id: ad._id, title: ad.title || "", media: ad.media || "", mediaType: ad.mediaType || "image" });
    setEditErrors({ title: "", media: "" });
    setShowEditModal(true);
  };

  const getActiveAds = activeKey === 1 ? adsData.dashboard : activeKey === 2 ? adsData.service : adsData.clinic;

  return (
    <CCard>
      <div className="text-white p-3 d-flex justify-content-between align-items-center rounded"
        style={{ background: "linear-gradient(135deg, var(--color-black), var(--color-bgcolor))" }}>
        <h5 className="mb-1" style={{ color: "white" }}>Advertisement Management</h5>
        <CButton color="primary" onClick={openAddModal}>+ Add Ad</CButton>
      </div>

      <CCardBody>
        {/* Tabs */}
        <CNav variant="tabs" className="mb-3">
          <CNavItem><CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)}>Dashboard Ads</CNavLink></CNavItem>
          <CNavItem><CNavLink active={activeKey === 2} onClick={() => setActiveKey(2)}>Service Ads</CNavLink></CNavItem>
          <CNavItem><CNavLink active={activeKey === 3} onClick={() => setActiveKey(3)}>Clinic Ads</CNavLink></CNavItem>
        </CNav>

        {/* Table */}
        <CTabContent>
          <CTabPane visible={true}>
            <CCard className="border-light shadow-sm">
              <CCardBody>
                <h5 className="fw-bold mb-3">{activeKey === 1 ? "Dashboard Ads" : activeKey === 2 ? "Service Ads" : "Clinic Ads"}</h5>
                <div className="table-responsive">
                  <CTable striped hover responsive>
                    <CTableHead className="pink-table">
                      <CTableRow>
                        <CTableHeaderCell className="text-center">S.No</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Title</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Media</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody className="pink-table">
                      {getActiveAds.length === 0 ? (
                        <CTableRow ><CTableDataCell colSpan={4} className="text-center">No Ads Found</CTableDataCell></CTableRow>
                      ) : (
                        getActiveAds.map((ad, index) => (
                          <CTableRow key={ad._id}>
                            <CTableDataCell className="text-center">{index + 1}</CTableDataCell>
                            <CTableDataCell className="text-center">{ad.title}</CTableDataCell>
                            <CTableDataCell className="text-center">
                              {ad.mediaType === "image" && <CImage src={ad.media} width="80" height="60" style={{ objectFit: "contain", background: "#f8f8f8", padding: "3px" }} />}
                              {ad.mediaType === "video" && <video src={ad.media} width="80" height="60" controls />}
                            </CTableDataCell>
                            <CTableDataCell className="text-center">
                              <div className="d-flex justify-content-center gap-2">
                                <button className="actionBtn view" onClick={() => handleView(ad)}><Eye size={18} /></button>
                                <button className="actionBtn edit" onClick={() => handleEdit(ad)}><Edit2 size={18} /></button>
                                <button className="actionBtn delete" onClick={() => deleteAd(ad._id)}><Trash2 size={18} /></button>
                              </div>
                            </CTableDataCell>
                          </CTableRow>
                        ))
                      )}
                    </CTableBody>
                  </CTable>
                </div>
              </CCardBody>
            </CCard>
          </CTabPane>
        </CTabContent>
      </CCardBody>

      {/* ADD MODAL */}
      <CModal visible={showAddModal} onClose={() => setShowAddModal(false)}>
        <CModalHeader><CModalTitle>Add Advertisement</CModalTitle></CModalHeader>
        <CModalBody>
          <CFormLabel>Title <span style={{ color: "red" }}>*</span></CFormLabel>
          <CFormInput
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (e.target.value.trim() !== "") setFormErrors({ ...formErrors, title: "" });
            }}
          />
          {formErrors.title && <div style={{ color: "red", fontSize: "0.85em" }}>{formErrors.title}</div>}

          <CFormLabel className="mt-3">Upload Media (Image/Video) <span style={{ color: "red" }}>*</span></CFormLabel>
          <CFormInput type="file" accept="image/*,video/mp4" onChange={(e) => handleMediaUpload(e)} />
          {formErrors.media && <div style={{ color: "red", fontSize: "0.85em" }}>{formErrors.media}</div>}

          {formData.media && formData.mediaType === "image" && <img src={formData.media} alt="Preview" style={{ width: "100%", marginTop: "10px", borderRadius: "8px", border: "1px solid #ddd" }} />}
          {formData.media && formData.mediaType === "video" && <video controls src={formData.media} style={{ width: "100%", marginTop: "10px", borderRadius: "8px", border: "1px solid #ddd" }} />}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowAddModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSaveAd}>Save</CButton>
        </CModalFooter>
      </CModal>

      {/* EDIT MODAL */}
      <CModal visible={showEditModal} onClose={() => setShowEditModal(false)}>
        <CModalHeader><CModalTitle>Edit Advertisement</CModalTitle></CModalHeader>
        <CModalBody>
          <CFormLabel>Title <span style={{ color: "red" }}>*</span></CFormLabel>
          <CFormInput
            value={editData.title}
            onChange={(e) => {
              setEditData({ ...editData, title: e.target.value });
              if (e.target.value.trim() !== "") setEditErrors({ ...editErrors, title: "" });
            }}
          />
          {editErrors.title && <div style={{ color: "red", fontSize: "0.85em" }}>{editErrors.title}</div>}

          <CFormLabel className="mt-3">Upload Media (Image/Video) <span style={{ color: "red" }}>*</span></CFormLabel>
          <CFormInput type="file" accept="image/*,video/mp4" onChange={(e) => handleMediaUpload(e, true)} />
          {editErrors.media && <div style={{ color: "red", fontSize: "0.85em" }}>{editErrors.media}</div>}

          {editData.media && editData.mediaType === "image" && <img src={editData.media} alt="Preview" style={{ width: "100%", marginTop: "10px", borderRadius: "8px", border: "1px solid #ddd" }} />}
          {editData.media && editData.mediaType === "video" && <video controls src={editData.media} style={{ width: "100%", marginTop: "10px", borderRadius: "8px", border: "1px solid #ddd" }} />}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowEditModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleUpdateAd}>Update</CButton>
        </CModalFooter>
      </CModal>

      {/* VIEW MODAL */}
      <CModal visible={showViewModal} onClose={() => setShowViewModal(false)}>
        <CModalHeader><CModalTitle>View Advertisement</CModalTitle></CModalHeader>
        <CModalBody>
          {selectedAd && (
            <>
              <h5>{selectedAd.title}</h5>
              {selectedAd.mediaType === "image" && <CImage src={selectedAd.media} style={{ width: "100%", objectFit: "contain" }} />}
              {selectedAd.mediaType === "video" && <video controls src={selectedAd.media} style={{ width: "100%" }} />}
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="dark" onClick={() => setShowViewModal(false)}>Close</CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  );
};

export default AdsManagement;
