import React, { useEffect, useState } from 'react';
import { Avatar, Button, Card, Cascader, Col, DatePicker, DatePickerProps, Divider, Flex, Form, Input, List, Modal, Radio, Row, Skeleton, Tag, Tooltip } from 'antd';
import { RootState } from '../../state/store';
import { useSelector } from 'react-redux';
import axiosInstance from '../../api/axiosInstance';
import { SingleValueType } from 'rc-cascader/lib/Cascader';
import { PlusOutlined } from '@ant-design/icons';
const { Search } = Input;
interface Owner {
    id: number;
    username: string;
    email: string;
}
interface TaskData {
    value: string;
    label: string;
    // Add other fields as needed
}
interface Task {
    created_at: string;
    deadline: string;
    description: string;
    id: number;
    name: string;
    owner: Owner;
    priority: string;
    status: string;
}
type FieldType = {
    name: string;
    description: string;
    deadline: string;
    status_id: number;
    priority_id: number;
};
interface Comment {
    comment: string;
    commentor: {
        id: number;
        username: string;
        email: string;
    };
    created_at: string;
    id: number;
}
interface Task {

    assignees: any[];
    comments: Comment[];
    created_at: string;
    deadline: string;
    description: string;
    id: number;
    name: string;
    owner: {
        id: number;
        username: string;
        email: string;
    };
    priority: string;
    status: string;

}
interface UserData {
    value: string;
    label: string;
    // Add other fields as needed
}
interface DataType2 {
    gender: string;
    name: {
        title: string;
        first: string;
        last: string;
    };
    email: string;
    picture: {
        large: string;
        medium: string;
        thumbnail: string;
    };
    nat: string;
}
const tabListNoTitle = [
    {
        key: 'tasks',
        label: 'Tasks',
    },
    {
        key: 'priority',
        label: 'By Prority',
    },
];

