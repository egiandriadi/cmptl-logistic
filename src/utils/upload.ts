import s3 from "../config/aws-config";
import { parse } from "csv-parse";
export const readExcelFile = async (fileName: string): Promise<any> => {
  const params = {
    Bucket: "dev-simantep",
    Key: fileName,
  };
  const headers = ["Total Tagihan", "Nilai Diskon", "Total Fee", "Beban Pajak"];
  const file = s3.getObject(params, (error, data) => {
    if (error) {
      console.log("🚀 ~ file ~ error:", error);
      return;
    }
    const fileContent = data.Body?.toString("utf-8");
    parse(
      fileContent!,
      {
        delimiter: ",",
        columns: headers,
      },
      (error: any, result: any) => {
        if (error) {
          console.error(error);
        }
        console.log("Result", result);
      }
    );
  });
};
