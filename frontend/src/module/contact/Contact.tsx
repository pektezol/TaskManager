import React from 'react';
import { Button, Form, Input, Typography } from 'antd';

const { Title } = Typography;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

/* eslint-disable no-template-curly-in-string */
const validateMessages = {
  required: '${label} is required!',
  types: {
    email: '${label} is not a valid email!',
  },
};
/* eslint-enable no-template-curly-in-string */

const onFinish = (values: any) => {
  console.log(values);
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
      <Form.Item name={['user', 'email']} label="Email" rules={[{ required: true }]}>
        <Input style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name={['user', 'website']} label="Address">
        <Input style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name={['user', 'questions']} label="Questions">
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
