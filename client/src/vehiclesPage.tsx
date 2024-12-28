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
  type: string;
  brand: string;
  model: string;
  color: string;
  price_per_day: number;
  status: string;
  plate_number: string;
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
    width: "10%",
  },
  {
    title: "Type",
    dataIndex: "type",
    sorter: true,
    width: "15%",
  },
  {
    title: "Brand",
    dataIndex: "brand",
    sorter: true,
    width: "15%",
  },
  {
    title: "Model",
    dataIndex: "model",
    sorter: true,
    width: "15%",
  },
  {
    title: "Color",
    dataIndex: "color",
    sorter: true,
    width: "10%",
  },
  {
    title: "Price per Day",
    dataIndex: "price_per_day",
    sorter: true,
    width: "15%",
  },
  {
    title: "Status",
    dataIndex: "status",
    sorter: true,
    width: "10%",
  },
  {
    title: "Plate Number",
    dataIndex: "plate_number",
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
