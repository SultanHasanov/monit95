import React from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const { Content } = Layout;

const AppLayout = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar занимает фиксированную ширину */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <Layout style={{ flex: 1, marginLeft: collapsed ? '80px' : '250px' }}> {/* Убедитесь, что это не перекрывает Sidebar */}
        <Content
          style={{
            // margin: '24px',
            backgroundColor: '#fff',
            padding: 28,
            width: '100%', // Content займет оставшуюся ширину
            
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
