import React from 'react';
import { Button, Form, Input, Typography } from 'antd';
import axiosInstance from '../../api/axiosInstance';
import { useCookies } from 'react-cookie';

const { Title } = Typography;


type FieldType = {
    email?: string;
    password?: string;
};

const Login: React.FC = () => {
    const [cookies, setCookie] = useCookies(['myCookie']);

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

            })
            .catch(error => {
                console.error('Error:', error);
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
        </div>
    );
}

export default Login;