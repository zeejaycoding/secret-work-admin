
import { useState } from "react";
import bgImage from "../assets/login.jpg";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../services/api";


function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        const res = await adminLogin(email, password);
        localStorage.setItem("admin-token", res.data.token);
        navigate("/dashboard");
      } catch (err) {
        setError(err.response?.data?.error || "Invalid credentials");
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
          <h1>Welcome Back</h1>

          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p style={{ color: "#E50914", fontSize: 14, marginTop: 12, textAlign: "center" }}>{error}</p>}

         <div className="button-group">
  <button
    className="signin-btn"
    onClick={handleLogin}
    disabled={loading}
  >
    {loading ? "Signing in..." : "Sign in"}
  </button>
</div>
<div
  className="forgot-password"
  onClick={() => navigate("/forgot-password")}
>
  Forgot Password
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
  margin-top: 20px;
  text-align: center;
  color: #FFFFFF;
  font-family: "Nunito", sans-serif;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.forgot-password:hover {
  opacity: 0.8;
}`;


export default Login;