import React, { useEffect, useState, useRef } from "react";
import type { GetProp, TableProps } from "antd";
import { Table, Input, Button, Space } from "antd";
import type {
  SorterResult,
  FilterDropdownProps,
} from "antd/es/table/interface";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";

type ColumnsType<T extends object = object> = TableProps<T>["columns"];
type TablePaginationConfig = Exclude<
  GetProp<TableProps, "pagination">,
  boolean
>;

interface DataType {
  vehicle_id: number;
  plate_number: string;
  type: string;
  brand: string;
  model: string;
  color: string;
  price_per_day: number;
}

interface TableParams {
  pagination?: TablePaginationConfig;
}

const VehiclesPage: React.FC = () => {
  const [data, setData] = useState<DataType[]>();
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

  // 搜索逻辑
  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: keyof DataType
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
    dataIndex: keyof DataType
  ): Exclude<TableProps<DataType>["columns"], undefined>[number] => ({
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
  const columns: ColumnsType<DataType> = [
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
      width: "15%",
      ...getColumnSearchProps("brand"),
    },
    {
      title: "型号",
      dataIndex: "model",
      width: "15%",
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
      width: "10%",
      ...getColumnSearchProps("price_per_day"),
    },
    {
      title: "操作",
      key: "action",
      width: "20%",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleDelete(record.vehicle_id)}>
            删除
          </Button>
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
      .then(() => {
        // 删除成功后重新加载数据
        fetchData();
      })
      .catch((error) => {
        console.error("Error deleting vehicle:", error);
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
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [tableParams.pagination?.current, tableParams.pagination?.pageSize]);

  const handleTableChange: TableProps<DataType>["onChange"] = (pagination) => {
    setTableParams({
      pagination,
    });

    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  return (
    <Table<DataType>
      columns={columns}
      rowKey={(record) => record.vehicle_id.toString()}
      dataSource={data}
      pagination={tableParams.pagination}
      loading={loading}
      onChange={handleTableChange}
    />
  );
};

export default VehiclesPage;
