import React, { useEffect, useState, useRef } from "react";
import type { GetProp, TableProps } from "antd";
import { Table, Input, Button, Space, message } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import AddVehicleModal from "./components/AddVehiclesModal";
import { Vehicle, VehicleInfo, VehiclesPageProps } from "./types";
import RentalModal from "./components/RentalModal";

type ColumnsType<T extends object = object> = TableProps<T>["columns"];
type TablePaginationConfig = Exclude<
  GetProp<TableProps, "pagination">,
  boolean
>;

interface TableParams {
  pagination?: TablePaginationConfig;
}

const VehiclesPage: React.FC<VehiclesPageProps> = ({ user }) => {
  const [data, setData] = useState<VehicleInfo[]>();
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

  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null
  ); // 记录当前租赁的车辆 ID

  // 打开新增车辆浮层
  const showAddVehicleModal = () => {
    setIsAddVehicleModalOpen(true);
  };

  // 关闭新增车辆浮层
  const cancelAddVehicleModal = () => {
    setIsAddVehicleModalOpen(false);
  };

  const showRentalModal = () => {
    setIsRentModalOpen(true);
  };

  const cancelRentalModal = () => {
    setIsRentModalOpen(false);
  };

  // 搜索逻辑
  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: keyof VehicleInfo
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex as string);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (
    dataIndex: keyof VehicleInfo
  ): Exclude<TableProps<VehicleInfo>["columns"], undefined>[number] => ({
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
  const columns: ColumnsType<VehicleInfo> = [
    {
      title: "ID",
      dataIndex: "vehicle_id",
      width: "5%",
    },
    {
      title: "车牌号",
      dataIndex: "plate_number",
      width: "15%",
      ...getColumnSearchProps("plate_number"),
    },
    {
      title: "车辆类型",
      dataIndex: "type",
      width: "10%",
      ...getColumnSearchProps("type"),
    },
    {
      title: "品牌",
      dataIndex: "brand",
      width: "10%",
      ...getColumnSearchProps("brand"),
    },
    {
      title: "型号",
      dataIndex: "model",
      width: "10%",
      ...getColumnSearchProps("model"),
    },
    {
      title: "颜色",
      dataIndex: "color",
      width: "10%",
      ...getColumnSearchProps("color"),
    },
    {
      title: "日租金（元）",
      dataIndex: "price_per_day",
      width: "15%",
      ...getColumnSearchProps("price_per_day"),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: "10%",
      ...getColumnSearchProps("status"),
    },
    {
      title: "操作",
      key: "action",
      width: "20%",
      render: (_, record) => (
        <Space>
          {user?.role === "admin" && (
            <Button type="link" onClick={() => handleDelete(record.vehicle_id)}>
              删除
            </Button>
          )}
          {/* 普通用户显示“租赁”按钮 */}
          {user?.role === "user" && (
            <Button
              type="link"
              onClick={() => {
                showRentalModal();
                setSelectedVehicleId(record.vehicle_id);
              }}
            >
              租赁
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 删除操作
  const handleDelete = (vehicleId: number) => {
    // 调用 API 删除车辆
    fetch(`http://localhost:5000/api/vehicles/${vehicleId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          // 如果响应状态码不是 2xx，解析错误信息
          return res.json().then((errorData) => {
            throw new Error(errorData.error);
          });
        }
        // 删除成功后重新加载数据
        fetchData();
        message.success("车辆删除成功");
      })
      .catch((error) => {
        // 显示错误提示
        message.error("车辆删除失败：" + error.message);
        console.error("Error deleting vehicle:", error);
      });
  };

  const handleCreate = async (values: Omit<Vehicle, "vehicle_id">) => {
    // 调用 API 创建车辆
    fetch("http://localhost:5000/api/vehicles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then((res) => {
        if (!res.ok) {
          // 如果响应状态码不是 2xx，解析错误信息
          return res.json().then((errorData) => {
            throw new Error(errorData.error);
          });
        }
        // 创建成功后重新加载数据
        fetchData();
        message.success("车辆创建成功");
        setIsAddVehicleModalOpen(false); // 关闭 Modal
      })
      .catch((error) => {
        // 显示错误提示
        message.error("车辆创建失败：" + error.message);
        console.error("Error creating vehicle:", error);
      });
  };

  const handleRent = async (values: {
    start_time: string;
    duration_days: number;
  }) => {
    console.log(selectedVehicleId, values);

    if (!selectedVehicleId) return; // 如果没有选中车辆，直接返回

    // 调用 API 处理租赁逻辑
    fetch("http://localhost:5000/api/rentals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehicle_id: selectedVehicleId,
        customer_id: user?.id,
        start_time: values.start_time,
        duration_days: values.duration_days,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.error);
          });
        }

        // 租赁成功后刷新数据
        fetchData();
        message.success("租赁成功");
        setIsRentModalOpen(false); // 关闭 Modal
      })
      .catch((error) => {
        message.error("租赁失败：" + error.message);
        console.error("Error renting vehicle:", error);
      });
  };

  // 获取数据
  const fetchData = () => {
    setLoading(true);

    // 构造查询参数
    const page = tableParams.pagination?.current || 1;
    const pageSize = tableParams.pagination?.pageSize || 10;

    // 发起请求
    fetch(
      `http://localhost:5000/api/vehicles?page=${page}&pageSize=${pageSize}`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((response) => {
        // 确保 response.data 是一个数组
        if (Array.isArray(response.data)) {
          setData(response.data); // 设置表格数据
          setLoading(false);
          setTableParams({
            ...tableParams,
            pagination: {
              ...tableParams.pagination,
              total: response.total, // 更新总条数
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
  }, [tableParams.pagination?.current, tableParams.pagination?.pageSize]);

  const handleTableChange: TableProps<VehicleInfo>["onChange"] = (
    pagination
  ) => {
    setTableParams({
      pagination,
    });

    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  return (
    <div>
      {/* 新增车辆按钮 */}
      {user?.role === "admin" && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showAddVehicleModal}
          style={{ marginBottom: 16 }}
        >
          新增车辆
        </Button>
      )}

      {/* 车辆表格 */}
      <Table<VehicleInfo>
        columns={columns}
        rowKey={(record) => record.vehicle_id.toString()}
        dataSource={data}
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
      />

      {/* 新增车辆浮层 */}
      <AddVehicleModal
        visible={isAddVehicleModalOpen}
        onCancel={cancelAddVehicleModal}
        onCreate={handleCreate}
      />

      <RentalModal
        open={isRentModalOpen}
        onCancel={cancelRentalModal}
        onRent={handleRent}
      />
    </div>
  );
};

export default VehiclesPage;
