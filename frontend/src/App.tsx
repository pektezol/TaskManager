import React, { useEffect, useState } from 'react';
import { AppstoreOutlined, MailOutlined, LogoutOutlined, BellOutlined } from '@ant-design/icons';
import type { MenuProps, RadioChangeEvent } from 'antd';
import { Alert, Button, Col, Divider, Menu, Popconfirm, Row, Tabs, message, notification } from 'antd';
import Projects from './module/projects/Projects';
import Task from './module/task/Task';
import Login from './module/login/Login';
import Register from './module/register/Register';
import { useCookies } from 'react-cookie';
import { MenuClickEventHandler } from 'rc-menu/lib/interface';
import axiosInstance from './api/axiosInstance';

interface DecodedToken {
  sub: string; // Example field, update with your actual token structure
  exp: number;
  // Add other fields according to your JWT payload structure
}
type NotificationType = {
  id: number;
  notification: string;
  read: boolean;
};

const App: React.FC = () => {
  const [current, setCurrent] = useState('project');
  const [cookies, setCookie] = useCookies(['myCookie']);
  const [usermail, setUserMail] = useState("");
  const [notificationData, setNotification] = useState<NotificationType[]>([]);

  const items: MenuProps['items'] = [
    {
      label: 'Project',
      key: 'project',
      icon: <MailOutlined />,
    },
    {
      label: 'Login',
      key: 'login',
      icon: <AppstoreOutlined />,
    },
    {
      label: 'Register',
      key: 'register',
      icon: <AppstoreOutlined />,
    },
    {
      label: `Log Out (${usermail})`,
      key: 'logout',
      icon: <LogoutOutlined />,
    },
  ];

  // Set a cookie
  const handleSetCookie = (token: string) => {
    setCookie('myCookie', token);
  };
  const confirm = (id: number) => {
    axiosInstance
      .put(`/notifications/${id}`, {})
      .then(() => {
        getNotifications()
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };
  const deleteNotification = (id: number) => {
    axiosInstance
      .delete(`/notifications/${id}`, {})
      .then(() => {
        getNotifications()
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const onClick: MenuClickEventHandler = (info) => {
    console.log('click ', info);
    setCurrent(info.key);

    // Handle Log Out
    if (info.key === 'logout') {
      setCookie('myCookie', '');
      notification.success({
        message: 'Logged Out',
        description: 'You have successfully logged out.',
      });
    }
    // Handle Notification
    if (info.key === 'notification') {
      notification.info({
        message: 'New Notification',
        description: 'This is a sample notification message.',
      });
    }
  };
  const parseJwtToken = (token: string): DecodedToken | null => {
    try {
      // Split the token into header, payload, and signature
      const [, payloadBase64] = token.split('.');
      const decodedPayload = JSON.parse(atob(payloadBase64)) as DecodedToken;
      return decodedPayload;
    } catch (error) {
      // Handle invalid or expired tokens
      console.error('Error parsing JWT token:');
      return null;
    }
  };
  const getNotifications = () => {
    axiosInstance
      .get('/notifications', {})
      .then(response => {

        console.log(response);
        setNotification(response.data.data.notifications)
        console.log(notificationData);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  useEffect(() => {
    const token = cookies.myCookie;
    const decodedToken = parseJwtToken(token);

    if (decodedToken) {
      setUserMail(decodedToken.sub)
    } else {
      console.log('Invalid or expired token');
    }
    getNotifications()
  }, [])
  return (
    <>
      {(cookies.myCookie === "" || cookies.myCookie === undefined) ? <Login /> :
        <>
          <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />

          <Row>
            <Col span={20}>
              {current === "project" && <Projects />}
              {current === "task" && <Task />}
              {current === "login" && <Login />}
              {current === "register" && <Register />}
            </Col>
            <Col span={4}>
              <div>

                {notificationData?.map((notification) => (
                  <div key={notification.id} style={{ marginTop: 10 }}>
                    <Popconfirm
                      title="Mark as readed."
                      onConfirm={() => confirm(notification.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Alert
                        type={notification.read ? 'info' : "warning"}
                        description={notification.notification}
                      />
                      <Button onClick={() => { deleteNotification(notification.id) }} size='small' danger style={{ marginLeft: '10px' }}>
                        Delete
                      </Button>
                    </Popconfirm>
                  </div>
                ))}
              </div>
            </Col>
          </Row>

        </>
      }
    </>
  )
};

export default App;
