import React, { useState } from "react";
import {
  AuditOutlined,
  CarOutlined,
  UserOutlined,
  LoginOutlined,
  SettingOutlined,
  LockOutlined,
  LogoutOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, theme, Button, Dropdown, message } from "antd";
import { useNavigate } from "react-router-dom";
import VehiclePage from "./subpages/VehiclesPage.tsx";
import MyRentalPage from "./subpages/MyRentalPage.tsx";
import UpdateProfileModal from "./modals/UpdateProfileModal.tsx"; // 引入 UpdateProfileModal
import { AppProps } from "./types.ts";
import CustomerPage from "./subpages/CustomerPage.tsx";
import ModifyPasswordModal from "./modals/ModifyPasswordModal.tsx";
import DeleteAccountModal from "./modals/DeleteAccountModal.tsx";

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

const customerSidebarItems: MenuItem[] = [
  getItem("车辆清单", "1", <CarOutlined />),
  getItem("我的租赁", "2", <AuditOutlined />),
];

// 管理员专属菜单项配置
const adminSidebarItems: MenuItem[] = [
  getItem("车辆管理", "1", <CarOutlined />),
  getItem("客户管理", "2", <UserOutlined />),
  getItem("租赁管理", "sub1", <AuditOutlined />, [
    getItem("进行中", "3"),
    getItem("已逾期", "4"),
    getItem("已完成", "5"),
  ]),
];

// 根据用户角色生成菜单项
const getMenuItems = (role: string): MenuItem[] => {
  switch (role) {
    case "admin":
      return [...adminSidebarItems];
    case "customer":
      return [...customerSidebarItems];
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
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false); // 控制 UpdateProfileModal 显示/隐藏
  const [isModifyPasswordModalVisible, setIsModifyPasswordModalVisible] =
    useState(false); // 控制 ModifyPasswordModal 显示/隐藏
  const [isDeleteAccountModalVisible, setIsDeleteAccountModalVisible] =
    useState(false); // 控制 DeleteAccountModal 显示/隐藏s
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();

  const handleMenuClick = (e: any) => {
    setSelectedKey(e.key);
  };

  // 根据用户角色生成下拉菜单项
  const getUserDropdownItems = (role: string): MenuProps["items"] => {
    const commonItems = [
      {
        key: "change-password",
        label: "修改密码",
        icon: <LockOutlined />,
        onClick: () => setIsModifyPasswordModalVisible(true),
      },
      {
        key: "logout",
        label: "登出",
        icon: <LogoutOutlined />,
        onClick: () => {
          onLogout();
          message.success("登出成功");
          navigate("/login");
        },
      },
    ];

    if (role === "customer") {
      return [
        {
          key: "edit-profile",
          label: "账号信息",
          icon: <SettingOutlined />,
          onClick: () => setIsProfileModalVisible(true),
        },
        commonItems[0],
        {
          key: "delete-account",
          label: "注销账号",
          icon: <DeleteOutlined />,
          onClick: () => setIsDeleteAccountModalVisible(true),
        },
        commonItems[1],
      ];
    } else if (role === "admin") {
      return commonItems;
    }

    return [];
  };

  const renderContent = () => {
    switch (selectedKey) {
      case "1":
        return <VehiclePage user={user} />;
      case "2":
        return user.role === "admin" ? (
          <CustomerPage user={user} />
        ) : (
          <MyRentalPage user={user} />
        );
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
            <Dropdown
              menu={{ items: getUserDropdownItems(user.role) }}
              placement="bottomRight"
            >
              <Button type="primary" icon={<UserOutlined />}>
                {user.username}
              </Button>
            </Dropdown>
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

      {/* UpdateProfileModal */}
      <UpdateProfileModal
        user={user}
        customer_id={user.customer_id}
        visible={isProfileModalVisible}
        onCancel={() => setIsProfileModalVisible(false)}
        onUpdateProfileSuccess={() => {
          onLogout();
          navigate("/login");
          message.info("用户名已更新，请重新登录");
        }}
      />

      {/* ModifyPasswordModal */}
      <ModifyPasswordModal
        user={user}
        visible={isModifyPasswordModalVisible}
        onCancel={() => setIsModifyPasswordModalVisible(false)}
        onModifySuccess={() => {
          onLogout();
          navigate("/login");
          message.info("修改成功，请重新登录");
        }}
      />

      {/* DeleteAccountModal */}
      <DeleteAccountModal
        user={user}
        visible={isDeleteAccountModalVisible}
        onCancel={() => setIsDeleteAccountModalVisible(false)}
        onDeleteAccountSuccess={() => {
          setIsDeleteAccountModalVisible(false);
          onLogout();
          navigate("/login");
          message.info("账号已注销");
        }}
      />
    </Layout>
  );
};

export default App;
