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
  const [adsData, setAdsData] = useState({
    dashboard: [],
    service: [],
    clinic: [],
  });

  // Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", image: "", type: "" });

  // View Modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ _id: "", title: "", image: "" });

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

  // OPEN Add Modal + CLEAR FORM
  const openAddModal = () => {
    setFormData({ title: "", image: "", type: "" });
    setShowAddModal(true);
  };

  // Add Image Preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: URL.createObjectURL(file) });
    }
  };

  // Add Advert
  const handleSaveAd = async () => {
    const type =
      activeKey === 1 ? "dashboard" : activeKey === 2 ? "service" : "clinic";

    try {
      const { data } = await axios.post(`${BASE_URL_API}/ads`, {
        ...formData,
        type,
      });

      setAdsData((prev) => ({
        ...prev,
        [type]: [...prev[type], data.data],
      }));

      setShowAddModal(false);
      setFormData({ title: "", image: "", type: "" });
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

  // View Ad
  const handleView = (ad) => {
    setSelectedAd(ad);
    setShowViewModal(true);
  };

  // OPEN Edit Modal + RESET BEFORE OPEN
  const handleEdit = (ad) => {
    setEditData({
      _id: ad._id,
      title: ad.title || "",
      image: ad.image || "",
    });
    setShowEditModal(true);
  };

  // Edit Image Preview
  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditData({ ...editData, image: URL.createObjectURL(file) });
    }
  };

  // Update Ad
  const handleUpdateAd = async () => {
    try {
      const { data } = await axios.put(
        `${BASE_URL_API}/ads/${editData._id}`,
        {
          title: editData.title,
          image: editData.image,
        }
      );

      fetchAds(); // refresh list
      setShowEditModal(false);
      setEditData({ _id: "", title: "", image: "" });
    } catch (err) {
      console.log(err);
    }
  };

  const getActiveAds =
    activeKey === 1
      ? adsData.dashboard
      : activeKey === 2
        ? adsData.service
        : adsData.clinic;

  return (
    <CCard>
      {/* HEADER */}
      <div
        className="text-white p-3 d-flex justify-content-between align-items-center rounded"
        style={{
          background:
            "linear-gradient(135deg, var(--color-black), var(--color-bgcolor))",
        }}
      >
        <h5 className="mb-1" style={{ color: 'white' }}>Advertisement Management</h5>
        <CButton color="primary" onClick={openAddModal}>
          + Add Ad
        </CButton>
      </div>

      <CCardBody>
        {/* TABS */}
        <CNav variant="tabs" className="mb-3">
          <CNavItem>
            <CNavLink
              active={activeKey === 1}
              onClick={() => setActiveKey(1)}
              style={{ cursor: "pointer" }}
            >
              Dashboard Ads
            </CNavLink>
          </CNavItem>

          <CNavItem>
            <CNavLink
              active={activeKey === 2}
              onClick={() => setActiveKey(2)}
              style={{ cursor: "pointer" }}
            >
              Service Ads
            </CNavLink>
          </CNavItem>

          <CNavItem>
            <CNavLink
              active={activeKey === 3}
              onClick={() => setActiveKey(3)}
              style={{ cursor: "pointer" }}
            >
              Clinic Ads
            </CNavLink>
          </CNavItem>
        </CNav>

        {/* TABLE */}
        <CTabContent>
          <CTabPane visible={true}>
            <CCard className="border-light shadow-sm">
              <CCardBody>
                <h5 className="fw-bold mb-3">
                  {activeKey === 1
                    ? "Dashboard Ads"
                    : activeKey === 2
                      ? "Service Ads"
                      : "Clinic Ads"}
                </h5>

                <div className="table-responsive">
                  <CTable striped hover responsive>
                    <CTableHead className='pink-table'>
                      <CTableRow>
                        <CTableHeaderCell className="text-center">
                          S.No
                        </CTableHeaderCell>
                        <CTableHeaderCell className="text-center">
                          Title
                        </CTableHeaderCell>
                        <CTableHeaderCell className="text-center">
                          Image
                        </CTableHeaderCell>
                        <CTableHeaderCell className="text-center">
                          Actions
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>

                    <CTableBody className='pink-table'>
                      {getActiveAds.length === 0 ? (
                        <CTableRow>
                          <CTableDataCell
                            colSpan={4}
                            className="text-center"
                          >
                            No Ads Found
                          </CTableDataCell>
                        </CTableRow>
                      ) : (
                        getActiveAds.map((ad, index) => (
                          <CTableRow key={ad._id}>
                            <CTableDataCell className="text-center">
                              {index + 1}
                            </CTableDataCell>

                            <CTableDataCell className="text-center">
                              {ad.title}
                            </CTableDataCell>

                            <CTableDataCell className="text-center">
                              <CImage
                                src={ad.image}
                                width="80"
                                height="60"
                                style={{
                                  objectFit: "contain",
                                  background: "#f8f8f8",
                                  padding: "3px",
                                }}
                              />
                            </CTableDataCell>

                            <CTableDataCell className="text-center">
                              <div className="d-flex justify-content-center gap-2">
                                <button
                                  className="actionBtn view"
                                  title="View"
                                  onClick={() => handleView(ad)}
                                >
                                  <Eye size={18} />
                                </button>

                                <button
                                  className="actionBtn edit"
                                  title="Edit"
                                  onClick={() => handleEdit(ad)}
                                >
                                  <Edit2 size={18} />
                                </button>

                                <button
                                  className="actionBtn delete"
                                  title="Delete"
                                  onClick={() => deleteAd(ad._id)}
                                >
                                  <Trash2 size={18} />
                                </button>
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
        <CModalHeader>
          <CModalTitle>Add Advertisement</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CFormLabel>Title</CFormLabel>
          <CFormInput
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <CFormLabel className="mt-3">Image</CFormLabel>
          <CFormInput type="file" onChange={handleImageUpload} />

          {formData.image && (
            <img
              src={formData.image}
              alt="Preview"
              style={{
                width: "100%",
                marginTop: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            />
          )}
        </CModalBody>

        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setShowAddModal(false);
              setFormData({ title: "", image: "", type: "" });
            }}
          >
            Cancel
          </CButton>

          <CButton color="primary" onClick={handleSaveAd}>
            Save
          </CButton>
        </CModalFooter>
      </CModal>

      {/* VIEW MODAL */}
      <CModal visible={showViewModal} onClose={() => setShowViewModal(false)}>
        <CModalHeader>
          <CModalTitle>View Advertisement</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {selectedAd && (
            <>
              <h5>{selectedAd.title}</h5>
              <CImage
                src={selectedAd.image}
                style={{ width: "100%", objectFit: "contain" }}
              />
            </>
          )}
        </CModalBody>

        <CModalFooter>
          <CButton color="dark" onClick={() => setShowViewModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* EDIT MODAL */}
      <CModal visible={showEditModal} onClose={() => setShowEditModal(false)}>
        <CModalHeader>
          <CModalTitle>Edit Advertisement</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CFormLabel>Title</CFormLabel>
          <CFormInput
            value={editData.title}
            onChange={(e) =>
              setEditData({ ...editData, title: e.target.value })
            }
          />

          <CFormLabel className="mt-3">Image</CFormLabel>
          <CFormInput type="file" onChange={handleEditImageUpload} />

          {editData.image && (
            <img
              src={editData.image}
              alt="Preview"
              style={{
                width: "100%",
                marginTop: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            />
          )}
        </CModalBody>

        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setShowEditModal(false);
              setEditData({ _id: "", title: "", image: "" });
            }}
          >
            Cancel
          </CButton>

          <CButton color="primary" onClick={handleUpdateAd}>
            Update
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  );
};

export default AdsManagement;
