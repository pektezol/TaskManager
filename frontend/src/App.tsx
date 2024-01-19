import React, { useEffect, useState } from 'react';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import Backlog from './module/backlog/Backlog';
import Projects from './module/projects/Projects';
import Task from './module/task/Task';
import Login from './module/login/Login';
import Register from './module/register/Register';
import { useCookies } from 'react-cookie';

const items: MenuProps['items'] = [
  {
    label: 'Project',
    key: 'project',
    icon: <MailOutlined />,
  },
  {
    label: 'Backlog',
    key: 'backlog',
    icon: <AppstoreOutlined />,
  },
  {
    label: 'Task',
    key: 'task',
    icon: <AppstoreOutlined />,
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
    label: 'Navigation Three - Submenu',
    key: 'SubMenu',
    icon: <SettingOutlined />,
    children: [
      {
        type: 'group',
        label: 'Item 1',
        children: [
          {
            label: 'Option 1',
            key: 'setting:1',
          },
          {
            label: 'Option 2',
            key: 'setting:2',
          },
        ],
      },
      {
        type: 'group',
        label: 'Item 2',
        children: [
          {
            label: 'Option 3',
            key: 'setting:3',
          },
          {
            label: 'Option 4',
            key: 'setting:4',
          },
        ],
      },
    ],
  },
  {
    label: (
      <a href="https://ant.design" target="_blank" rel="noopener noreferrer">
        Navigation Four - Link
      </a>
    ),
    key: 'alipay',
  },
];

const App: React.FC = () => {
  const [current, setCurrent] = useState('mail');
  const [cookies, setCookie] = useCookies(['myCookie']);

  // Set a cookie
  const handleSetCookie = (token: string) => {
    setCookie('myCookie', token);
  };

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
    setCurrent(e.key);
  };


  return (
    <>
      {(cookies.myCookie === "" || cookies.myCookie === undefined) ? <Login /> :
        <>
          <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
          {/* {current === "backlog" && <Backlog />} */}
          {current === "project" && <Projects />}
          {current === "task" && <Task />}
          {current === "login" && <Login />}
          {current === "register" && <Register />}
        </>
      }

    </>
  )
};

export default App;