import React, { useEffect, useState, useRef } from "react";
import type { GetProp, TableProps } from "antd";
import { Table, Input, Button, Space, message } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { User, CustomerInfo, CreateCustomerInfo } from "../types";
import AddCustomerModal from "../modals/AddCustomerModal";

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
  const [filteredData, setFilteredData] = useState<CustomerInfo[]>([]); // 筛选后的数据
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<any>(null);

  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

  // 打开新增用户浮层
  const showAddCustomerModal = () => {
    setIsAddCustomerModalOpen(true);
  };

  // 关闭新增用户浮层
  const cancelAddCustomerModal = () => {
    setIsAddCustomerModalOpen(false);
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
      title: "姓名",
      dataIndex: "name",
      width: "15%",
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
      width: "20%",
      ...getColumnSearchProps("id_card"),
    },
    {
      title: "操作",
      key: "action",
      width: "10%",
    },
  ];

  // 删除操作
  const handleDelete = (customerId: number) => {
    // 调用 API 删除车辆
    fetch(`http://localhost:5000/api/vehicles/${customerId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.error);
          });
        }
        fetchData();
        message.success("车辆删除成功");
      })
      .catch((error) => {
        message.error("车辆删除失败：" + error.message);
        console.error("Error deleting vehicle:", error);
      });
  };

  const handleCreate = async (
    values: Omit<CreateCustomerInfo, "customer_id">
  ) => {
    // 调用 API 创建车辆
    fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.error);
          });
        }
        fetchData();
        message.success("客户创建成功");
        setIsAddCustomerModalOpen(false);
      })
      .catch((error) => {
        message.error("客户创建失败：" + error.message);
        console.error("Error creating vehicle:", error);
      });
  };

  // 获取数据
  const fetchData = () => {
    setLoading(true);
    fetch("http://localhost:5000/api/customers")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((response) => {
        if (Array.isArray(response.data)) {
          setData(response.data);
          setFilteredData(response.data); // 初始化筛选数据
          setLoading(false);
          setTableParams({
            pagination: {
              ...tableParams.pagination,
              total: response.data.length, // 更新总数
            },
          });
        } else {
          throw new Error("Invalid data format: expected an array");
        }
      })
      .catch((error) => {
        message.error("获取数据失败，请稍后再试");
        console.error("Error fetching data:", error);
        setLoading(false);
      });
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
        visible={isAddCustomerModalOpen}
        onCancel={cancelAddCustomerModal}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default CustomerPage;
