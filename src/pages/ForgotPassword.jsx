
import { useState } from "react";
import bgImage from "../assets/forgotpassword.png";
import { useNavigate } from "react-router-dom";
import { adminForgotPasswordReset } from "../services/api";


function ForgotPassword() {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async (e) => {
      e.preventDefault();
      setError("");
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (newPassword.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      setLoading(true);
      try {
        await adminForgotPasswordReset(newPassword);
        navigate("/login");
      } catch (err) {
        setError(err.response?.data?.error || "Reset failed");
      } finally {
        setLoading(false);
      }
    };

  return (
    <>
      <style>{styles}</style>
<div
  className="login-page"
  style={{ backgroundImage: `url(${bgImage})` }}
>
      <div className="overlay">
        <div className="login-box">
          <h1>Reset Password</h1>

          {error && <p style={{ color: "#E50914", fontSize: 14, marginBottom: 12, textAlign: "center" }}>{error}</p>}

          <label>New Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <label>Confirm password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

         <div className="button-group">
  <button
    className="back-btn"
    onClick={() => navigate("/login")}
  >
    Back
  </button>

  <button
    className="signin-btn"
    onClick={handleReset}
    disabled={loading}
  >
    {loading ? "Resetting..." : "Sign in"}
  </button>
</div>
        </div>
      </div>
    </div>
    </>
  );
}

const styles = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-page {
  width: 100%;
  height: 100vh;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center top;
  background-color: #000;
}

.overlay {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  width: 430px;
  max-width: 90vw;
  background: #000000;
  border-radius: 16px;
  padding: 45px 35px;
  display: flex;
  flex-direction: column;
}

.login-box h1 {
  text-align: center;
  color: white;
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 35px;
  font-family: Manrope, sans-serif;
}

.login-box label {
  color: #AEB3B7;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  margin-top: 18px;
  font-family: Nunito, sans-serif;
}

.login-box input {
  height: 52px;
  border-radius: 10px;
  border: 1px solid #2A2A2A;
  background: #161616;
  padding: 0 16px;
  color: white;
  outline: none;
  font-size: 15px;
  font-family: Nunito, sans-serif;
  font-weight: 600;
  width: 100%;
}

.login-box input::placeholder {
  color: #777;
}

.button-group {
  margin-top: 32px;
  display: flex;
  gap: 12px;
}

.button-group button {
  flex: 1;
  height: 52px;
  border: none;
  border-radius: 10px;
  font-size: 17px;
  font-weight: 800;
  font-family: Nunito, sans-serif;
  cursor: pointer;
}

.back-btn {
  background: #1F1F1F;
  color: #FFFFFF;
}

.signin-btn {
  background: #E50914;
  color: #FFFFFF;
}
  
.forgot-password {
  margin-top: 18px;
  text-align: center;
  color: white;
  font-size: 16px;
  font-weight: 700;
  font-family: Nunito, sans-serif;
  cursor: pointer;
}

@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }

  .login-box h1 {
    font-size: 22px;
    margin-bottom: 25px;
  }

  .login-box label {
    font-size: 14px;
  }

  .login-box input {
    height: 46px;
    font-size: 14px;
  }

  .button-group button {
    height: 46px;
    font-size: 15px;
  }
}
`;


export default ForgotPassword;