const Backlog: React.FC = () => {
    const [activeTabKey2, setActiveTabKey2] = useState<string>('app');
    const [taskData, setTaskData] = useState<Task[]>([]);
    const [task, setTask] = useState<Task | undefined>();
    const [statusData, setStatusData] = useState<TaskData[]>([]);
    const [priorityData, setPriorityData] = useState<TaskData[]>([]);
    const [createTaskDate, setCreateTaskDate] = useState("");
    const count = useSelector((state: RootState) => state.counter.value)
    const [isModalOpenAss, setIsModalOpenAss] = useState(false);
    const [isModalOpenC, setIsModalOpenC] = useState(false);
    const [openTaskModal, setOpenTaskModal] = useState(false);
    const [selectedCollaboratorProject, setSelectedCollaboratorProject] = useState<number | undefined>(undefined);
    const [allUsers, setAllUsers] = useState<UserData[]>([]);
    const [selectedCollaborator, setSelectedCollaborator] = useState("");

    const showCollaboratorsModal = (project_id: number) => {
        isModalOpenAss === true ? setIsModalOpenAss(false) : setIsModalOpenAss(true)
        setSelectedCollaboratorProject(project_id)
    };
    const collaboratorSubmit = (id: number) => {
        // Convert the selectedCollaborator to a number
        const collaboratorId = parseInt(selectedCollaborator, 10);

        if (isNaN(collaboratorId)) {
            // Handle the case where the conversion fails
            console.error('Invalid collaborator ID:', selectedCollaborator);
            return;
        }

        axiosInstance
            .post(`/projects/${count}/tasks/${selectedCollaboratorProject}/assignee`, { user_id: collaboratorId })
            .then(() => {
                getTasksDetail(id)
                showCollaboratorsModal(id)
            })
            .catch(error => {
                console.error('Error:', error);
            });
        setSelectedCollaborator("")
        setSelectedCollaboratorProject(0)
    };
    const onChangeCollaborator = (value: SingleValueType) => {
        console.log(value.toString());
        setSelectedCollaborator(value.toString())
    };
    const onFinishCreateTask = (values: any) => {
        console.log('Success:', values);
        const value: FieldType = {
            name: values.name,
            description: values.description,
            deadline: createTaskDate,
            status_id: Number(values.status_id[0]),
            priority_id: Number(values.priority_id[0])
        }
        axiosInstance
            .post(`/projects/${count}/tasks`,
                value
            )
            .then((response) => {
                console.log(response.data);
                getTasks()
                handleCancelC()
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    const handleCancelC = () => {
        setIsModalOpenC(false);
    };
    const handleCancelAss = () => {
        setIsModalOpenAss(false);
    };
    const showTaskModal = () => {
        setIsModalOpenC(true);
    };
    const onTab2Change = (key: string) => {
        setActiveTabKey2(key);
    };

    const data = [
        {
            title: 'Ant Design Title 1',
        },
        {
            title: 'Ant Design Title 2',
        },
        {
            title: 'Ant Design Title 3',
        },
        {
            title: 'Ant Design Title 4',
        },
    ];
    const getTasksDetail = (id: number) => {
        axiosInstance
            .get(`/projects/${count}/tasks/${id}`,
            )
            .then((response) => {
                console.log(response.data);
                setTask(response.data.data)
                setOpenTaskModal(true)
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    const onChangeCreateDate: DatePickerProps['onChange'] = (date, dateString) => {
        setCreateTaskDate(dateString)
        console.log(createTaskDate);
    };
    const onChange = (value: SingleValueType, item: Task) => {
        if (value != undefined) {
            const foundValue = findValueByLabel(item.priority, priorityData);
            updateTask(item.id, item.name, item.description, Number(value[0]), Number(foundValue), item.deadline.split("T")[0])
        }
    };
    const updateTask = (id: number, name: string, description: string, status_id: number, priority_id: number, deadline: string) => {
        axiosInstance
            .put(`/projects/${count}/tasks/${id}`,
                {
                    name,
                    description,
                    status_id,
                    priority_id,
                    deadline
                }
            )
            .then((response) => {
                console.log(response.data.data.tasks);
                getTasks()
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    const getTasks = () => {
        axiosInstance
            .get(`/projects/${count}/tasks`,)
            .then((response) => {
                console.log(response.data.data.tasks);
                setTaskData(response.data.data.tasks)
                console.log(taskData);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    const getTaskStatus = () => {
        axiosInstance
            .get(`/status`,)
            .then((response) => {
                console.log(response.data.data.statuses);
                let statuses: TaskData[] = []
                for (let index = 0; index < response.data.data.statuses.length; index++) {
                    const element: TaskData = {
                        value: `${response.data.data.statuses[index].id}`,
                        label: `${response.data.data.statuses[index].name}`
                    }
                    statuses.push(element)
                }
                setStatusData(statuses)
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    const getTaskPriority = () => {
        axiosInstance
            .get(`/priority`,)
            .then((response) => {
                console.log(response.data.data.priorities);
                let priorities: TaskData[] = []
                for (let index = 0; index < response.data.data.priorities.length; index++) {
                    const element: TaskData = {
                        value: `${response.data.data.priorities[index].id}`,
                        label: `${response.data.data.priorities[index].name}`
                    }
                    priorities.push(element)
                }
                setPriorityData(priorities)
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    function findValueByLabel(labelToFind: string, dataArray: TaskData[]): string | undefined {
        const foundItem = dataArray.find(item => item.label === labelToFind);

        // Eğer bulunduysa value'yi döndür, bulunamadıysa undefined döndür
        return foundItem ? foundItem.value : undefined;
    }
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
        getTasks()
        getTaskPriority()
        getTaskStatus()
    }, [count])

    function toggleModal(arg0: number, arg1: boolean): void {
        throw new Error('Function not implemented.');
    }
    const deleteTask = (id: number) => {
        axiosInstance
            .delete(`/projects/${count}/tasks/${id}`,)
            .then((response) => {
                console.log(response.data);
                setOpenTaskModal(false)
                getTasks()
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };
    const commentTask = (id: number, value: string) => {
        axiosInstance
            .post(`/projects/${count}/tasks/${id}/comment`, { comment: value })
            .then((response) => {
                console.log(response.data);
                getTasksDetail(id)
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };
    const removeAssignees = (task_id: number, user_id: number) => {

        axiosInstance
            .delete(`/projects/${count}/tasks/${task_id}/assignee/${user_id}`,)
            .then(() => {
                getTasksDetail(task_id)
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <>
            <br />
            <Card
                style={{ width: '100%' }}
                tabList={tabListNoTitle}
                activeTabKey={activeTabKey2}
                tabBarExtraContent={
                    <>
                        <Row>
                            <Col>
                                <Button type="text" onClick={() => showTaskModal()}>
                                    Create Task
                                </Button>
                            </Col>
                        </Row>

                    </>
                }
                onTabChange={onTab2Change}
                tabProps={{
                    size: 'middle',
                }}
            >
                {activeTabKey2 === "tasks" &&
                    <Row>
                        <Col span={6}>
                            <Flex gap="middle" vertical style={{ margin: 10 }}>
                                <Flex vertical>
                                    <h2 style={{ marginLeft: 30 }}>Backlog</h2>
                                    {taskData.map((item, i) => (
                                        <>
                                            {item.status === "Backlog" &&
                                                <Card size="small" title={item.name} extra={<Button type="link" onClick={() => getTasksDetail(item.id)}> Details </Button>} style={{ width: 300, margin: 15 }}>
                                                    <Row>
                                                        <Col>
                                                            Owner: <Tag>{item.owner.username}</Tag>
                                                        </Col>
                                                        <Col>
                                                            Priority: <Tag>{item.priority}</Tag>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            Desc : {item.description}
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            Created Date: <Tag> {item.created_at.split("T")[0]}</Tag>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            Deadline: <Tag>{item.deadline !== null ? item.deadline.split("T")[0] : "-"}</Tag>
                                                        </Col>
                                                    </Row>
                                                    <Cascader size='small' options={statusData} onChange={(e) => onChange(e, item)} placeholder="Select Status" />
                                                </Card>}
                                        </>
                                    ))}
                                </Flex>
                            </Flex>
                        </Col>
                        <Col span={6}>
                            <Flex gap="middle" vertical style={{ margin: 10 }}>
                                <Flex vertical>
                                    <h2 style={{ marginLeft: 30 }}>In Progress</h2>
                                    {taskData.map((item, i) => (
                                        <>
                                            {item.status === "In Progress" &&
                                                <Card size="small" title={item.name} extra={<Button type="link" onClick={() => getTasksDetail(item.id)}> Details </Button>} style={{ width: 300, margin: 15 }}>
                                                    <Row>
                                                        <Col>
                                                            Owner: <Tag>{item.owner.username}</Tag>
                                                        </Col>
                                                        <Col>
                                                            Priority: <Tag>{item.priority}</Tag>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            Desc : {item.description}
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            Created Date: <Tag> {item.created_at.split("T")[0]}</Tag>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            Deadline: <Tag>{item.deadline !== null ? item.deadline.split("T")[0] : "-"}</Tag>
                                                        </Col>
                                                    </Row>
                                                    <Cascader size='small' options={statusData} onChange={(e) => onChange(e, item)} placeholder="Select Status" />
                                                </Card>}
                                        </>
                                    ))}
                                </Flex>
                            </Flex>
                        </Col>
                        <Col span={6}>
                            <Flex gap="middle" vertical style={{ margin: 10 }}>
                                <Flex vertical>
                                    <h2 style={{ marginLeft: 30 }}>In Review</h2>
                                    {taskData.map((item, i) => (
                                        <>
                                            {item.status === "In Review" &&
                                                <Card size="small" title={item.name} extra={<Button type="link" onClick={() => getTasksDetail(item.id)}> Details </Button>} style={{ width: 300, margin: 15 }}>
                                                    <Row>
                                                        <Col>
                                                            Owner: <Tag>{item.owner.username}</Tag>
                                                        </Col>
                                                        <Col>
                                                            Priority: <Tag>{item.priority}</Tag>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            Desc : {item.description}
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            Created Date: <Tag> {item.created_at.split("T")[0]}</Tag>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            Deadline: <Tag>{item.deadline !== null ? item.deadline.split("T")[0] : "-"}</Tag>
                                                        </Col>
                                                    </Row>
                                                    <Cascader size='small' options={statusData} onChange={(e) => onChange(e, item)} placeholder="Select Status" />
                                                </Card>}
                                        </>
                                    ))}
                                </Flex>
                            </Flex>
                        </Col>
                        <Col span={6}>
                            <Flex gap="middle" vertical style={{ margin: 10 }}>
                                <Flex vertical>
                                    <h2 style={{ marginLeft: 30 }}>Done</h2>
                                    {taskData.map((item, i) => (
                                        <>
                                            {item.status === "Done" &&
                                                <Card size="small" title={item.name} extra={<Button type="link" onClick={() => getTasksDetail(item.id)}> Details </Button>} style={{ width: 300, margin: 15 }}>
                                                    <Row>
                                                        <Col>
                                                            Owner: <Tag>{item.owner.username}</Tag>
                                                        </Col>
                                                        <Col>
                                                            Priority: <Tag>{item.priority}</Tag>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            Desc : {item.description}
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            Created Date: <Tag> {item.created_at.split("T")[0]}</Tag>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            Deadline: <Tag>{item.deadline !== null ? item.deadline.split("T")[0] : "-"}</Tag>
                                                        </Col>
                                                    </Row>
                                                    <Cascader size='small' options={statusData} onChange={(e) => onChange(e, item)} placeholder="Select Status" />
                                                </Card>}
                                        </>
                                    ))}
                                </Flex>
                            </Flex>
                        </Col>
                        <Modal title="Create Task" open={isModalOpenC} onCancel={handleCancelC} footer={null}>
                            <Form
                                name="basic"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 16 }}
                                style={{ maxWidth: 600 }}
                                initialValues={{ remember: true }}
                                onFinish={onFinishCreateTask}
                                autoComplete="off"
                            >
                                <Form.Item<FieldType>
                                    label="Name"
                                    name="name"
                                    rules={[{ required: true }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item<FieldType>
                                    label="Description"
                                    name="description"
                                    rules={[{ required: true }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item<FieldType>
                                    label="Status"
                                    name="status_id"
                                    rules={[{ required: true }]}
                                >
                                    <Cascader options={statusData} placeholder="Select Status" />
                                </Form.Item>
                                <Form.Item<FieldType>
                                    label="Priority"
                                    name="priority_id"
                                    rules={[{ required: true }]}
                                >
                                    <Cascader options={priorityData} placeholder="Select Status" />
                                </Form.Item>
                                <Form.Item<FieldType>
                                    label="Deadline"
                                    name="deadline"
                                    rules={[{ required: true }]}
                                >
                                    <DatePicker onChange={onChangeCreateDate} />
                                </Form.Item>
                                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                    <Button type="primary" htmlType="submit">
                                        Submit
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Modal>
                        <Modal
                            title={task?.name}
                            centered
                            open={openTaskModal}
                            onOk={() => setOpenTaskModal(false)}
                            onCancel={() => setOpenTaskModal(false)}
                            width={850}
                        >
                            <Row>
                                <Col span={16}>
                                    <Button
                                        type="primary"
                                        size="small"
                                        danger
                                        onClick={() => task?.id !== undefined && deleteTask(task.id)}
                                    >
                                        Delete Task
                                    </Button>
                                </Col>
                                <Col span={4}  >
                                    Created at: <Tag>{task?.created_at.split("T")[0]}</Tag>
                                </Col>
                                <Col span={4}>
                                    Deadline: <Tag>{task?.deadline.split("T")[0]}</Tag>
                                </Col>
                            </Row>
                            <Row style={{ marginTop: 20 }}>
                                <Col span={16}>
                                    Description: {task?.description}
                                </Col>
                                <Col span={8} >
                                    Owner : <Tag>{task?.owner.username} - {task?.owner.email}</Tag>
                                </Col>
                            </Row>
                            <Row style={{ marginTop: 20 }}>
                                <Col span={16}>
                                    <Button icon={<PlusOutlined />} size='small' style={{ marginRight: 10 }} onClick={() => task?.id !== undefined && showCollaboratorsModal(task?.id)} />
                                    Assignees :
                                    {task?.assignees.map((assignee, index) => (

                                        <Tooltip title={<Button size='small' type="link" danger onClick={() => removeAssignees(task.id, assignee.id)}  >
                                            Remove Assigne
                                        </Button>} key={"red"}>
                                            <Tag key={index} style={{ marginLeft: 5 }}>{assignee?.username}</Tag>
                                        </Tooltip>

                                    ))}
                                </Col>
                                <Col span={4} >
                                    Priority : <Tag>{task?.priority}</Tag>
                                </Col>
                                <Col span={4} >
                                    Status : <Tag>{task?.status}</Tag>
                                </Col>
                            </Row>
                            {isModalOpenAss === true && <Row style={{ marginTop: 20 }}>
                                <Col span={24}>
                                    <Cascader size='small' options={allUsers} onChange={(e) => onChangeCollaborator(e)} placeholder="Please select" style={{ marginLeft: 5 }} />
                                    <Button type="primary" size='small' style={{ marginLeft: 5 }}
                                        onClick={() => task?.id !== undefined && collaboratorSubmit(task?.id)}
                                    >
                                        Submit
                                    </Button>
                                </Col>
                            </Row>}
                            <Row style={{ marginTop: 50 }}>

                                <Col span={24}>
                                    <Search
                                        placeholder="input search text"
                                        enterButton="Comment"
                                        onSearch={(value) => {
                                            task?.id !== undefined && commentTask(task?.id, value)
                                        }}
                                        loading={false}
                                    />
                                </Col>
                            </Row>
                            <Row style={{ marginTop: 20 }}>
                                <Col span={24}>
                                    <div
                                        id="scrollableDiv"
                                        style={{
                                            height: 150,
                                            overflow: 'auto',
                                            padding: '0 16px',
                                            border: '1px solid rgba(140, 140, 140, 0.35)',
                                        }}
                                    >
                                        <List
                                            dataSource={task?.comments}
                                            renderItem={(item) => (
                                                <List.Item key={item.id}>
                                                    <List.Item.Meta
                                                        title={<a >{item.commentor.username} - {item.commentor.email}</a>}
                                                        description={item.comment}
                                                    />
                                                    <div style={{ marginRight: 15 }}>{item.created_at.split("T")[0]}</div>
                                                    <div> Content</div>
                                                </List.Item>
                                            )}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <br />
                        </Modal>
                    </Row>
                }
                {activeTabKey2 === "priority" &&
                    <>
                        <Card
                            size='small'
                            style={{ marginTop: 16 }}
                            type="inner"
                            title="Priority..."
                            extra={<a href="#">More</a>}
                        >
                            <List
                                size='small'
                                itemLayout="horizontal"
                                dataSource={data}
                                renderItem={(item, index) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                                            title={<a href="https://ant.design">{item.title}</a>}
                                            description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>
                        <Card
                            size='small'
                            style={{ marginTop: 16 }}
                            type="inner"
                            title="Priority..."
                            extra={<a href="#">More</a>}
                        >
                            <List
                                size='small'
                                itemLayout="horizontal"
                                dataSource={data}
                                renderItem={(item, index) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                                            title={<a href="https://ant.design">{item.title}</a>}
                                            description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>
                        <Card
                            style={{ marginTop: 16 }}
                            type="inner"
                            title="Priority..."
                            extra={<a href="#">More</a>}
                            size='small'
                        >
                            <List
                                size='small'
                                itemLayout="horizontal"
                                dataSource={data}
                                renderItem={(item, index) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                                            title={<a href="https://ant.design">{item.title}</a>}
                                            description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </>
                }
            </Card >
        </>
    );
};

export default Backlog;