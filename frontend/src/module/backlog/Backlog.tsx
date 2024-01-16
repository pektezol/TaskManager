import React, { useState } from 'react';
import { Avatar, Card, Col, Flex, List, Radio, Row } from 'antd';



const tabListNoTitle = [
    {
        key: 'backlog',
        label: 'Backlog',
    },
    {
        key: 'priority',
        label: 'By Prority',
    },
];



const App: React.FC = () => {
    const [activeTabKey2, setActiveTabKey2] = useState<string>('app');

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

    return (
        <>
            <br />
            <Card
                style={{ width: '100%' }}
                tabList={tabListNoTitle}
                activeTabKey={activeTabKey2}
                tabBarExtraContent={<a href="#">More</a>}
                onTabChange={onTab2Change}
                tabProps={{
                    size: 'middle',
                }}
            >
                {activeTabKey2 === "backlog" &&
                    <Row>
                        <Col span={6}>
                            <Flex gap="middle" vertical style={{ margin: 10 }}>
                                <Flex vertical>
                                    <h2 style={{ marginLeft: 30 }}>TO DO</h2>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <>
                                            <Card size="small" title="Small size card" extra={<a href="#">More</a>} style={{ width: 300, margin: 15 }}>
                                                <p>Card content</p>
                                                <p>Card content</p>
                                                <p>Card content</p>
                                            </Card>
                                        </>
                                    ))}
                                </Flex>
                            </Flex>
                        </Col>
                        <Col span={6}>
                            <Flex gap="middle" vertical style={{ margin: 10 }}>
                                <Flex vertical>
                                    <h2 style={{ marginLeft: 30 }}>TO DO</h2>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <>
                                            <Card size="small" title="Small size card" extra={<a href="#">More</a>} style={{ width: 300, margin: 15 }}>
                                                <p>Card content</p>
                                                <p>Card content</p>
                                                <p>Card content</p>
                                            </Card>
                                        </>
                                    ))}
                                </Flex>
                            </Flex>
                        </Col>
                        <Col span={6}>
                            <Flex gap="middle" vertical style={{ margin: 10 }}>
                                <Flex vertical>
                                    <h2 style={{ marginLeft: 30 }}>TO DO</h2>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <>
                                            <Card size="small" title="Small size card" extra={<a href="#">More</a>} style={{ width: 300, margin: 15 }}>
                                                <p>Card content</p>
                                                <p>Card content</p>
                                                <p>Card content</p>
                                            </Card>
                                        </>
                                    ))}
                                </Flex>
                            </Flex>
                        </Col>
                        <Col span={6}>
                            <Flex gap="middle" vertical style={{ margin: 10 }}>
                                <Flex vertical>
                                    <h2 style={{ marginLeft: 30 }}>TO DO</h2>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <>
                                            <Card size="small" title="Small size card" extra={<a href="#">More</a>} style={{ width: 300, margin: 15 }}>
                                                <p>Card content</p>
                                                <p>Card content</p>
                                                <p>Card content</p>
                                            </Card>
                                        </>
                                    ))}
                                </Flex>
                            </Flex>
                        </Col>
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
            </Card>
        </>
    );
};

export default App;