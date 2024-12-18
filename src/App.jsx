import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SubItem1 from "./pages/SubItem1";
import SubItem2 from "./pages/SubItem2";
import SubItem3 from "./pages/SubItem3";
import SubItem4 from "./pages/SubItem4";
import SubItem5 from "./pages/SubItem5";
import StudentManagementPage from "./pages/StudentManagementPage";

const { Content } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <Layout style={{ minHeight: "100vh" }}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <Layout style={{ marginLeft: collapsed ? "80px" : "250px" }}>
          <Content style={{ margin: "16px", padding: "16px", background: "#fff" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="subitem1" element={<SubItem1 />} />
              <Route path="subitem1/students" element={<StudentManagementPage/>} />
              <Route path="subitem2" element={<SubItem2 />} />
              <Route path="subitem3" element={<SubItem3 />} />
              <Route path="subitem4" element={<SubItem4 />} />
              <Route path="subitem5" element={<SubItem5 />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
