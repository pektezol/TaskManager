import React, { useEffect, useState } from 'react';
import { Button, Card, Cascader, Col, Form, Input, Modal, Row, Tag, Tooltip, notification } from 'antd';
import axiosInstance from '../../api/axiosInstance';

import { useCookies } from 'react-cookie';
import { SingleValueType } from 'rc-cascader/lib/Cascader';
import Backlog from '../backlog/Backlog';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { incrementByAmount } from '../../state/counterSlice';

type Collaborator = {
    id: number;
    username: string;
    email: string;
};
interface UserData {
    value: string;
    label: string;
    // Add other fields as needed
}
type Owner = {
    id: number;
    username: string;
    email: string;
};

type Project = {
    id: number;
    username: string;
    owner: Owner;
    collaborators: Collaborator[];
    created_at: string;
};

type FieldType = {
    name?: string;
};

interface DecodedToken {
    sub: string; // Example field, update with your actual token structure
    exp: number;
    // Add other fields according to your JWT payload structure
}


const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenC, setIsModalOpenC] = useState(false);
    const [allUsers, setAllUsers] = useState<UserData[]>([]);
    const [selectedCollaborator, setSelectedCollaborator] = useState("");
    const [selectedCollaboratorProject, setSelectedCollaboratorProject] = useState<number | undefined>(undefined);
    const [usermail, setUserMail] = useState("");
    const [cookies, setCookie] = useCookies(['myCookie']);

    const count = useSelector((state: RootState) => state.counter.value)
    const dispatch = useDispatch()

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const showCollaboratorsModal = (project_id: number) => {
        setIsModalOpenC(true);
        setSelectedCollaboratorProject(project_id)
    };
    const openTasks = (project: number) => {
        dispatch(incrementByAmount(project))
    };
    const removeCollaborators = (project_id: number, user_id: number) => {
        console.log(project_id, user_id);
        axiosInstance
            .delete(`/projects/${project_id}/collaborator/${user_id}`,)
            .then(() => {
                setProjects([]);
                setReload(true);
                notification.success({
                    message: 'Notification',
                    description: 'You have successfully removed a collaborator.',
                });
            })
            .catch(error => {
                console.error('Error:', error);
                notification.info({
                    message: 'Notification',
                    description: 'You have not successfully removed a collaborator.',
                });
            });
    };

    const collaboratorSubmit = () => {
        // Convert the selectedCollaborator to a number
        const collaboratorId = parseInt(selectedCollaborator, 10);

        if (isNaN(collaboratorId)) {
            // Handle the case where the conversion fails
            console.error('Invalid collaborator ID:', selectedCollaborator);
            return;
        }

        axiosInstance
            .post(`/projects/${selectedCollaboratorProject}/collaborator`, { user_id: collaboratorId })
            .then(() => {
                setProjects([]);
                setReload(true);
                notification.success({
                    message: 'Notification',
                    description: 'You have successfully added a collaborator.',
                });
            })
            .catch(error => {
                console.error('Error:', error);
                notification.success({
                    message: 'Notification',
                    description: 'You have not successfully added a collaborator.',
                });
            });
        setSelectedCollaborator("")
        setSelectedCollaboratorProject(0)
    };

    const handleCancelC = () => {
        setIsModalOpenC(false);
    };

    const onFinish = (values: any) => {
        createProject(values.name)
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };
    const onChangeCollaborator = (value: SingleValueType) => {
        console.log(value.toString());
        setSelectedCollaborator(value.toString())
    };
    const createProject = (value: string) => {
        axiosInstance
            .post('/projects', { name: value })
            .then(response => {
                setProjects([]);
                setReload(true)
                notification.success({
                    message: 'Notification',
                    description: 'You have successfully created a project.',
                });
            })
            .catch(error => {
                console.error('Error:', error);
                notification.info({
                    message: 'Notification',
                    description: 'You have not successfully created a project.',
                });
            });
    }
    const deleteProject = (value: number) => {
        axiosInstance
            .delete(`/projects/${value}`,)
            .then(() => {
                setProjects([]);
                setReload(true)
                notification.success({
                    message: 'Notification',
                    description: 'You have successfully deleted a project.',
                });
            })
            .catch(error => {
                console.error('Error:', error);
                notification.info({
                    message: 'Notification',
                    description: 'You have not successfully deleted a project.',
                });
            });
    }
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

    const getAllUsers = () => {
        axiosInstance
            .get('/users', {})
            .then(response => {

                const data: UserData[] = []
                for (let index = 0; index < response.data.data.users.length; index++) {
                    const element: UserData = {
                        value: `${response.data.data.users[index].id}`,
                        label: `${response.data.data.users[index].username}`
                    }
                    data.push(element)
                }
                setAllUsers(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    useEffect(() => {
        getAllUsers()
        const token = cookies.myCookie;
        const decodedToken = parseJwtToken(token);

        if (decodedToken) {
            setUserMail(decodedToken.sub)
        } else {
            console.log('Invalid or expired token');
        }

        axiosInstance
            .get('/projects', {})
            .then(response => {
                setProjects(response.data.data.projects);
                setLoading(false)
            })
            .catch(error => {
                setLoading(false)
                console.error('Error:', error);
            });
        setReload(false)
    }, [reload, cookies]);



    return (
        <div >
            {count !== 0 ? <Backlog /> : ""}

            {loading === true ? <>Loading...</> : (
                <Card
                    title={'Projects'}
                    style={{ marginTop: 10, backgroundColor: '#f0f5ff', border: '1px solid #d1d5da' }}
                    extra={
                        <Button type="primary" onClick={showModal} style={{ backgroundColor: '#001d66' }}>
                            Create Project
                        </Button>}
                >
                    {projects ? (
                        projects.map((item, index) => (
                            <Card
                                key={index}
                                style={{ marginTop: 16, backgroundColor: '#f6f8fa', border: '1px solid #d1d5da' }}
                                type="inner"
                                title={<Button type="text" onClick={() => { openTasks(item.id) }}>{item.username} - Created at: {item.created_at.split("T")[0]} {item.created_at.split("T")[1].split(".")[0]}</Button>}
                                extra={item.owner.email === usermail ?
                                    <>
                                        <Button type="primary" danger onClick={() => deleteProject(item.id)} style={{ backgroundColor: '#fa8c16' }}>
                                            Delete This Project
                                        </Button>


                                        <Button type="primary" onClick={() => showCollaboratorsModal(item.id)} style={{ backgroundColor: '#0958d9' }}>
                                            Add Collaborators
                                        </Button>
                                    </>
                                    : ""}
                            >
                                <Row>
                                    <Col span={4}>
                                        Owner:
                                        <Tag color="blue">{` ${item.owner.username} `}</Tag>
                                    </Col>
                                    <Col>
                                        Collaborators:
                                        {item.collaborators.map((val, i) => (
                                            <React.Fragment key={i}>
                                                {item.owner.email === usermail ? (
                                                    <Tooltip title={<Button size='small' type="link" danger onClick={() => removeCollaborators(item.id, val.id)}>
                                                        Remove Collaborator
                                                    </Button>} key={"red"}>
                                                        <Tag color="red"> {val.username} </Tag>
                                                    </Tooltip>
                                                ) : (
                                                    <Tag color="green"> {val.username} </Tag>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </Col>
                                </Row>
                            </Card>
                        ))
                    ) : (
                        <p>Loading...</p>
                    )}
                    <Modal title="Create Project" open={isModalOpen} onCancel={handleCancel} footer={null}>
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
                            <Form.Item
                                label="Project Name"
                                name="name"
                                rules={[{ required: true, message: 'Please input your username!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                <Button type="primary" htmlType="submit">
                                    Submit
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>
                    <Modal title="Add Collaborators" open={isModalOpenC} onCancel={handleCancelC} footer={null}>
                        <Cascader options={allUsers} onChange={(e) => onChangeCollaborator(e)} placeholder="Please select" style={{ marginLeft: 85 }} />
                        <Button type="primary" style={{ marginLeft: 25 }}
                            onClick={() => collaboratorSubmit()}
                        >
                            Submit
                        </Button>
                    </Modal>
                </Card>
            )}
        </div>


    );
};
export default Projects;