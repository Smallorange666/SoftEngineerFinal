import React, { useEffect, useState, useRef } from "react";
import type { GetProp, TableProps } from "antd";
import { Table, Input, Button, Space } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { OngoningRentalInfo } from "../types";
import { fetchOngoingRental } from "../services/rentServices";
import CancelRentalModal from "../modals/CancelRentalModal";
import ReturnRentalModal from "../modals/ReturnModal";

type ColumnsType<T extends object = object> = TableProps<T>["columns"];
type TablePaginationConfig = Exclude<
  GetProp<TableProps, "pagination">,
  boolean
>;

interface TableParams {
  pagination?: TablePaginationConfig;
}

const OngoingRentalPage: React.FC = () => {
  const [data, setData] = useState<OngoningRentalInfo[]>([]);
  const [filteredData, setFilteredData] = useState<OngoningRentalInfo[]>([]);
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

  const [selectedRentalId, setSelectedRentalId] = useState<number | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const showCancelModal = () => {
    setIsCancelModalOpen(true);
  };

  const cancelCancelModal = () => {
    setIsCancelModalOpen(false);
  };

  const showReturnModal = () => {
    setIsReturnModalOpen(true);
  };

  const cancelReturnModal = () => {
    setIsReturnModalOpen(false);
  };

  // 搜索逻辑
  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: keyof OngoningRentalInfo
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
    dataIndex: keyof OngoningRentalInfo
  ): Exclude<TableProps<OngoningRentalInfo>["columns"], undefined>[number] => ({
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
  const columns: ColumnsType<OngoningRentalInfo> = [
    {
      title: "ID",
      dataIndex: "rental_id",
      width: "5%",
    },
    {
      title: "车牌号",
      dataIndex: "plate_number",
      width: "15%",
      ...getColumnSearchProps("plate_number"),
    },
    {
      title: "租客姓名",
      dataIndex: "name",
      width: "10%",
      ...getColumnSearchProps("name"),
    },
    {
      title: "租客电话",
      dataIndex: "phone",
      width: "10%",
    },
    {
      title: "总费用",
      dataIndex: "total_fee",
      width: "10%",
      ...getColumnSearchProps("total_fee"),
    },
    {
      title: "预计归还时间",
      dataIndex: "expected_return_time",
      width: "15%",
    },
    {
      title: "操作",
      key: "action",
      width: "20%",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => {
              setSelectedRentalId(record.rental_id);
              showReturnModal();
            }}
          >
            确认归还
          </Button>
          <Button
            type="link"
            onClick={() => {
              setSelectedRentalId(record.rental_id);
              showCancelModal();
            }}
          >
            取消租赁
          </Button>
        </Space>
      ),
    },
  ];

  // 获取数据
  const fetchData = async () => {
    setLoading(true);
    try {
      const vehicles = await fetchOngoingRental(); // 调用服务函数
      setData(vehicles);
      setFilteredData(vehicles); // 初始化筛选数据
      setLoading(false);
      setTableParams({
        pagination: {
          ...tableParams.pagination,
          total: vehicles.length, // 更新总数
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

  const handleTableChange: TableProps<OngoningRentalInfo>["onChange"] = (
    pagination
  ) => {
    setTableParams({
      pagination,
    });
  };

  return (
    <div>
      <Table<OngoningRentalInfo>
        columns={columns}
        rowKey={(record) => record.rental_id.toString()}
        dataSource={filteredData} // 使用筛选后的数据
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
      />

      <ReturnRentalModal
        rental_id={selectedRentalId as number}
        open={isReturnModalOpen}
        onCancel={cancelReturnModal}
        onReturnSuccess={async () => {
          await fetchData();
          cancelReturnModal();
        }}
      />

      <CancelRentalModal
        rental_id={selectedRentalId as number}
        open={isCancelModalOpen}
        onCancel={cancelCancelModal}
        onCancelSuccess={async () => {
          await fetchData();
          cancelCancelModal();
        }}
      />
    </div>
  );
};

export default OngoingRentalPage;
