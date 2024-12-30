import React, { useEffect, useState } from "react";
import type { GetProp, TableProps } from "antd";
import { Table } from "antd";
import type { SorterResult } from "antd/es/table/interface";

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
  status: string;
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult<any>["field"];
  sortOrder?: SorterResult<any>["order"];
  filters?: Parameters<GetProp<TableProps, "onChange">>[1];
}

const columns: ColumnsType<DataType> = [
  {
    title: "ID",
    dataIndex: "vehicle_id",
    sorter: true,
    width: "5%",
  },
  {
    title: "车牌号",
    dataIndex: "plate_number",
    sorter: true,
    width: "15%",
  },
  {
    title: "车辆类型",
    dataIndex: "type",
    sorter: true,
    width: "15%",
  },
  {
    title: "品牌",
    dataIndex: "brand",
    sorter: true,
    width: "15%",
  },
  {
    title: "型号",
    dataIndex: "model",
    sorter: true,
    width: "15%",
  },
  {
    title: "颜色",
    dataIndex: "color",
    sorter: true,
    width: "10%",
  },
  {
    title: "日租金（元）",
    dataIndex: "price_per_day",
    sorter: true,
    width: "15%",
  },
  {
    title: "状态",
    dataIndex: "status",
    sorter: true,
    width: "10%",
  },
];

const VehiclesPage: React.FC = () => {
  const [data, setData] = useState<DataType[]>();
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const fetchData = () => {
    setLoading(true);
    fetch(`http://localhost:5000/api/vehicles`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: data.length, // 使用实际数据长度
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams?.sortOrder,
    tableParams?.sortField,
    JSON.stringify(tableParams.filters),
  ]);

  const handleTableChange: TableProps<DataType>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    setTableParams({
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    });

    // `dataSource` is useless since `pageSize` changed
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
