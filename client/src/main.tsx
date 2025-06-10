import React, { useState } from "react";
import { createRoot } from "react-dom/client"; // 使用 createRoot
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import App from "./App";
import LoginPage from "./LoginPage";

const Root: React.FC = () => {
  const [user, setUser] = useState<{
    user_id: number;
    username: string;
    role: string;
    customer_id: number;
  } | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  }); // 用户状态

  // 登录成功时，保存到 localStorage
  const handleLogin = (user: {
    user_id: number;
    username: string;
    role: string;
    customer_id: number;
  }) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  // 登出时，清除 localStorage
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <App user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            <LoginPage
              onLoginSuccess={handleLogin} // 登录成功后更新用户状态
            />
          }
        />
      </Routes>
    </Router>
  );
};

// 使用 createRoot 渲染应用
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<Root />);
}
