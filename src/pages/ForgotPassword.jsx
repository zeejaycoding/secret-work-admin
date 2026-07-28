
import bgImage from "../assets/forgotpassword.png";
import { useNavigate } from "react-router-dom";


function ForgotPassword() {
    const navigate = useNavigate();
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

          <label>New Password</label>
          <input
            type="password"
            placeholder="Enter your password"
          />

          <label>Confirm password</label>
          <input
            type="password"
            placeholder="Enter your password"
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
    onClick={() => navigate("/dashboard")}
  >
    Sign in
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
  background-position: center;
}

.overlay {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  background:
    linear-gradient(
      180deg,
      #1E2B43 0%,
      #0A111F99 100%
    );
}

.login-box {
  width: 430px;
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
`;


export default ForgotPassword;