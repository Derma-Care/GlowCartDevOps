import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  CButton,
  CCard,
  CCardBody,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilUser, cilLockLocked, cilLockUnlocked } from "@coreui/icons";
import Logo from "../login/GlowKaart.png";
import BG from "../login/bg.jpg";
import { BASE_URL_API } from "../../../baseUrl";
import "./Login.css";

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/clinic-management";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userName || !password) {
      setErrorMessage("Mobile number and password are required.");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL_API}/login`, {
        mobileNumber: userName,
        password,
      });

      if (response.data.success) {
        const userData = response.data.data;

        localStorage.setItem("authentication", "true");
        localStorage.setItem("userName", userData.userName);
        localStorage.setItem("mobileNumber", userData.mobileNumber);
        localStorage.setItem("userId", userData.id);

        navigate(from, { replace: true });
      } else {
        setErrorMessage(response.data.message || "Invalid login credentials.");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <div
      className="login-wrapper"
      style={{ backgroundImage: `url(${BG})` }}
    >
      {/* Logo */}
      <img src={Logo} alt="logo" className="logo-top-left" />

      {/* Right Login Panel */}
      <div className="right-panel">
        <CCard className="login-card">
          <CCardBody>
            <h2 className="login-heading">Welcome NGK</h2>
            <p className="login-subtext">Login to your account</p>

            {errorMessage && <p className="error-text">{errorMessage}</p>}

            <CForm onSubmit={handleSubmit}>
              <CInputGroup className="mb-3">
                <CInputGroupText>
                  <CIcon icon={cilUser} />
                </CInputGroupText>
                <CFormInput
                  placeholder="Mobile Number"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </CInputGroup>

              <CInputGroup className="mb-3">
                <CInputGroupText
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: "pointer" }}
                >
                  <CIcon
                    icon={showPassword ? cilLockUnlocked : cilLockLocked}
                  />
                </CInputGroupText>
                <CFormInput
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </CInputGroup>

              {/* Forgot & Reset Links */}
              <div className="links-row">
                <span
                  className="link-text"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </span>

                <span
                  className="link-text"
                  onClick={() => navigate("/reset-password")}
                >
                  Reset Password
                </span>
              </div>

              <CButton
                className="login-btn w-100"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Login"}
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </div>
    </div>
  );
};

export default Login;
