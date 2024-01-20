import React from 'react';
import { Button, Form, Input, Typography } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const validateMessages = {
  required: '${label} is required!',
  types: {
    email: '${label} is not a valid email!',
  },
};

const onFinish = async (values: any) => {
  try {

    await axios.post('https://task.ardapektezol.com/api/contact', values.user);

    console.log('Successfully', values);
  } catch (error) {
    console.error('Error', error);
  }
};

const Contact: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
    <Title level={2} style={{ marginBottom: '20px' }}>Contact</Title>
    <Form
      {...layout}
      name="nest-messages"
      onFinish={onFinish}
      style={{ width: '80%', maxWidth: 600 }}
      validateMessages={validateMessages}
    >
      <Form.Item name={['user', 'name']} label="Name" rules={[{ required: true }]}>
        <Input style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name={['user', 'surname']} label="Surname" rules={[{ required: true }]}>
        <Input style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name={['user', 'email']} label="Email" rules={[{ type: 'email', required: true }]}>
        <Input style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name={['user', 'address']} label="Address" rules={[{ required: true }]}>
        <Input style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name={['user', 'question']} label="Question" rules={[{ required: true }]}>
        <Input.TextArea style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  </div>
);

export default Contact;
