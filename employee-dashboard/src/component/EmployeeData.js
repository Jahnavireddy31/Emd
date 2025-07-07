import React, { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {Card,Input,Select,Switch,Space,Modal,Form,Button,message} from 'antd';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import employeeData from '../data/sampleData';

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

const EmployeeData= () => {
  const [rowData, setRowData] = useState(employeeData);
  const [searchName, setSearchName] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [showActive, setShowActive] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editForm] = Form.useForm();
  const [addForm] = Form.useForm();

  const departments = [...new Set(employeeData.map(emp => emp.department))];

  const filteredData = useMemo(() => {
    return rowData.filter(emp => {
      const matchesName = emp.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesDept = selectedDept ? emp.department === selectedDept : true;
      const matchesStatus =
        showActive === null ? true : emp.status === (showActive ? 'Active' : 'Inactive');

      return matchesName && matchesDept && matchesStatus;
    });
  }, [rowData, searchName, selectedDept, showActive]);

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    editForm.setFieldsValue(employee);
    setIsEditModalVisible(true);
  };

  const saveEdit = () => {
    editForm.validateFields().then(values => {
      const updatedData = rowData.map(emp =>
        emp.id === editingEmployee.id ? { ...emp, ...values } : emp
      );
      setRowData(updatedData);
      setIsEditModalVisible(false);
      message.success('Employee updated!');
    });
  };

  const handleDelete = (employee) => {
    confirm({
      title: 'Are you sure you want to delete this employee?',
      content: `Name: ${employee.name}`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        const updatedData = rowData.filter(emp => emp.id !== employee.id);
        setRowData(updatedData);
        message.success('Employee deleted!');
      }
    });
  };

  const handleAddEmployee = () => {
    addForm.resetFields();
    setIsAddModalVisible(true);
  };

  const submitAdd = () => {
    addForm.validateFields().then(values => {
      const newId = rowData.length ? Math.max(...rowData.map(emp => emp.id)) + 1 : 1;
      const newEmployee = { id: newId, ...values };
      setRowData([...rowData, newEmployee]);
      setIsAddModalVisible(false);
      message.success('Employee added!');
    });
  };

  const [columnDefs] = useState([
    { headerName: "Employee ID", field: "id", sortable: true, filter: true },
    { headerName: "Name", field: "name", sortable: true, filter: true },
    { headerName: "Department", field: "department", sortable: true, filter: true },
    { headerName: "Role", field: "role", sortable: true, filter: true },
    { headerName: "Salary", field: "salary", sortable: true, filter: true },
    { headerName: "Status", field: "status", sortable: true, filter: true },
    {
      headerName: "Actions",
      field: "actions",
      cellRendererFramework: (params) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(params.data)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(params.data)}>Delete</Button>
        </Space>
      )
    }
  ]);

  const defaultColDef = {
    flex: 1,
    minWidth: 120,
    resizable: true,
  };

  return (
    <Card title="Employee List" bordered={false} style={{ margin: 20 }}>
      <Space wrap style={{ marginBottom: 16, justifyContent: "space-between", display: "flex" }}>
        <Space wrap>
          <Search
            placeholder="Search by name"
            onChange={(e) => setSearchName(e.target.value)}
            allowClear
            style={{ width: 200 }}
          />
          <Select
            placeholder="Filter by department"
            onChange={(value) => setSelectedDept(value)}
            allowClear
            style={{ width: 200 }}
          >
            {departments.map(dept => (
              <Option key={dept} value={dept}>{dept}</Option>
            ))}
          </Select>
          <Switch
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            onChange={(checked) => setShowActive(checked)}
          />
          <span>
            {showActive === null ? 'All' : showActive ? 'Active' : 'Inactive'}
          </span>
        </Space>
        <Button type="primary" onClick={handleAddEmployee}>Add Employee</Button>
      </Space>

      <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
        <AgGridReact
          rowData={filteredData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection="multiple"
          pagination={true}
          paginationPageSize={10}
        />
      </div>

    
      <Modal
        title="Edit Employee"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={saveEdit}
        okText="Save"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="salary" label="Salary" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Employee"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onOk={submitAdd}
        okText="Add"
      >
        <Form form={addForm} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="department" label="Department" rules={[{ required: true }]}>
            <Select placeholder="Select Department">
              {departments.map(dept => (
                <Option key={dept} value={dept}>{dept}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="salary" label="Salary" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default EmployeeData;