import { Button, Form, Input, InputNumber, Popconfirm, Table, Select, Space } from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { tasks } from "@/data/test.json";

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    inputType,
    ...restProps
}) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);
    useEffect(() => {
        if (editing) {
            inputRef.current.focus();
        }
    }, [editing]);
    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({
            [dataIndex]: record[dataIndex],
        });
    };
    const save = async () => {
        try {
            const values = await form.validateFields();
            toggleEdit();
            handleSave({
                ...record,
                ...values,
            });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };


    let childNode = children;
    if (editable) {
        childNode = editing ? (
            <Form.Item
                style={{
                    margin: 0,
                }}
                name={dataIndex}
                rules={[
                    {
                        required: false,
                        message: `${title} is required.`,
                    },
                ]}
            >

                {inputType === 'number'
                    ? <InputNumber ref={inputRef} onPressEnter={save} onBlur={save} />
                    : <Input ref={inputRef} onPressEnter={save} onBlur={save} />}

            </Form.Item>
        ) : (
            <div
                className="editable-cell-value-wrap"
                style={{
                    paddingRight: 24,
                }}
                onClick={toggleEdit}
            >
                {children}
            </div>
        );
    }
    return <td {...restProps}>{childNode}</td>;
};

const EstimatorTable = () => {

    const [dataSource, setDataSource] = useState([]); //tasks
    const [total, setTotal] = useState(0);

    const [count, setCount] = useState(1);
    const handleDelete = (key) => {
        const newData = dataSource.filter((item) => item.key !== key);
        setDataSource(newData);
    };


    useEffect(() => {
        if (dataSource) {
            const totalHours = dataSource.reduce((accumulator, curr) => accumulator + curr.hours, 0);
            setTotal(totalHours);
        }
    }, [dataSource]);


    const defaultColumns = [
        {
            title: 'Tasks',
            dataIndex: 'name',
            width: '30%',
            editable: true,
        },
        {
            title: 'Hours',
            dataIndex: 'hours',
            width: '10%',
            editable: true,
        },
        {
            title: 'Description',
            dataIndex: 'address',
            editable: true,
        },
        {
            title: 'operation',
            dataIndex: 'operation',
            width: '10%',
            render: (_, record) =>
                dataSource.length >= 1 ? (
                    <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
                        <a>Delete</a>
                    </Popconfirm>
                ) : null,
        },
    ];

    const handleAdd = () => {
        const newData = {
            key: count,
            name: `New Task ${count}`,
            hours: 0,
            address: `Description ${count}`,
        };
        setDataSource([...dataSource, newData]);
        setCount(count + 1);
    };

    const handleDefault = () => {
        const newData = [];
        let tempCount = count;
        tasks.forEach(element => {
            newData.push({
                key: tempCount,
                ...element
            })
            tempCount += 1;

        });
        setCount(tempCount);
        setDataSource([...dataSource, ...newData]);

    };

    const handleSave = (row) => {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        setDataSource(newData);
    };

    const handleChange = (value) => {
        console.log(`selected ${value}`);
    };

    const save = () => {
        console.log("dataSource", dataSource)
    };

    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };
    const columns = defaultColumns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                inputType: col.dataIndex === 'hours' ? 'number' : 'text',
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave,
            }),
        };
    });
    return (
        <div>
            <Space wrap>
                <Button
                    onClick={handleDefault}
                    type="primary"
                    style={{
                        marginBottom: 16,
                    }}
                >
                    Add default efforts
                </Button>

                <Button
                    onClick={handleAdd}
                    type="primary"
                    style={{
                        marginBottom: 16,
                    }}
                >
                    Add a row
                </Button>
            </Space>

            <Table
                components={components}
                rowClassName={() => 'editable-row'}
                bordered
                tableLayout="auto"
                dataSource={dataSource}
                columns={columns}
            />

            <div className='total-estimation'>
                Total Estimation: {total}
            </div>
            <div className='save-button'>
                <Button type="primary" onClick={save}>Save</Button>
            </div>
        </div>
    );
};


export default EstimatorTable;