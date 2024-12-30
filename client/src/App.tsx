import React, { useState } from "react";
import {
  AuditOutlined,
  CarOutlined,
  UserOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, theme, Button } from "antd";
import { useNavigate } from "react-router-dom";
import VehiclePage from "./VehiclesPage.tsx";
import { AppProps } from "./types.ts";

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const userMenuItems: MenuItem[] = [getItem("车辆清单", "1", <CarOutlined />)];

// 管理员专属菜单项配置
const adminMenuItems: MenuItem[] = [
  getItem("车辆管理", "1", <CarOutlined />),
  getItem("客户管理", "2", <UserOutlined />),
  getItem("租赁管理", "sub1", <AuditOutlined />, [
    getItem("进行中", "3"),
    getItem("已结束", "4"),
  ]),
];

// 根据用户角色生成菜单项
const getMenuItems = (role: string): MenuItem[] => {
  switch (role) {
    case "admin":
      return [...adminMenuItems];
    case "user":
      return [...userMenuItems];
    default:
      return [];
  }
};

const headerStyle: React.CSSProperties = {
  textAlign: "left",
  color: "#fff",
  height: 64,
  paddingInline: 48,
  lineHeight: "64px",
  backgroundColor: "#4096ff",
  fontSize: 20,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const App: React.FC<AppProps> = ({ user, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("1"); // 默认选中车辆管理
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();

  const handleMenuClick = (e: any) => {
    setSelectedKey(e.key);
  };

  const renderContent = () => {
    switch (selectedKey) {
      case "1":
        return user ? (
          <VehiclePage user={{ id: user.id, role: user.role }} />
        ) : null;
      case "2":
        return user?.role === "admin" ? <div>客户管理页面</div> : null;
      case "3":
        return user?.role === "admin" ? <div>进行中的租赁</div> : null;
      case "4":
        return user?.role === "admin" ? <div>已结束的租赁</div> : null;
      default:
        return <div>请选择一个菜单项</div>;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Header style={headerStyle}>
          <span>Matrix 车辆租赁管理系统</span>
          {user ? (
            <Button type="primary" icon={<LoginOutlined />} onClick={onLogout}>
              登出 ({user.username})
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={() => navigate("/login")}
            >
              登录
            </Button>
          )}
        </Header>
        <Layout>
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
          >
            <div className="demo-logo-vertical" />
            <Menu
              theme="dark"
              defaultSelectedKeys={["1"]}
              mode="inline"
              items={getMenuItems(user?.role || "")}
              onClick={handleMenuClick}
            />
          </Sider>
          <Layout>
            <Header style={{ padding: 0, background: colorBgContainer }} />
            <Content style={{ margin: "0 16px" }}>
              <div
                style={{
                  padding: 24,
                  minHeight: 360,
                  background: colorBgContainer,
                  borderRadius: borderRadiusLG,
                }}
              >
                {renderContent()}
              </div>
            </Content>
            <Footer style={{ textAlign: "center" }}>
              Ant Design ©{new Date().getFullYear()} Created by Ant UED
            </Footer>
          </Layout>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;
