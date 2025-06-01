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
    customer_id: number | null;
  } | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  }); // 用户状态

  // 登出处理函数
  const handleLogout = () => {
    localStorage.removeItem('user'); // 清除localStorage中的用户信息
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <App user={user} onLogout={() => setUser(null)} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            <LoginPage
              onLoginSuccess={(user) => setUser(user)} // 登录成功后更新用户状态
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
