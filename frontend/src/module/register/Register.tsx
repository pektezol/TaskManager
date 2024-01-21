import React from 'react';
import { Button, Checkbox, Form, Input, Typography } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const onFinish = async (values: any) => {
    try {

        const response = await axios.post('https://task.ardapektezol.com/api/register', {
            username: values.username,
            email: values.email,
            password: values.password,
        });

        console.log('Success:', response.data);
    } catch (error) {
        console.error('Failed:', error);
    }
};

const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
};

type FieldType = {
    username?: string;
    password?: string;
    remember?: string;
    email?: string;
};

const Register: React.FC = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ marginBottom: '20px' }}>
            <Title level={2}>Register Form</Title>
        </div>
        <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >

            <Form.Item<FieldType>
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

            <Form.Item<FieldType>
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
    </div>
);

export default Register;
