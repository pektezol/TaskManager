import React, { useEffect, useState } from 'react';
import { AppstoreOutlined, MailOutlined, LogoutOutlined, BellOutlined } from '@ant-design/icons';
import type { MenuProps, RadioChangeEvent } from 'antd';
import { Alert, Button, Col, Divider, Menu, Popconfirm, Row, Tabs, message, notification } from 'antd';
import Projects from './module/projects/Projects';
import Task from './module/task/Task';
import Login from './module/login/Login';
import Register from './module/register/Register';
import Contact from './module/contact/Contact';

import { useCookies } from 'react-cookie';
import { MenuClickEventHandler } from 'rc-menu/lib/interface';
import axiosInstance from './api/axiosInstance';
import Weather from './module/weather/Weather';

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
const containerStyle: React.CSSProperties = {
  width: '100%',
  height: 'auto',
  overflow: 'auto',
};

const style: React.CSSProperties = {
  width: '100%',
  height: 1000,
};
const App: React.FC = () => {
  const [current, setCurrent] = useState('project');
  const [cookies, setCookie] = useCookies(['myCookie']);
  const [usermail, setUserMail] = useState("");
  const [loading, setLoading] = useState(true);
  const [notificationData, setNotification] = useState<NotificationType[]>([]);
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);

  const items: MenuProps['items'] = [
    {
      label: 'Project',
      key: 'project',
      icon: <MailOutlined />,
    },
    {
      label: 'Weather',
      key: 'weather',
      icon: <MailOutlined />,
    },
    {
      label: 'Contact',
      key: 'contact',
      icon: <MailOutlined />,
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
        notification.success({
          message: 'Notification',
          description: 'You have successfully deleted.',
        });
      })
      .catch(error => {
        console.error('Error:', error);
        notification.info({
          message: 'Notification',
          description: "You have not been able to delete it successfully.",
        });
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
        setNotification(response.data.data.notifications)


      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  const start = (async () => {

  })

  useEffect(() => {

    const token = cookies.myCookie;
    const decodedToken = parseJwtToken(token);
    console.log(decodedToken);
    if (decodedToken) {
      setUserMail(decodedToken.sub)
    } else {
      console.log('Invalid or expired token');
    }
    getNotifications()
    setLoading(false)
  }, [cookies])
  return (
    <div >

      {(cookies.myCookie === "" || cookies.myCookie === undefined) ? <Login /> :
        <>
          {loading === false ?
            <>
              <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
              <Row>
                <Col span={20}>
                  {current === "project" && <Projects />}
                  {current === "weather" && <Weather />}
                  {current === "contact" && <Contact />}
                </Col>
                <Col span={4} className="notification-col">
                  <div style={containerStyle} ref={setContainer}>
                    <div style={style}>
                      <div>
                        {notificationData?.map((notification) => (
                          <div key={notification.id} style={{ marginTop: 10 }}>

                            {notification.read ?
                              <> <Alert
                                type={notification.read ? 'info' : "warning"}
                                description={notification.notification}
                              />
                                <Button onClick={() => { deleteNotification(notification.id) }} size='small' danger style={{ marginLeft: '10px' }}>
                                  Delete
                                </Button> </> : <Popconfirm
                                  title="Mark as read."
                                  onConfirm={() => confirm(notification.id)}
                                  okText="Yes"
                                  cancelText="No"
                                >
                                <Alert
                                  type={notification.read ? 'info' : "warning"}
                                  description={notification.notification}
                                />
                              </Popconfirm>}

                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </Col>
              </Row>
            </>
            :
            <>Loading...</>
          }
        </>
      }
    </div>

  )
};

export default App;
