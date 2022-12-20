import React, { useState } from "react";
import WeeklyScoresTable from "./WeeklyScoresTable";

type TableDef = {
  header: {
    header: string;
    cols: string[];
  };
  rows: {
    rowHeader: string;
    data: string[];
  }[];
};
type ColumnHeaderProps<DataType> = {
  children?: string;
  key: keyof DataType;
};
type HeaderProps<T> = {
  children:
    | React.ReactElement<ColumnHeaderProps<T>>
    | [
        React.ReactElement<ColumnHeaderProps<T>>,
        ...React.ReactElement<ColumnHeaderProps<T>>[]
      ];
};

type BodyCellProps = {
  key: string;
};

type BodyProps = {
  children:
    | React.ReactElement<BodyCellProps>
    | [
        React.ReactElement<BodyCellProps>,
        ...React.ReactElement<BodyCellProps>[]
      ];
};

type TableProps<DataType> = {
  children: React.ReactElement<HeaderProps<DataType>>;
  data: DataType[];
  rowHeader: keyof DataType;
  tableTitle: string;
};

type BuiltTableComponentsType<T> = {
  Table: React.FC<TableProps<T>>;
  Header: React.FC<HeaderProps<T>>;
  HeaderCell: React.FC<ColumnHeaderProps<T>>;
  Body: React.FC<BodyProps>;
  BodyCell: React.FC<BodyCellProps>;
};

export function getTable<T>(): BuiltTableComponentsType<T> {
  const table: React.FC<TableProps<T>> = ({
    children,
    data,
    rowHeader,
    tableTitle,
  }) => {
    const [sortDir, setSortDir] = useState(1 | 0 | -1);
    const [sortParam, setSortParam] = useState<keyof T>(rowHeader);

    let columnEls = [children.props.children].flat(1);

    const sortedData = data;

    sortedData.sort((a, b) => {
      if (a[sortParam] > b[sortParam]) {
        return 1 * sortDir;
      } else {
        return -1 * sortDir;
      }
    });

    return (
      <div
        className="w-100 p-3"
        style={{ display: "flex", flexDirection: "row" }}
      >
        <div className="w-40">
          {
            <div
              className="w-100"
              style={{
                backgroundColor: "#aaa",
                borderRight: "1px solid #bbb",
                overflowX: "hidden",
              }}
              onClick={() => {
                setSortParam(rowHeader);
                setSortDir(sortDir * -1);
              }}
            >
              {tableTitle}
            </div>
          }
          {sortedData.map((datum, idx) => {
            const rh = datum[rowHeader] + "";
            return (
              <div
                className="w-100"
                style={{
                  backgroundColor: idx % 2 ? "#fff" : "#eee",
                  borderRight: "1px solid #bbb",
                  overflow: "hidden",
                  height:" 50px"
                }}
              >
                {rh}
              </div>
            );
          })}
        </div>
        <div
          className="w-75 hide-scrollbar"
          style={{ overflowX: "scroll", display: "flex", flexDirection: "row" }}
        >
          {columnEls.map((el) => {
            return (
              <div style={{ minWidth: "150px" }}>
                <div
                  style={{ backgroundColor: "#aaa" }}
                  onClick={() => {
                    setSortParam(el.key);
                    setSortDir(sortDir * -1);
                  }}
                >
                  {el.props.children ? el.props.children : el.key}
                </div>
                {sortedData.map((datum, idx) => {
                  //@ts-ignore
                  let rd = datum[el.key];
                  return (
                    <div
                      style={{
                        backgroundColor: idx % 2 ? "#fff" : "#eee",
                        height: "50px"
                      }}
                    >
                      {rd}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  const header: React.FC<HeaderProps<T>> = (props) => {
    return <></>;
  };
  const headerCell: React.FC<ColumnHeaderProps<T>> = ({ children, key }) => {
    return <div>{children ? children : "(no title)"}</div>;
  };
  const body: React.FC<BodyProps> = (props) => {
    return <>{props.children}</>;
  };
  const bodyCell: React.FC<BodyCellProps> = (props) => {
    return <></>;
  };

  return {
    Table: table,
    Header: header,
    HeaderCell: headerCell,
    Body: body,
    BodyCell: bodyCell,
  };
}

const SeasonSummaryStatsTable: React.FC<TableProps<{}>> = (props) => {
  //validate the data
  /*let valid = true;
    data.forEach((d)=>{
        if(!Object.keys(d).includes(key)) {
            valid = false;
        }
    });*/

  /*if(!valid) {
        return <div>Data was not valid</div>
    }*/
  console.log(props.children);

  const tDef: TableDef = {
    header: {
      header: "Teams",
      cols: ["WAE", "OppLuck", "xRec"],
    },
    rows: [
      {
        rowHeader: "Team 1",
        data: ["1", "2", "3"],
      },
      {
        rowHeader: "Team 1",
        data: ["1", "2", "3"],
      },
      {
        rowHeader: "Team 1",
        data: ["1", "2", "3"],
      },
      {
        rowHeader: "Team 1",
        data: ["1", "2", "3"],
      },
    ],
  };
  const getRowHeaders = () => {
    return ["Teams"].concat(["A", "B", "C", "D"]).map((h, idx) => {
      return (
        <div
          className="w-100"
          style={{
            backgroundColor: idx % 2 ? "#fff" : "#eee",
            borderRight: "1px solid #bbb",
          }}
        >
          {h}
        </div>
      );
    });
  };

  const getTableHeader = () => {
    return ["Teams, WAE, OppLuck, xRec"].map((h, idx) => {
      if (idx == 0) {
        return (
          <div
            className="w-100"
            style={{
              backgroundColor: "#aaa",
              borderRight: "1px solid #bbb",
            }}
          >
            {h}
          </div>
        );
      }
      return <div style={{ flexGrow: 1 }}>{h}</div>;
    });
  };

  const getRowData = (idx: number) => {
    const scale = 200;
    const dataLength = 13;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: scale * dataLength + "px",
          backgroundColor: idx % 2 ? "#fff" : "#eee",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((d) => {
          return <div style={{ flexGrow: 1 }}>{d}</div>;
        })}
      </div>
    );
  };

  return (
    <div
      className="w-100 p-3"
      style={{ display: "flex", flexDirection: "row" }}
    >
      <div className="w-25">
        {
          <div
            className="w-100"
            style={{
              backgroundColor: "#aaa",
              borderRight: "1px solid #bbb",
            }}
          >
            {tDef.header.header}
          </div>
        }
        {tDef.rows.map((row, idx) => {
          return (
            <div
              className="w-100"
              style={{
                backgroundColor: idx % 2 ? "#fff" : "#eee",
                borderRight: "1px solid #bbb",
              }}
            >
              {row.rowHeader}
            </div>
          );
        })}
      </div>
      <div
        className="w-75 hide-scrollbar"
        style={{ overflowX: "scroll", display: "flex", flexDirection: "row" }}
      >
        {tDef.header.cols.map((colHeader, colIdx) => {
          return (
            <div style={{ minWidth: "150px" }}>
              <div style={{ backgroundColor: "#aaa" }}>{colHeader}</div>
              {tDef.rows.map((row, rowIdx) => {
                return (
                  <div
                    style={{
                      backgroundColor: rowIdx % 2 ? "#fff" : "#eee",
                    }}
                  >
                    {row.data[colIdx]}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeasonSummaryStatsTable;
