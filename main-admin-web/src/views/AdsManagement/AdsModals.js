import React from "react";
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CFormInput, CButton, CFormLabel } from "@coreui/react";

export const AddEditModal = ({ show, onClose, data, setData, errors, setErrors, onSave, isEdit }) => {

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setData(prev => ({
        ...prev,
        data: reader.result.split(",")[1],
        type: file.type.startsWith("image") ? "image" : "video",
        filename: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <CModal visible={show} onClose={onClose}>
      <CModalHeader>
        <CModalTitle>{isEdit ? "Edit Ad" : "Add Ad"}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CFormLabel>Title</CFormLabel>
        <CFormInput value={data.title} onChange={e => setData({ ...data, title: e.target.value })} />
        {errors.title && <small className="text-danger">{errors.title}</small>}

        <CFormLabel className="mt-3">{isEdit ? "Change File" : "File"}</CFormLabel>
        <CFormInput type="file" accept="image/*,video/*" onChange={handleFileChange} />
        {errors.data && <small className="text-danger">{errors.data}</small>}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Cancel</CButton>
        <CButton color="primary" onClick={onSave}>{isEdit ? "Update" : "Add"}</CButton>
      </CModalFooter>
    </CModal>
  );
};

export const ViewModal = ({ show, onClose, ad }) => {
  if (!ad) return null;
  return (
    <CModal visible={show} onClose={onClose}>
      <CModalHeader>
        <CModalTitle>{ad.title}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {ad.type === "image"
          ? <img src={ad.data ? (ad.data.includes("base64") ? `data:image/*;base64,${ad.data}` : ad.data) : ""} alt={ad.title} style={{ width: "100%" }} />
          : <video src={ad.data ? (ad.data.includes("base64") ? `data:video/mp4;base64,${ad.data}` : ad.data) : ""} controls style={{ width: "100%" }} />}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Close</CButton>
      </CModalFooter>
    </CModal>
  );
};
