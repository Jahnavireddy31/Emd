import React, { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {Card,Input, Select,Switch,Modal, Form,Button,Space,message} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const { Option } = Select;

const initialEmployees = [
  { id: 1, name: 'Alice', department: 'HR', role: 'Manager', salary: 60000, status: true },
  { id: 2, name: 'Bob', department: 'Engineering', role: 'Developer', salary: 70000, status: false },
  { id: 3, name: 'Charlie', department: 'Sales', role: 'Sales Rep', salary: 50000, status: true }
];

export default function EmployeeDashboard() {
  const [rowData, setRowData] = useState(initialEmployees);
  const [searchText, setSearchText] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form] = Form.useForm();


  const filteredData = useMemo(() => {
    return rowData.filter(emp => {
      const matchesName = emp.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesDept = departmentFilter ? emp.department === departmentFilter : true;
      const matchesStatus = statusFilter !== null ? emp.status === statusFilter : true;
      return matchesName && matchesDept && matchesStatus;
    });
  }, [rowData, searchText, departmentFilter, statusFilter]);

  const columnDefs = [
    { headerName: 'ID', field: 'id', sortable: true, filter: true },
    { headerName: 'Name', field: 'name', sortable: true, filter: true },
    { headerName: 'Department', field: 'department', sortable: true, filter: true },
    { headerName: 'Role', field: 'role', sortable: true, filter: true },
    { headerName: 'Salary', field: 'salary', sortable: true, filter: true },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: (params) => (params.value ? 'Active' : 'Inactive'),
      sortable: true,
      filter: true
    },
    {
      headerName: 'Actions',
      cellRendererFramework: (params) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => onEdit(params.data)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => onDelete(params.data)} />
        </Space>
      )
    }
  ];
const defaultColDef = {
    flex: 1,
    minWidth: 120,
    resizable: true,
  };
  const onEdit = (data) => {
    setEditingEmployee(data);
    form.setFieldsValue(data);
    setIsModalVisible(true);
  };

  const onDelete = (data) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this employee?',
      onOk: () => {
        setRowData(prev => prev.filter(emp => emp.id !== data.id));
        message.success('Employee deleted');
      }
    });
  };

  const onAdd = () => {
    setEditingEmployee(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingEmployee) {
        setRowData(prev => prev.map(emp => emp.id === editingEmployee.id ? { ...editingEmployee, ...values } : emp));
        message.success('Employee updated');
      } else {
        const newEmp = { id: Date.now(), ...values };
        setRowData(prev => [...prev, newEmp]);
        message.success('Employee added');
      }
      setIsModalVisible(false);
    });
  };

  return (
    <Card title="Employee Dashboard" style={{ margin: 20 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space wrap>
          <Input.Search placeholder="Search by name" onChange={e => setSearchText(e.target.value)} allowClear />
          <Select placeholder="Filter by department" onChange={setDepartmentFilter} allowClear>
            <Option value="HR">HR</Option>
            <Option value="Engineering">Engineering</Option>
            <Option value="Sales">Sales</Option>
          </Select>
          <span>Status:</span>
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" onChange={val => setStatusFilter(val)} />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          Add Employee
        </Button>
        <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
          <AgGridReact
            rowData={filteredData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={10}
            rowSelection="multiple"
          />
        </div>
      </Space>

      <Modal
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="department" label="Department" rules={[{ required: true }]}> <Select>
            <Option value="HR">HR</Option>
            <Option value="Engineering">Engineering</Option>
            <Option value="Sales">Sales</Option>
          </Select> </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="salary" label="Salary" rules={[{ required: true, type: 'number', min: 0 }]}> <Input type="number" /> </Form.Item>
          <Form.Item name="status" label="Status" valuePropName="checked"> <Switch checkedChildren="Active" unCheckedChildren="Inactive" /> </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}