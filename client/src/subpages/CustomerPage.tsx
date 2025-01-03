import React, { useEffect, useState, useRef } from "react";
import type { GetProp, TableProps } from "antd";
import { Table, Input, Button, Space } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { User, CustomerInfo } from "../types";
import {
  fetchAllCustomers,
  deleteCustomer,
} from "../services/customerServices";
import AddCustomerModal from "../modals/AddCustomerModal";
import UpdateProfileModal from "../modals/UpdateProfileModal";

type ColumnsType<T extends object = object> = TableProps<T>["columns"];
type TablePaginationConfig = Exclude<
  GetProp<TableProps, "pagination">,
  boolean
>;

interface TableParams {
  pagination?: TablePaginationConfig;
}

const CustomerPage: React.FC<User> = ({ user }) => {
  const [data, setData] = useState<CustomerInfo[]>([]);
  const [filteredData, setFilteredData] = useState<CustomerInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [selectedCustomerID, setSelectedCustomerID] = useState<number | null>(
    null
  );
  const searchInput = useRef<any>(null);

  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isUpdateProfileModalOpen, setIsUpdateProfileModalOpen] =
    useState(false);

  const showAddCustomerModal = () => {
    setIsAddCustomerModalOpen(true);
  };

  const cancelAddCustomerModal = () => {
    setIsAddCustomerModalOpen(false);
  };

  const showUpdateProfileModal = () => {
    setIsUpdateProfileModalOpen(true);
  };

  const cancelUpdateProfileModal = () => {
    setIsUpdateProfileModalOpen(false);
  };

  // 搜索逻辑
  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: keyof CustomerInfo
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex as string);

    // 根据筛选条件过滤数据
    const filtered = data.filter((item) =>
      item[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes(selectedKeys[0].toLowerCase())
    );
    setFilteredData(filtered);
    setTableParams({
      pagination: {
        ...tableParams.pagination,
        current: 1, // 重置到第一页
        total: filtered.length, // 更新总数
      },
    });
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
    setSearchedColumn("");
    setFilteredData(data); // 恢复原始数据
    setTableParams({
      pagination: {
        ...tableParams.pagination,
        current: 1, // 重置到第一页
        total: data.length, // 恢复总数
      },
    });
  };

  const getColumnSearchProps = (
    dataIndex: keyof CustomerInfo
  ): Exclude<TableProps<CustomerInfo>["columns"], undefined>[number] => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex as string);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  // 列定义
  const columns: ColumnsType<CustomerInfo> = [
    {
      title: "ID",
      dataIndex: "customer_id",
      width: "5%",
    },
    {
      title: "用户名",
      dataIndex: "username",
      width: "10%",
      ...getColumnSearchProps("username"),
    },
    {
      title: "姓名",
      dataIndex: "name",
      width: "10%",
      ...getColumnSearchProps("name"),
    },
    {
      title: "手机号",
      dataIndex: "phone",
      width: "15%",
      ...getColumnSearchProps("phone"),
    },
    {
      title: "地址",
      dataIndex: "address",
      width: "20%",
      ...getColumnSearchProps("address"),
    },
    {
      title: "身份证号",
      dataIndex: "id_card",
      width: "15%",
      ...getColumnSearchProps("id_card"),
    },
    {
      title: "操作",
      key: "action",
      width: "10%",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              showUpdateProfileModal();
              setSelectedCustomerID(record.customer_id);
            }}
          >
            更新信息
          </Button>
          <Button
            type="link"
            onClick={async () => {
              await deleteCustomer(record.customer_id);
              fetchData(); // 删除成功后重新加载数据
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 获取数据
  const fetchData = async () => {
    setLoading(true);
    try {
      const customers = await fetchAllCustomers(); // 调用服务函数
      setData(customers);
      setFilteredData(customers); // 初始化筛选数据
      setLoading(false);
      setTableParams({
        pagination: {
          ...tableParams.pagination,
          total: customers.length, // 更新总数
        },
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTableChange: TableProps<CustomerInfo>["onChange"] = (
    pagination
  ) => {
    setTableParams({
      pagination,
    });
  };

  return (
    <div>
      {user?.role === "admin" && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showAddCustomerModal}
          style={{ marginBottom: 16 }}
        >
          新增用户
        </Button>
      )}

      <Table<CustomerInfo>
        columns={columns}
        rowKey={(record) => record.customer_id.toString()}
        dataSource={filteredData} // 使用筛选后的数据
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
      />

      <AddCustomerModal
        open={isAddCustomerModalOpen}
        onCancel={cancelAddCustomerModal}
        onCreateSuccess={fetchData}
      />

      <UpdateProfileModal
        user={user}
        customer_id={selectedCustomerID as number}
        open={isUpdateProfileModalOpen}
        onCancel={cancelUpdateProfileModal}
        onUpdateProfileSuccess={fetchData}
      />
    </div>
  );
};

export default CustomerPage;
