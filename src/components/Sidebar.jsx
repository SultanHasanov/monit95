import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
import { Link } from "react-router-dom";
import {
  HomeOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProductOutlined,
} from "@ant-design/icons";
import { CiLogout } from "react-icons/ci";
import SubMenu from "antd/es/menu/SubMenu";
import "../App.css";
const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed }) => {
  // const [collapsed, setCollapsed] = useState(false);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={collapsed ? "80px" : "250px"}
      style={{
        minHeight: "100vh",
        position: "fixed", // Закрепление сайдбара
        left: 0,
        top: 0,
        bottom: 0,

      }}
    >
      <div style={{ color: "white", padding: 16, textAlign: "center" }}>
        {collapsed ? "M" : "Monit95"}
      </div>
      <Button
        type="text"
        onClick={() => setCollapsed(!collapsed)}
        style={{ marginBottom: 20, color: "white" }}
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      />
      <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
        <Menu.Item key="0" icon={<HomeOutlined />} className="menu-item">
          <Link to="/">Главная</Link>
        </Menu.Item>
        <SubMenu key="sub1" icon={<ProductOutlined />} title="Проекты">
          <Menu.Item key="1-1" className="menu-item">
            <Link to="/subitem1">Исследование обучающихся 1 классов</Link>
          </Menu.Item>
          <Menu.Item key="1-2" className="menu-item">
            <Link to="/subitem2">
              Диагностика неуспевающих обучающихся 4-8 классов
            </Link>
          </Menu.Item>
          <Menu.Item key="1-3" className="menu-item">
            <Link to="/subitem3">«Я сдам ЕГЭ!» 11 класс 2024/2025</Link>
          </Menu.Item>
          <Menu.Item key="1-4" className="menu-item">
            <Link to="/subitem4">«Я сдам ОГЭ!» 9 класс 2024/2025</Link>
          </Menu.Item>
          <Menu.Item key="1-5" className="menu-item">
            <Link to="/subitem5">1-3 классы5</Link>
          </Menu.Item>
        </SubMenu>
        <Menu.Item key="2" icon={<InfoCircleOutlined />} className="menu-item">
          <Link to="/about">О нас</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<PhoneOutlined />} className="menu-item">
          <Link to="/contact">Контакты</Link>
        </Menu.Item>
        {/* Иконка "выйти" внизу панели */}
        <Menu.Item
          key="4"
          icon={<CiLogout size="22" />}
          style={{ position: "absolute", bottom: 0, width: "100%" }}
          className="menu-item"
        >
          <Link to="/">Выйти</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
