import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Form, Input, Typography, notification } from 'antd';
import axiosInstance from '../../api/axiosInstance';
import { useCookies } from 'react-cookie';
import axios from 'axios';

const { Title } = Typography;

type FieldTypeReg = {
    username?: string;
    password?: string;
    remember?: string;
    email?: string;
};
type FieldType = {
    email?: string;
    password?: string;
};

const Login: React.FC = () => {
    const [cookies, setCookie] = useCookies(['myCookie']);
    const [page, setpage] = useState(true)
    const onFinishReg = async (values: any) => {
        try {

            const response = await axios.post('https://task.ardapektezol.com/api/register', {
                username: values.username,
                email: values.email,
                password: values.password,
            });
            notification.success({
                message: 'Notification',
                description: 'You have registered successfully.',
            });
            setpage(true)
            console.log('Success:', response.data);
        } catch (error) {
            console.error('Failed:', error);
            notification.success({
                message: 'Notification',
                description: 'You have not registered successfully.',
            });
        }
    };

    const onFinishFailedReg = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const onFinish = (values: any) => {
        console.log('Success:', values);

        axiosInstance
            .post('/login', {
                email: values.email,
                password: values.password
            })
            .then(response => {
                console.log(response.data.data);
                handleSetCookie(response.data.data)
                notification.success({
                    message: 'Notification',
                    description: 'You have successfully logged in.',
                });
            })
            .catch(error => {
                console.error('Error:', error);
                notification.info({
                    message: 'Notification',
                    description: 'You have not successfully logged in.',
                });
            });
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };
    // Set a cookie
    const handleSetCookie = (token: string) => {
        setCookie('myCookie', token);
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            {page ? <>
                <div style={{ marginBottom: '20px' }}>
                    <Title level={2}>Login Form</Title>
                </div>
                <Form
                    name="basic"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ maxWidth: 600 }}
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="on"
                >
                    <Form.Item<FieldType>
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password />
                    </Form.Item>


                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </> : <>
                <div style={{ marginBottom: '20px' }}>
                    <Title level={2}>Register Form</Title>
                </div>
                <Form
                    name="basic"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ maxWidth: 600 }}
                    initialValues={{ remember: true }}
                    onFinish={onFinishReg}
                    onFinishFailed={onFinishFailedReg}
                    autoComplete="off"
                >

                    <Form.Item<FieldTypeReg>
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input />
                    </Form.Item>


                    <Form.Item<FieldType>
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email address!' },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item<FieldTypeReg>
                        name="remember"
                        valuePropName="checked"
                        wrapperCol={{ offset: 8, span: 16 }}
                    >
                        <Checkbox>Remember me</Checkbox>
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </>}



            {page ? <Button type="text" block onClick={() => setpage(false)}>Register</Button> : <Button type="text" block onClick={() => setpage(true)}>Login</Button>}

        </div>
    );
}

export default Login;