from langflow.base.data.utils import EXCEL_FILE_TYPES
from langflow.custom import Component
from langflow.inputs import IntInput, StrInput, MessageInput
from langflow.io import DataInput, Output, FileInput, DefaultPromptField
from langflow.schema import DataFrame, Data
import pandas as pd
from langflow.schema.message import Message


class ExcelToDataFrameComponent(Component):
    display_name = "Excel文件 → DataFrame"
    description = (
        "读取到DataFrame。Excel文件不可以有合并单元格，表送必需在第一行，数据从第二行开始。表格开始在第一列。 "
    )
    icon = "table"
    name = "ExcelToDataFrame"

    inputs = [
        MessageInput (
            name="msg",
            display_name="带一个excel文件的消息msg",
            required=False,
            advanced=False,
            trace_as_input=True,
            info="带一个excel文件的消息msg",
        ),
        FileInput(
            name="excel_file",
            display_name="Message excel文件",
            required=False,
            advanced=False,
            # trace_as_input=True,
            file_types=["xlsx", "xls"],
            info="要转换为 DataFrame 的excel文件。",
        ),
        IntInput(
            name="sheet_index_start",
            display_name="Sheet Index Start",
            info="Excel表格的索引起, 从1开始。",
            value=0,
            advanced=True,
        ),
        IntInput(
            name="sheet_index_end",
            display_name="Sheet Index End",
            info="Excel表格的索引止, 从1开始。",
            value=0,
            advanced=True,
        ),
        IntInput(
            name="header",
            display_name="Header",
            value=0,
            advanced=False,
            info="Excel表格的表头所在行号, 从1开始，对应excel表第1行。",
        ),
        StrInput(
            name="encoding",
            display_name="编码集",
            info="Excel表格的编码集, 默认utf-8。如果读出来中文乱码，可以尝试gbk。",
            value="utf-8",
            advanced=True,
        ),

    ]

    outputs = [
        Output(

            display_name="Mackdown文本",
            name="dataframe",
            method="build_dataframe",
            info=" Mackdown文本。",
        ),
    ]

    def build_dataframe(self) -> DataFrame:
        """Builds a DataFrame from Data objects by combining their fields.

        For each Data object:
          - Merge item.data (dictionary) as columns
          - If item.text is present, add 'text' column

        Returns a DataFrame with one row per Data object.
        """
        excel_file =None
        if self.msg:
            # 如果msg中有excel文件，使用msg中的excel文件
            if hasattr(self.msg, "files") and self.msg.files:
                for file in self.msg.files:
                    if file.file_type in EXCEL_FILE_TYPES:
                        excel_file = file.file_path
                        break

        if not excel_file:
            excel_file = self.excel_file

        # 如果没有excel文件，报错
        if not excel_file:
            msg = "没有输入excel文件。"
            raise ValueError(msg)




        # 读取excel文件
        if not isinstance(excel_file, str):
            msg = f"应输入str对象, 但得到 {type(self.excel_file)}。"
            raise TypeError(msg)




        if not isinstance(excel_file, str):
            msg = f"应输入文件路径字符串, 但得到 {type(excel_file)}。"
            raise TypeError(msg)
        # raise TypeError(excel_file)

        row_df_dict = pd.read_excel(excel_file, header=self.header, sheet_name=None)

        ret_str = f"## {excel_file}\n\n"

        df_result = None
        for i in row_df_dict:
            # 排除全空行
            row_df_dict[i] = row_df_dict[i].dropna(how='all')
            # 排除全空列
            row_df_dict[i] = row_df_dict[i].dropna(axis=1, how='all')

            ret_str+= f"### {i}\n\n"
            ret_str += row_df_dict[i].to_markdown(index=False)
            ret_str += "\n\n"


        self.status = ret_str  # store in self.status for logs
        return ret_str
